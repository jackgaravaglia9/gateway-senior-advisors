import { NextResponse } from "next/server";
import { UTM_FIELDS, type UtmField } from "@/lib/utm";
import {
  BUDGET_OPTIONS,
  CARE_TYPE_OPTIONS,
  DIAGNOSIS_OPTIONS,
  LIVING_SITUATION_OPTIONS,
  PAYMENT_OPTIONS,
  RELATIONSHIP_OPTIONS,
  TIMELINE_OPTIONS,
  needsDiagnosis,
} from "@/lib/intake-options";

export const runtime = "nodejs";

type RawPayload = Record<string, unknown>;

// Longest value accepted per text field. Required contact fields over the limit are rejected;
// free text and tracking strings are trimmed so a weird URL can never cost us a real lead.
const MAX_LENGTH = {
  fullName: 120,
  phone: 30,
  email: 254,
  age: 3,
  submittedAt: 40,
  utm: 200,
  gclid: 300,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Apps Script usually answers in 1-3 seconds but can take longer on a cold start. Past this we
// stop waiting and report failure instead of leaving the visitor hanging.
const WEBHOOK_TIMEOUT_MS = 8000;

const ZIP_RE = /^\d{5}$/;

interface CleanLead {
  relationship: string;
  age: string;
  careType: string;
  diagnosis: string;
  location: string;
  livingSituation: string;
  budget: string;
  payment: string;
  timeline: string;
  fullName: string;
  phone: string;
  email: string;
  contactConsent: boolean;
  shareConsent: boolean;
  submittedAt: string | null;
  utm: Record<UtmField, string>;
}

// Google Sheets runs a cell as a formula when it starts with = + - or @. Drop those (and any
// leading whitespace) and swap control characters for spaces before a value goes near the Sheet.
function cleanText(value: unknown): string {
  if (typeof value !== "string") return "";
  let spaced = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    spaced += code < 32 || code === 127 ? " " : ch;
  }
  return spaced.replace(/^[\s=+\-@]+/, "").trim();
}

function pickOption(options: string[], value: unknown): string {
  return typeof value === "string" && options.includes(value) ? value : "";
}

function normalizeSubmittedAt(value: unknown): string | null {
  if (typeof value !== "string" || value.length > MAX_LENGTH.submittedAt) return null;
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) return null;
  return cleanText(new Date(ms).toISOString());
}

function cleanAndValidate(payload: RawPayload): { lead: CleanLead | null; errors: string[] } {
  const errors: string[] = [];

  const relationship = pickOption(RELATIONSHIP_OPTIONS, payload.relationship);
  if (!relationship) errors.push("relationship is not an allowed value");

  const careType = pickOption(CARE_TYPE_OPTIONS, payload.careType);
  if (!careType) errors.push("careType is not an allowed value");

  // Required only for the care types that ask it. For every other care type the answer is
  // dropped to "" no matter what was sent.
  let diagnosis = "";
  if (needsDiagnosis(careType)) {
    diagnosis = pickOption(DIAGNOSIS_OPTIONS, payload.diagnosis);
    if (!diagnosis) errors.push("diagnosis is required for this care type");
  }

  const livingSituation = pickOption(LIVING_SITUATION_OPTIONS, payload.livingSituation);
  if (!livingSituation) errors.push("livingSituation is not an allowed value");

  const budget = pickOption(BUDGET_OPTIONS, payload.budget);
  if (!budget) errors.push("budget is not an allowed value");

  const payment = pickOption(PAYMENT_OPTIONS, payload.payment);
  if (!payment) errors.push("payment is not an allowed value");

  const timeline = pickOption(TIMELINE_OPTIONS, payload.timeline);
  if (!timeline) errors.push("timeline is not an allowed value");

  const age = typeof payload.age === "string" ? payload.age.trim() : "";
  if (!age || age.length > MAX_LENGTH.age || Number.isNaN(Number(age))) {
    errors.push("a valid age is required");
  }

  // "location" now holds a plain 5-digit ZIP code.
  const location = cleanText(payload.location);
  if (!ZIP_RE.test(location)) errors.push("location must be a 5-digit ZIP code");

  const fullName = cleanText(payload.fullName).slice(0, MAX_LENGTH.fullName).trim();
  if (!fullName) errors.push("fullName is required");

  const phone = cleanText(payload.phone);
  if (!phone || phone.length > MAX_LENGTH.phone) errors.push("a valid phone is required");

  const email = cleanText(payload.email);
  if (!email || email.length > MAX_LENGTH.email || !EMAIL_RE.test(email)) {
    errors.push("a valid email is required");
  }

  if (payload.contactConsent !== true) errors.push("contactConsent must be accepted");

  if (errors.length > 0) return { lead: null, errors };

  const utm = Object.fromEntries(
    UTM_FIELDS.map((field) => [
      field,
      cleanText(payload[field]).slice(0, field === "gclid" ? MAX_LENGTH.gclid : MAX_LENGTH.utm),
    ])
  ) as Record<UtmField, string>;

  return {
    errors,
    lead: {
      relationship,
      age,
      careType,
      diagnosis,
      location,
      livingSituation,
      budget,
      payment,
      timeline,
      fullName,
      phone,
      email,
      contactConsent: true,
      shareConsent: payload.shareConsent === true,
      submittedAt: normalizeSubmittedAt(payload.submittedAt),
      utm,
    },
  };
}

type SheetResult =
  | { ok: true; emailFailed: string | null }
  | { ok: false; reason: string };

// A lead counts as saved only when the Apps Script itself replies {"ok":true}. A 200 carrying
// an HTML error page (how Apps Script reports a crash) or {"ok":false} is a failure.
async function sendToSheet(url: string, body: unknown): Promise<SheetResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, reason: `http_${res.status}` };

    const text = await res.text();
    let reply: { ok?: unknown; error?: unknown; emailSent?: unknown; emailError?: unknown } | null;
    try {
      reply = JSON.parse(text);
    } catch {
      return { ok: false, reason: "non_json_response" };
    }
    if (!reply || reply.ok !== true) {
      const detail = typeof reply?.error === "string" ? reply.error.slice(0, 40) : "unknown";
      return { ok: false, reason: `script_reported_failure_${detail}` };
    }
    const emailFailed =
      reply.emailSent === false ? String(reply.emailError ?? "unknown").slice(0, 120) : null;
    return { ok: true, emailFailed };
  } catch (err) {
    const aborted = (err as { name?: string } | null)?.name === "AbortError";
    return { ok: false, reason: aborted ? "timeout" : "network_error" };
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  const receivedAt = new Date().toISOString();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lead, errors } = cleanAndValidate(payload as RawPayload);
  if (!lead) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
  }

  const webhookUrl = process.env.SHEET_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("SHEET_WEBHOOK_URL is not configured");
    return NextResponse.json(
      { error: "Server is not configured to accept submissions" },
      { status: 500 }
    );
  }

  const forwardPayload = {
    relationship: lead.relationship,
    age: lead.age,
    careType: lead.careType,
    diagnosis: lead.diagnosis,
    location: lead.location,
    livingSituation: lead.livingSituation,
    budget: lead.budget,
    payment: lead.payment,
    timeline: lead.timeline,
    fullName: lead.fullName,
    phone: lead.phone,
    email: lead.email,
    contactConsent: lead.contactConsent,
    shareConsent: lead.shareConsent,
    submittedAt: lead.submittedAt ?? receivedAt,
    receivedAt,
    ...lead.utm,
  };

  const result = await sendToSheet(webhookUrl, forwardPayload);
  if (!result.ok) {
    // No lead data in this log line, only why it failed.
    console.error("Lead was NOT recorded in the Sheet", { reason: result.reason });
    return NextResponse.json({ error: "Failed to record submission" }, { status: 502 });
  }
  if (result.emailFailed) {
    console.warn("Lead saved, but the alert email failed", { detail: result.emailFailed });
  }

  return NextResponse.json({ ok: true });
}

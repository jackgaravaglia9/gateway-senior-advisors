import { NextResponse } from "next/server";
import { UTM_FIELDS } from "@/lib/utm";

export const runtime = "nodejs";

interface SubmitPayload {
  relationship?: unknown;
  age?: unknown;
  careType?: unknown;
  location?: unknown;
  livingSituation?: unknown;
  budget?: unknown;
  timeline?: unknown;
  fullName?: unknown;
  phone?: unknown;
  email?: unknown;
  contactConsent?: unknown;
  shareConsent?: unknown;
  submittedAt?: unknown;
  [key: string]: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validate(payload: SubmitPayload): string[] {
  const errors: string[] = [];

  if (!isNonEmptyString(payload.relationship)) errors.push("relationship is required");
  if (!isNonEmptyString(payload.age) || Number.isNaN(Number(payload.age)))
    errors.push("a valid age is required");
  if (!isNonEmptyString(payload.careType)) errors.push("careType is required");

  if (!isNonEmptyString(payload.location)) errors.push("location is required");
  if (!isNonEmptyString(payload.livingSituation))
    errors.push("livingSituation is required");

  if (!isNonEmptyString(payload.budget)) errors.push("budget is required");
  if (!isNonEmptyString(payload.timeline)) errors.push("timeline is required");

  if (!isNonEmptyString(payload.fullName)) errors.push("fullName is required");
  if (!isNonEmptyString(payload.phone)) errors.push("phone is required");
  if (!isNonEmptyString(payload.email) || !EMAIL_RE.test(payload.email as string))
    errors.push("a valid email is required");
  if (payload.contactConsent !== true) errors.push("contactConsent must be accepted");

  return errors;
}

export async function POST(request: Request) {
  let payload: SubmitPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validate(payload);
  if (errors.length > 0) {
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
    relationship: payload.relationship,
    age: payload.age,
    careType: payload.careType,
    location: payload.location,
    livingSituation: payload.livingSituation,
    budget: payload.budget,
    timeline: payload.timeline,
    fullName: payload.fullName,
    phone: payload.phone,
    email: payload.email,
    contactConsent: payload.contactConsent === true,
    shareConsent: payload.shareConsent === true,
    submittedAt: isNonEmptyString(payload.submittedAt)
      ? payload.submittedAt
      : new Date().toISOString(),
    ...Object.fromEntries(UTM_FIELDS.map((field) => [field, payload[field] ?? ""])),
  };

  try {
    const webhookRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardPayload),
    });

    if (!webhookRes.ok) {
      console.error("Sheet webhook returned an error status", webhookRes.status);
      return NextResponse.json(
        { error: "Failed to record submission" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("Failed to reach sheet webhook", err);
    return NextResponse.json(
      { error: "Failed to record submission" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}

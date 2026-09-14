"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/gtag";
import { captureEvent } from "@/lib/posthog";
import { emptyUtmValues, UTM_FIELDS, type UtmValues } from "@/lib/utm";
import { emptyIntakeFormData, type IntakeFormData } from "@/lib/intake-form-types";

const TOTAL_STEPS = 4;

type Errors = Partial<Record<keyof IntakeFormData, string>>;

const RELATIONSHIP_OPTIONS = [
  "My parent",
  "My spouse",
  "Another relative",
  "Myself",
];

const CARE_TYPE_OPTIONS = [
  "Assisted living",
  "Memory care",
  "Independent living",
  "Skilled nursing",
  "Not sure yet",
];

const LIVING_SITUATION_OPTIONS = [
  "Living at home alone",
  "Living at home with family",
  "Currently in a hospital or rehab facility",
  "Already in a senior living community",
  "Other",
];

const BUDGET_OPTIONS = [
  "Under $3,000",
  "$3,000-$4,500",
  "$4,500-$6,000",
  "$6,000+",
  "Not sure yet",
];

const TIMELINE_OPTIONS = [
  "Immediately (within 30 days)",
  "1-3 months",
  "3-6 months",
  "Just researching for now",
];

function fieldClasses(hasError: boolean) {
  return `w-full border bg-white px-4 py-3.5 text-body placeholder:text-body-secondary/60 focus:outline-none focus:ring-2 focus:ring-gold/50 ${
    hasError ? "border-red-400" : "border-border"
  }`;
}

export default function IntakeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<IntakeFormData>(emptyIntakeFormData());
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const viewedSteps = useRef<Set<number>>(new Set());
  const formStarted = useRef(false);

  const utm = useMemo<UtmValues>(() => {
    const values = emptyUtmValues();
    for (const field of UTM_FIELDS) {
      values[field] = searchParams.get(field) ?? "";
    }
    return values;
  }, [searchParams]);

  useEffect(() => {
    if (viewedSteps.current.has(step)) return;
    viewedSteps.current.add(step);
    trackEvent("funnel_step_view", { step });
  }, [step]);

  function update<K extends keyof IntakeFormData>(key: K, value: IntakeFormData[K]) {
    if (!formStarted.current) {
      formStarted.current = true;
      captureEvent("form_started", { form_name: "intake_form" });
    }
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(currentStep: number): Errors {
    const next: Errors = {};
    if (currentStep === 1) {
      if (!data.relationship) next.relationship = "Please select one.";
      if (!data.age.trim()) next.age = "Please enter an age.";
      else if (Number.isNaN(Number(data.age)) || Number(data.age) <= 0)
        next.age = "Please enter a valid age.";
      if (!data.careType) next.careType = "Please select a care type.";
    }
    if (currentStep === 2) {
      if (!data.location.trim()) next.location = "Please enter a city, zip, or neighborhood.";
      if (!data.livingSituation) next.livingSituation = "Please select one.";
    }
    if (currentStep === 3) {
      if (!data.budget) next.budget = "Please select a budget range.";
      if (!data.timeline) next.timeline = "Please select a timeline.";
    }
    if (currentStep === 4) {
      if (!data.fullName.trim()) next.fullName = "Please enter your full name.";
      if (!data.phone.trim()) next.phone = "Please enter a phone number.";
      else if (!/^[\d()+\-.\s]{7,}$/.test(data.phone))
        next.phone = "Please enter a valid phone number.";
      if (!data.email.trim()) next.email = "Please enter an email address.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        next.email = "Please enter a valid email address.";
      if (!data.contactConsent)
        next.contactConsent = "Please check this box so we can follow up with you.";
    }
    return next;
  }

  function handleBack() {
    setSubmitError(null);
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleContinue() {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    trackEvent("funnel_step_complete", { step });

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    await submitForm();
  }

  async function submitForm() {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        ...data,
        ...utm,
        submittedAt: new Date().toISOString(),
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Submission failed");
      }

      trackEvent("generate_lead");
      captureEvent("form_submitted", { form_name: "intake_form" });
      router.push("/thank-you");
    } catch {
      setSubmitError(
        "Something went wrong submitting your information. Please try again — your answers are still here."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      id="intake-form"
      className="scroll-mt-8 border border-border bg-white p-6 sm:p-10 shadow-[0_1px_3px_rgba(34,49,41,0.06)]"
    >
      <ProgressIndicator step={step} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleContinue();
        }}
        className="mt-8"
      >
        {UTM_FIELDS.map((field) => (
          <input key={field} type="hidden" name={field} value={utm[field]} />
        ))}

        {step === 1 && (
          <fieldset className="space-y-8">
            <legend className="font-display text-2xl text-forest mb-2">
              About the parent
            </legend>

            <RadioGroup
              label="Relationship to the person needing care"
              name="relationship"
              options={RELATIONSHIP_OPTIONS}
              value={data.relationship}
              onChange={(v) => update("relationship", v)}
              error={errors.relationship}
            />

            <Field label="Age" htmlFor="age" error={errors.age}>
              <input
                id="age"
                type="number"
                min={0}
                inputMode="numeric"
                value={data.age}
                onChange={(e) => update("age", e.target.value)}
                className={fieldClasses(!!errors.age)}
              />
            </Field>

            <Field label="Care type needed" htmlFor="careType" error={errors.careType}>
              <select
                id="careType"
                value={data.careType}
                onChange={(e) => update("careType", e.target.value)}
                className={fieldClasses(!!errors.careType)}
              >
                <option value="">Select one</option>
                {CARE_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-8">
            <legend className="font-display text-2xl text-forest mb-2">
              Location & situation
            </legend>

            <Field
              label="Location in the St. Louis area"
              htmlFor="location"
              hint="City, zip, or neighborhood"
              error={errors.location}
            >
              <input
                id="location"
                type="text"
                value={data.location}
                onChange={(e) => update("location", e.target.value)}
                className={fieldClasses(!!errors.location)}
              />
            </Field>

            <RadioGroup
              label="Current living situation"
              name="livingSituation"
              options={LIVING_SITUATION_OPTIONS}
              value={data.livingSituation}
              onChange={(v) => update("livingSituation", v)}
              error={errors.livingSituation}
            />
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-8">
            <legend className="font-display text-2xl text-forest mb-2">
              Budget & timeline
            </legend>

            <Field label="Monthly budget" htmlFor="budget" error={errors.budget}>
              <select
                id="budget"
                value={data.budget}
                onChange={(e) => update("budget", e.target.value)}
                className={fieldClasses(!!errors.budget)}
              >
                <option value="">Select one</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>

            <RadioGroup
              label="Timeline"
              name="timeline"
              options={TIMELINE_OPTIONS}
              value={data.timeline}
              onChange={(v) => update("timeline", v)}
              error={errors.timeline}
            />
          </fieldset>
        )}

        {step === 4 && (
          <fieldset className="space-y-8">
            <legend className="font-display text-2xl text-forest mb-2">
              Contact & permission
            </legend>

            <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={data.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                className={fieldClasses(!!errors.fullName)}
              />
            </Field>

            <Field label="Phone" htmlFor="phone" error={errors.phone}>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                value={data.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={fieldClasses(!!errors.phone)}
              />
            </Field>

            <Field label="Email" htmlFor="email" error={errors.email}>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
                className={fieldClasses(!!errors.email)}
              />
            </Field>

            <div>
              <label className="flex items-start gap-3 text-body py-1 -my-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.contactConsent}
                  onChange={(e) => update("contactConsent", e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
                />
                <span>You may contact me about the options you find.</span>
              </label>
              {errors.contactConsent && (
                <p className="mt-1 text-sm text-red-600">{errors.contactConsent}</p>
              )}
            </div>

            <div>
              <label className="flex items-start gap-3 text-body py-1 -my-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.shareConsent}
                  onChange={(e) => update("shareConsent", e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-gold"
                />
                <span>
                  You may share my information with specific communities, but only after
                  I approve which ones.
                </span>
              </label>
            </div>
          </fieldset>
        )}

        {submitError && (
          <p className="mt-6 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-3.5 text-body-secondary hover:text-body transition-colors"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gold hover:bg-gold-light text-white px-8 py-3.5 font-medium transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Submitting…" : step === TOTAL_STEPS ? "Submit" : "Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProgressIndicator({ step }: { step: number }) {
  return (
    <div>
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 ${i < step ? "bg-gold" : "bg-border"}`}
          />
        ))}
      </div>
      <p className="mt-3 text-sm text-body-secondary">
        Step {step} of {TOTAL_STEPS}
      </p>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-body font-medium mb-2">
        {label}
      </label>
      {hint && <p className="text-sm text-body-secondary mb-2">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <span className="block text-body font-medium mb-2">{label}</span>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 border px-4 py-3.5 cursor-pointer transition-colors ${
              value === option ? "border-gold bg-cream-alt" : "border-border bg-white"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="h-5 w-5 shrink-0 accent-gold"
            />
            <span className="text-body">{option}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

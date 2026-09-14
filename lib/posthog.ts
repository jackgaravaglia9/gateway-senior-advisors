import posthog from "posthog-js";

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function captureEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) return;
  posthog.capture(eventName, properties);
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const GOOGLE_ADS_ID = "AW-18443867366";
export const GOOGLE_ADS_CONVERSION_LABEL = "OmmPCKfumvgcEOap3NpE";
export const GOOGLE_ADS_CONVERSION_SEND_TO = `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`;

type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(eventName: string, params?: GtagEventParams) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}

export function trackAdsConversion() {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", { send_to: GOOGLE_ADS_CONVERSION_SEND_TO });
}

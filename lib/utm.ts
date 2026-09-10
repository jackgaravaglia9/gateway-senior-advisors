export const UTM_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
] as const;

export type UtmField = (typeof UTM_FIELDS)[number];
export type UtmValues = Record<UtmField, string>;

export function emptyUtmValues(): UtmValues {
  return {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
    gclid: "",
  };
}

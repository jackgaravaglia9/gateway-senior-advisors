// Single source of truth for the intake form's fixed choices. The form renders these and
// /api/submit only accepts exactly these strings, so the two can never drift apart.

export const RELATIONSHIP_OPTIONS: string[] = [
  "My parent",
  "My spouse",
  "Another relative",
  "Myself",
];

export const CARE_TYPE_OPTIONS: string[] = [
  "Assisted living",
  "Memory care",
  "Independent living",
  "Skilled nursing",
  "Not sure yet",
];

export const LIVING_SITUATION_OPTIONS: string[] = [
  "Living at home alone",
  "Living at home with family",
  "Currently in a hospital or rehab facility",
  "Already in a senior living community",
  "Other",
];

export const BUDGET_OPTIONS: string[] = [
  "Under $4,500",
  "$4,500 to $6,500",
  "$6,500 to $7,500",
  "$7,500 to $10,000",
  "$10,000+",
  "Not sure yet",
];

export const TIMELINE_OPTIONS: string[] = [
  "Immediately (within 30 days)",
  "1-3 months",
  "3-6 months",
  "Just researching for now",
];

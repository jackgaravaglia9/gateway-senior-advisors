export interface IntakeFormData {
  relationship: string;
  age: string;
  careType: string;
  location: string;
  livingSituation: string;
  budget: string;
  timeline: string;
  fullName: string;
  phone: string;
  email: string;
  contactConsent: boolean;
  shareConsent: boolean;
}

export function emptyIntakeFormData(): IntakeFormData {
  return {
    relationship: "",
    age: "",
    careType: "",
    location: "",
    livingSituation: "",
    budget: "",
    timeline: "",
    fullName: "",
    phone: "",
    email: "",
    contactConsent: false,
    shareConsent: false,
  };
}

export interface IntakeFormData {
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
}

export function emptyIntakeFormData(): IntakeFormData {
  return {
    relationship: "",
    age: "",
    careType: "",
    diagnosis: "",
    location: "",
    livingSituation: "",
    budget: "",
    payment: "",
    timeline: "",
    fullName: "",
    phone: "",
    email: "",
    contactConsent: false,
    shareConsent: false,
  };
}

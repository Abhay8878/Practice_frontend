import type { Address } from "./patientType";

// Re-export Address for use in other files
export type { Address };

export const Specialization = {
  ORTHODONTICS: "Orthodontics",
  ENDODONTICS: "Endodontics",
  PERIODONTICS: "Periodontics",
  PROSTHODONTICS: "Prosthodontics",
  PEDIATRIC_DENTISTRY: "Pediatric Dentistry",
  ORAL_MAXILLOFACIAL_SURGERY: "Oral & Maxillofacial Surgery",
  RADIOLOGY: "Radiology",
  PATHOLOGY: "Pathology",
  PUBLIC_HEALTH: "Public Health",
  ANESTHESIOLOGY: "Anesthesiology",
} as const;

export type Specialization = (typeof Specialization)[keyof typeof Specialization];

export const PractitionerType = {
  ADMIN: "Admin",
  TEAM_MEMBER: "Team Member",
  PRACTICE: "Practice",
} as const;

export type PractitionerType = (typeof PractitionerType)[keyof typeof PractitionerType];

export type Staff = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: string;
  specialization?: Specialization;
  practitionerType: PractitionerType;
  address?: Address;
  addresses?: Address[]; // For API response with relations
};

export type Address = {
  house_no?: string;
  street?: string;
  city: string;
  state: string;
  country: string;
  countryCode?: string;
  zipCode: string;
  address_type?: string;
};

export type Patient = {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contact: string;
  dob: Date | null;
  gender: string;
  address?: Address;
  addresses?: Address[]; // For API response with relations
};

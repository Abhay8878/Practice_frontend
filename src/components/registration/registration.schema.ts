import { z } from "zod";

/* ---------- ADDRESS ---------- */
export const addressSchema = z.object({
    addressType: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    zip: z.string().optional(),
    zipCode: z.string().optional(),
    street: z.string().optional(),
    house_no: z.string().optional(),
});

/* ---------- MAIN FORM ---------- */
export const registrationSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .min(3, "First name must be at least 3 characters"),

    middleName: z.string().optional(),

    lastName: z
        .string()
        .min(1, "Last name is required")
        .min(3, "Last name must be at least 3 characters"),

    email: z.string().email("Invalid email must include @ and a valid domain (.com, .in, etc.)"),

    countryCode: z.string().min(1, "Country code is required"),
    phoneNumber: z
        .string()
        .min(10, "Phone number must be at least 10 digits")
        .max(14, "Phone number must be less than 15 digits")
        .regex(/^\d+$/, "Phone number must contain only digits"),

    specialization: z.string().optional(),

    practitionerType: z.string().optional(),

    addresses: z.array(addressSchema).min(1),
});


export type RegistrationFormValues = z.infer<
    typeof registrationSchema
>;

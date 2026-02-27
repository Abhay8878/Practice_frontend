import { ENABLE_DATA_MASKING } from "../../config/env";

export function maskEmail(email?: string): string {
    if (!email) return "-";
    if (!ENABLE_DATA_MASKING) return email;

    const [local, domain] = email.split("@");
    if (!domain || !local) return email;

    // If local part length < 4
    if (local.length < 4) {
        const firstChar = local.charAt(0);
        const starCount = Math.min(local.length - 1, 3);
        const masked = "*".repeat(starCount);
        return `${firstChar}${masked}@${domain}`;
    }

    // Length >= 4
    const firstTwo = local.slice(0, 2);
    const lastOne = local.slice(-1);

    const actualStarCount = local.length - 3;
    const starCount = Math.min(actualStarCount, 3);
    const maskedMiddle = "*".repeat(starCount);

    return `${firstTwo}${maskedMiddle}${lastOne}@${domain}`;
}

export function maskPhone(phone?: string): string {
    if (!phone) return "-";
    if (!ENABLE_DATA_MASKING) return phone;

    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 3) return phone;

    const first = digits[0];
    const lastTwo = digits.slice(-2);
    const maskedMiddle = "*".repeat(digits.length - 3);

    return `${first}${maskedMiddle}${lastTwo}`;
}

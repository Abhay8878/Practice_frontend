import { ENABLE_DATA_MASKING } from "../../../config/env";

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
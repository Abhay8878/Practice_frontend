import { maskEmail } from "./maskUtils";
import { useMasking } from "../../context/MaskingContext";

interface MaskedEmailProps {
    email?: string;
}

export default function MaskedEmail({ email }: MaskedEmailProps) {
    const { isMasked } = useMasking();

    if (!email) return <span>-</span>;

    return <span>{isMasked ? maskEmail(email) : email}</span>;
}

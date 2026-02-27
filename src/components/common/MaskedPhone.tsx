import { maskPhone } from "./maskUtils";
import { useMasking } from "../../context/MaskingContext";

interface MaskedPhoneProps {
    phone?: string;
}

export default function MaskedPhone({ phone }: MaskedPhoneProps) {
    const { isMasked } = useMasking();

    if (!phone) return <span>-</span>;

    return <span>{isMasked ? maskPhone(phone) : phone}</span>;
}

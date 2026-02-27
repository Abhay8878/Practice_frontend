import type { ReactNode } from "react";

interface RequiredLabelProps {
    children: ReactNode;
}

export default function RequiredLabel({ children }: RequiredLabelProps) {
    return (
        <span className="flex items-center gap-1">
            {children}
            <span className="text-red-500">*</span>
        </span>
    );
}

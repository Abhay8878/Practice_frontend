import React, { createContext, useContext, useState, useEffect } from "react";

interface MaskingContextType {
    isMasked: boolean;
    toggleMasking: () => void;
}

const MaskingContext = createContext<MaskingContextType | undefined>(undefined);

export const MaskingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMasked, setIsMasked] = useState<boolean>(() => {
        const saved = localStorage.getItem("isMasked");
        return saved ? JSON.parse(saved) : true;
    });

    const toggleMasking = () => {
        setIsMasked((prev) => !prev);
    };

    useEffect(() => {
        localStorage.setItem("isMasked", JSON.stringify(isMasked));
    }, [isMasked]);

    return (
        <MaskingContext.Provider value={{ isMasked, toggleMasking }}>
            {children}
        </MaskingContext.Provider>
    );
};

export const useMasking = () => {
    const context = useContext(MaskingContext);
    if (context === undefined) {
        throw new Error("useMasking must be used within a MaskingProvider");
    }
    return context;
};

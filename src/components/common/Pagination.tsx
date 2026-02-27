import { useLanguage } from "../../language/useLanguage";
import strings from "../../language/index";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    total,
    onPageChange,
    className = "",
}: PaginationProps) {
    const { language } = useLanguage();
    const t = strings[language];

    if (total === 0 || totalPages <= 1) return null;

    /* ---------- PAGE NUMBERS ---------- */
    const getPageNumbers = (): (number | "...")[] => {
        let middle: number[] = [];
        if (currentPage <= 3) {
            middle = [1, 2, 3];
        } else {
            middle = [currentPage - 2, currentPage - 1, currentPage];
        }

        // Filter out pages that exceed totalPages
        middle = middle.filter((p) => p <= totalPages);

        const pages: (number | "...")[] = [];

        // Add start page and ellipsis if the middle window doesn't start at 1
        if (middle.length > 0 && middle[0] > 1) {
            pages.push(1);
            if (middle[0] > 2) {
                pages.push("...");
            }
        }

        // Add the middle window
        pages.push(...middle);

        // Add end page and ellipsis if the middle window doesn't end at totalPages
        if (middle.length > 0) {
            const lastInMiddle = middle[middle.length - 1];
            if (lastInMiddle < totalPages) {
                if (lastInMiddle < totalPages - 1) {
                    pages.push("...");
                }
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className="flex items-center gap-4">
                {/* Previous */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`
                        flex items-center gap-1 px-2 py-1 text-sm font-medium transition-all duration-200
                        ${currentPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:text-gray-900 cursor-pointer active:scale-95"
                        }
                    `}
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.common?.previous || "Previous"}</span>
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                    {pageNumbers.map((pageNum, idx) =>
                        pageNum === "..." ? (
                            <span
                                key={`ellipsis-${idx}`}
                                className="px-2 text-sm font-medium text-gray-400"
                            >
                                ...
                            </span>
                        ) : (
                            <button
                                key={pageNum}
                                onClick={() => onPageChange(Number(pageNum))}
                                className={`
                                    min-w-[32px] h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200
                                    ${pageNum === currentPage
                                        ? "bg-white text-gray-900 border border-gray-100 shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }
                                `}
                            >
                                {pageNum}
                            </button>
                        ),
                    )}
                </div>

                {/* Next */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`
                        flex items-center gap-1 px-2 py-1 text-sm font-medium transition-all duration-200
                        ${currentPage === totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:text-gray-900 cursor-pointer active:scale-95"
                        }
                    `}
                >
                    <span>{t.common?.next || "Next"}</span>
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}


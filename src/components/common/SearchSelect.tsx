import { useEffect, useMemo, useRef, useState } from "react";

interface Option {
  label: string;
  value: string;
  flag?: string;
  countryName?: string;
}

interface SearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Option[];
  disabled?: boolean;
  className?: string; // ✅ already exists
}

export default function SearchSelect({
  value,
  onChange,
  placeholder,
  options,
  disabled,
  className, // ✅ ADD THIS HERE
}: SearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedOption = useMemo(() => {
    return options.find((o) => o.value === value);
  }, [options, value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();

    return options.filter((o) => {
      return (
        o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
      );
    });
  }, [options, search]);

  return (
    <div
      ref={ref}
      className={`relative w-full ${className ?? ""}`} // ✅ APPLY IT HERE
    >
      {/* DISPLAY */}
      <div
        onClick={() => {
          if (disabled) return;
          setSearch("");
          setOpen(true);
        }}
        className={`
            h-10
            w-full
            rounded-lg
            border
            border-gray-200
            bg-white
            px-3
            flex
            items-center
            justify-between
            cursor-pointer
            focus:outline-none
            transition-all
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {selectedOption ? (
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedOption.flag && (
              <img
                src={selectedOption.flag}
                alt={selectedOption.countryName || selectedOption.label}
                className="w-6 h-4 object-cover rounded-sm shrink-0"
              />
            )}
            <span className="text-sm font-medium text-gray-700 truncate">
              {selectedOption.flag
                ? selectedOption.value
                : selectedOption.label}
            </span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>

      {open && (
        <div
          className="
            absolute
            z-50
            mt-1
            w-[300px]
            max-h-[300px]
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
          "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="
                    w-full
                    rounded-lg
                    border-none
                    bg-gray-50
                    pl-9
                    pr-3
                    py-2
                    text-sm
                    outline-none
                    focus:ring-0
                    "
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No results
              </div>
            )}

            {filteredOptions.map((o) => (
              <div
                key={`${o.value}-${o.label}`}
                className="
                    flex items-center justify-between
                    px-3 py-2.5
                    cursor-pointer
                    rounded-lg
                    hover:bg-gray-50
                    transition-colors
                "
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {o.flag && (
                    <img
                      src={o.flag}
                      alt={o.countryName}
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-gray-100"
                    />
                  )}
                  <span className="text-sm text-gray-700 font-medium truncate">
                    {o.countryName || o.label}
                  </span>
                </div>

                {o.value !== o.label && o.value !== o.countryName && (
                  <span className="text-sm text-gray-500 font-medium ml-2 shrink-0">
                    {o.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

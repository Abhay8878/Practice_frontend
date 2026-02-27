import axios from "axios";
import { useEffect, useState } from "react";

/* ---------- TYPES ---------- */

export interface CountryCodeOption {
  value: string; // Country Name (unique identifier for Select)
  label: string; // Display label "Name (+Code)"
  code: string;  // The actual code "+1"
  flag: string;  // URL to flag image
  name: string;  // Country name
}

interface RestCountry {
  name: {
    common: string;
  };
  idd?: {
    root?: string;
    suffixes?: string[];
  };
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
}

/* ---------- HOOK ---------- */

export function useCountryCodes(): CountryCodeOption[] {
  const [codes, setCodes] = useState<CountryCodeOption[]>([]);

  useEffect(() => {
    axios
      .get<RestCountry[]>(
        "https://restcountries.com/v3.1/all?fields=name,idd,flags"
      )
      .then((res) => {
        const uniqueOptions = new Map<string, CountryCodeOption>();

        res.data.forEach((c) => {
          const root = c.idd?.root;
          const suffix = c.idd?.suffixes?.[0] ?? "";

          if (!root) return;

          const code = `${root}${suffix}`;
          const name = c.name.common;

          uniqueOptions.set(name, {
            value: name, // Use Name as unique value for Select
            label: `${name} (${code})`,
            code: code,
            flag: c.flags.svg || c.flags.png,
            name: name
          });
        });

        const list = Array.from(uniqueOptions.values())
          .sort((a, b) => a.name.localeCompare(b.name));

        setCodes(list);
      })
      .catch((err) => {
        console.error("Failed to fetch country codes", err);
        setCodes([]);
      });
  }, []);

  return codes;
}


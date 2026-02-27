import axios from "axios";
import { useEffect, useState } from "react";

export interface CountryOption {
  name: string;
  flag: string;
}

interface RestCountry {
  name: {
    common: string;
  };
  flags: {
    svg: string;
    png: string;
    alt: string;
  };
}

export function useCountries(): CountryOption[] {
  const [countries, setCountries] = useState<CountryOption[]>([]);

  useEffect(() => {
    axios
      .get<RestCountry[]>(
        "https://restcountries.com/v3.1/all?fields=name,flags"
      )
      .then((res) => {
        const list = res.data
          .map((c) => ({
            name: c.name.common,
            flag: c.flags.svg || c.flags.png,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(list);
      })
      .catch(() => setCountries([]));
  }, []);

  return countries;
}
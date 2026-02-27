import axios from "axios";
import { useEffect, useState } from "react";
 
export function useCities(country: string, state: string) {
  const [cities, setCities] = useState<string[]>([]);
 
  useEffect(() => {
    if (!country || !state) return;
 
    axios
      .post(
        "https://countriesnow.space/api/v0.1/countries/state/cities",
        { country, state }
      )
      .then((res) => setCities(res.data?.data ?? []))
      .catch(() => setCities([]));
  }, [country, state]);
 
  return cities;
}
 
import axios from "axios";
import { useEffect, useState } from "react";
 
/* ---------- TYPES ---------- */
 
interface StateItem {
  name: string;
}
 
interface StatesApiResponse {
  data?: {
    states?: StateItem[];
  };
}
 
export function useStates(country: string): string[] {
  const [states, setStates] = useState<string[]>([]);
 
  useEffect(() => {
    if (!country) return;
 
    let cancelled = false;
 
    axios
      .post<StatesApiResponse>(
        "https://countriesnow.space/api/v0.1/countries/states",
        { country }
      )
      .then((res) => {
        if (cancelled) return;
 
        const list =
          res.data.data?.states?.map((s) => s.name) ?? [];
        setStates(list); // ✅ async callback → allowed
      })
      .catch(() => {
        if (!cancelled) setStates([]);
      });
 
    return () => {
      cancelled = true;
    };
  }, [country]);
 
  return states;
}
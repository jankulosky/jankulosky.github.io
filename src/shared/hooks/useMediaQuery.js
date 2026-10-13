import { useEffect, useState } from "react";

const matchQuery = (query) =>
  typeof window !== "undefined" && window.matchMedia(query).matches;

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => matchQuery(query));

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export const useFinePointer = () => useMediaQuery(FINE_POINTER_QUERY);

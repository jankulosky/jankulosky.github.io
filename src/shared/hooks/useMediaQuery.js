import { useEffect, useState } from "react";
import { prefersReducedMotion, subscribeMotion } from "../motionPreference";

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

/** Honors the system setting unless the visitor picked a motion level with the nav toggle. */
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(prefersReducedMotion);
  useEffect(() => {
    const update = () => setReduced(prefersReducedMotion());
    update();
    return subscribeMotion(update);
  }, []);
  return reduced;
};

export const useFinePointer = () => useMediaQuery(FINE_POINTER_QUERY);

export { prefersReducedMotion };

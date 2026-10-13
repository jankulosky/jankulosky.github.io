export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const STORAGE_KEY = "vj-motion";
const listeners = new Set();

export const systemPrefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;

/** "full" | "reduced" | null (follow the system setting) */
export const getMotionOverride = () => {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "full" || value === "reduced" ? value : null;
};

export const prefersReducedMotion = () => {
  const override = getMotionOverride();
  if (override === "full") return false;
  if (override === "reduced") return true;
  return systemPrefersReducedMotion();
};

export const setMotionOverride = (value) => {
  if (value) window.localStorage.setItem(STORAGE_KEY, value);
  else window.localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
};

export const subscribeMotion = (listener) => {
  listeners.add(listener);
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener("change", listener);
  return () => {
    listeners.delete(listener);
    mql.removeEventListener("change", listener);
  };
};

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./useMediaQuery";

/** Counts from 0 to `value` the first time the returned ref scrolls into view. */
export const useCountUp = (value, { duration = 1600 } = {}) => {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [visible, value, duration]);

  return [ref, display];
};

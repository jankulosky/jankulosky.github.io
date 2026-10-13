import { useEffect, useState } from "react";
import { prefersReducedMotion } from "./useMediaQuery";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\";

/**
 * "Decodes" text left to right. Returns { revealed, noise, rest } so callers can
 * render `rest` invisibly and avoid layout shift while the text resolves.
 */
export const useScramble = (text, { speed = 2.2, noiseLength = 10 } = {}) => {
  const [progress, setProgress] = useState(() => (prefersReducedMotion() ? text.length : 0));
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setProgress(text.length);
      return undefined;
    }
    setProgress(0);
    let frame = 0;
    let current = 0;
    const step = () => {
      current = Math.min(text.length, current + speed);
      setProgress(current);
      setTick((value) => value + 1);
      if (current < text.length) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text, speed]);

  const cut = Math.floor(progress);
  const noiseEnd = Math.min(text.length, cut + noiseLength);
  let noise = "";
  for (let i = cut; i < noiseEnd; i += 1) {
    const char = text[i];
    noise +=
      char === " " ? " " : GLYPHS[(i * 7 + tick * 13) % GLYPHS.length];
  }

  return {
    revealed: text.slice(0, cut),
    noise,
    rest: text.slice(noiseEnd),
    done: cut >= text.length,
  };
};

import { useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Smooth scrolling driven by GSAP's ticker so ScrollTrigger stays in sync. */
export const useLenis = (options) => {
  const [lenis, setLenis] = useState(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      ...options,
    });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      instance.destroy();
      setLenis(null);
    };
    // Options are read once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return lenis;
};

export const scrollToSection = (lenis, id, { immediate = false, offset = 0 } = {}) => {
  const target = id === "home" ? 0 : document.getElementById(id);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, {
      immediate,
      offset,
      duration: 1.6,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    });
    return;
  }
  const top =
    target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
};

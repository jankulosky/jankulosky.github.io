import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiArrowRight, FiMenu, FiX, FiZap, FiZapOff } from "react-icons/fi";
import OrbitScene from "./OrbitScene";
import {
  About,
  Contact,
  Experience,
  Hero,
  Skills,
  Testimonials,
  Work,
} from "./OrbitSections";
import { usePortfolio } from "../../shared/hooks/usePortfolio";
import { useDesignShell } from "../../shared/hooks/useDesignShell";
import { scrollToSection, useLenis } from "../../shared/hooks/useLenis";
import { useSectionRouting } from "../../shared/hooks/useSectionRouting";
import { useActiveSection } from "../../shared/hooks/useActiveSection";
import { useCursorFollower } from "../../shared/hooks/useCursorFollower";
import { useFinePointer, useMediaQuery, useReducedMotion } from "../../shared/hooks/useMediaQuery";
import { REDUCED_MOTION_QUERY, setMotionOverride } from "../../shared/motionPreference";
import { PROFILE } from "../../shared/profile";
import "./orbit.scss";

const FONTS =
  "https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";

const SECTION_IDS = ["home", "about", "work", "skills", "experience", "testimonial", "contact"];

const NAV = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "skills", label: "Skills" },
  { id: "experience", label: "Experience" },
  { id: "testimonial", label: "Voices" },
];

const Orbit = () => {
  useDesignShell({ className: "is-orbit", fonts: FONTS, themeColor: "#04030b" });
  const data = usePortfolio();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const systemReduced = useMediaQuery(REDUCED_MOTION_QUERY);
  const finePointer = useFinePointer();
  const stageRef = useRef(null);
  const sceneRef = useRef(null);
  const mainRef = useRef(null);
  const cursorRef = useRef(null);
  const distanceRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(SECTION_IDS, data.status);

  useCursorFollower(cursorRef, { enabled: finePointer, ease: 0.24 });

  useEffect(() => {
    let scene = null;
    try {
      scene = new OrbitScene(stageRef.current, {
        reducedMotion: reduced,
        onIntroDone: () => setReady(true),
      });
      sceneRef.current = scene;
    } catch (error) {
      console.error(error);
      setReady(true);
    }
    return () => {
      if (scene) scene.dispose();
      sceneRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    const update = () => {
      if (!sceneRef.current) return;
      sceneRef.current.setAnchors(
        SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(mainRef.current);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [data.status, reduced]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (distanceRef.current) distanceRef.current.textContent = (progress * 4.2).toFixed(2);
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (menuOpen) lenis.stop();
    else lenis.start();
  }, [menuOpen, lenis]);

  const toggleMotion = () => {
    const next = reduced ? "full" : "reduced";
    setMotionOverride(next === (systemReduced ? "reduced" : "full") ? null : next);
  };

  const { linkProps } = useSectionRouting(
    (section, { initial }) => {
      setMenuOpen(false);
      scrollToSection(lenis, section, { immediate: Boolean(initial) });
    },
    { ready: data.status !== "loading" },
  );

  return (
    <div className={`orbit${ready ? " is-ready" : ""}`}>
      <div className="orbit__stage" ref={stageRef} aria-hidden="true" />
      <div className="orbit__veil" aria-hidden="true" />

      <div className={`orbit__intro${ready ? " is-done" : ""}`} aria-hidden="true">
        <p>› Establishing uplink</p>
        <p>› Target locked: {PROFILE.fullName}</p>
        <p>› Disengaging warp drive</p>
      </div>

      {finePointer && (
        <div className="orbit__cursor" ref={cursorRef} aria-hidden="true">
          <span />
        </div>
      )}

      <header className={`orbit__nav${scrolled ? " is-scrolled" : ""}`}>
        <a className="orbit__brand" {...linkProps("home")} aria-label="Back to top">
          <span className="orbit__logo" aria-hidden="true">
            <i />
          </span>
          <span className="orbit__brand-text">
            <strong>{PROFILE.fullName}</strong>
            <small>{PROFILE.role}</small>
          </span>
        </a>
        <nav className="orbit__links" aria-label="Sections">
          {NAV.map((item, index) => (
            <a
              key={item.id}
              className={active === item.id ? "is-active" : ""}
              {...linkProps(item.id)}
            >
              <span>0{index + 1}</span>
              {item.label}
            </a>
          ))}
        </nav>
        {systemReduced && (
          <button
            type="button"
            className="orbit__motion"
            onClick={toggleMotion}
            aria-pressed={!reduced}
            title={reduced ? "Animations are minimized — enable full motion" : "Reduce animations"}
          >
            {reduced ? <FiZapOff /> : <FiZap />}
            <span>{reduced ? "Motion off" : "Motion on"}</span>
          </button>
        )}
        <a className="orbit-btn orbit-btn--small orbit__cta" {...linkProps("contact")}>
          Get in touch <FiArrowRight />
        </a>
        <button
          type="button"
          className="orbit__burger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <FiMenu />
        </button>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="orbit__menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              className="orbit__menu-close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <FiX />
            </button>
            <nav>
              {[...NAV, { id: "contact", label: "Contact" }].map((item, index) => (
                <motion.a
                  key={item.id}
                  {...linkProps(item.id)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index + 0.1, duration: 0.5 }}
                >
                  <span>0{index + 1}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <p className="orbit-mono">{PROFILE.email}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="orbit__rail" aria-hidden="true">
        {SECTION_IDS.map((id) => (
          <span key={id} className={active === id ? "is-active" : ""} />
        ))}
        <div className="orbit__distance">
          <small>Dist</small>
          <b ref={distanceRef}>0.00</b>
          <small>AU</small>
        </div>
      </aside>

      <main className="orbit__main" ref={mainRef}>
        <Hero data={data} linkProps={linkProps} />
        <About data={data} />
        <Work data={data} />
        <Skills data={data} />
        <Experience data={data} />
        <Testimonials data={data} />
        <Contact
          linkProps={linkProps}
          onLaunch={() => sceneRef.current && sceneRef.current.warpPulse()}
        />
      </main>
    </div>
  );
};

export default Orbit;

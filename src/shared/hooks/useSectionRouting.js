import { useCallback, useEffect, useRef } from "react";
import {
  getCurrentSectionFromPath,
  getPathForSection,
  setSectionPath,
  shouldHandleClientNav,
} from "../sectionNavigation";

/**
 * Wires the /about, /work … deep links into a design.
 * `onNavigate(section, { initial, pop })` decides what "going to a section"
 * means for that design (scrolling, opening a window, …). The initial deep
 * link is applied once `ready` is true so layouts have their content.
 */
export const useSectionRouting = (onNavigate, { ready = true } = {}) => {
  const handlerRef = useRef(onNavigate);
  handlerRef.current = onNavigate;
  const initialised = useRef(false);

  useEffect(() => {
    if (!ready || initialised.current) return undefined;
    const section = getCurrentSectionFromPath();
    if (section === "home") {
      initialised.current = true;
      return undefined;
    }
    // Give the browser a moment to lay out freshly rendered content.
    const id = window.setTimeout(() => {
      initialised.current = true;
      handlerRef.current(section, { initial: true });
    }, 120);
    return () => window.clearTimeout(id);
  }, [ready]);

  useEffect(() => {
    const onPop = () =>
      handlerRef.current(getCurrentSectionFromPath(), { pop: true });
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((section, options = {}) => {
    setSectionPath(section, options);
    handlerRef.current(section, options);
  }, []);

  const linkProps = useCallback(
    (section) => ({
      href: getPathForSection(section),
      onClick: (event) => {
        if (!shouldHandleClientNav(event)) return;
        event.preventDefault();
        navigate(section);
      },
    }),
    [navigate],
  );

  return { navigate, linkProps };
};

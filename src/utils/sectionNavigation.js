import { ALL_SECTIONS } from "../constants";

const normalizePathname = (pathname) => pathname.replace(/\/+$/, "") || "/";

export const getCurrentSectionFromPath = () => {
  const normalized = normalizePathname(window.location.pathname);
  const segments = normalized.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) return "home";
  if (ALL_SECTIONS.includes(lastSegment)) return lastSegment;
  return "home";
};

export const getBasePath = () => {
  const normalized = normalizePathname(window.location.pathname);
  const segments = normalized.split("/").filter(Boolean);

  if (!segments.length) return "";

  const lastSegment = segments[segments.length - 1];
  if (ALL_SECTIONS.includes(lastSegment)) segments.pop();

  return segments.length ? `/${segments.join("/")}` : "";
};

export const getPathForSection = (section) => {
  const basePath = getBasePath();
  return section === "home" ? `${basePath}/` : `${basePath}/${section}`;
};

export const navigateToSection = (section, options = {}) => {
  const { replace = false, behavior = "smooth" } = options;
  const nextPath = getPathForSection(section);
  const currentPath = normalizePathname(window.location.pathname);
  const normalizedNextPath = normalizePathname(nextPath);

  if (currentPath !== normalizedNextPath) {
    const stateMethod = replace ? "replaceState" : "pushState";
    window.history[stateMethod]({}, "", nextPath);
  }

  const sectionNode = document.getElementById(section);
  if (sectionNode) {
    sectionNode.scrollIntoView({ behavior, block: "start" });
  } else {
    window.scrollTo({ top: 0, behavior });
  }
};

export const shouldHandleClientNav = (event) =>
  !(
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.shiftKey
  );

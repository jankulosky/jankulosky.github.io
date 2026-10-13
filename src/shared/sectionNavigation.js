export const SECTIONS = [
  "home",
  "about",
  "work",
  "skills",
  "experience",
  "testimonial",
  "contact",
];

const normalizePathname = (pathname) => pathname.replace(/\/+$/, "") || "/";

const getSegments = () =>
  normalizePathname(window.location.pathname).split("/").filter(Boolean);

export const getCurrentSectionFromPath = () => {
  const segments = getSegments();
  const lastSegment = segments[segments.length - 1];
  return SECTIONS.includes(lastSegment) ? lastSegment : "home";
};

export const getBasePath = () => {
  const segments = getSegments();
  if (SECTIONS.includes(segments[segments.length - 1])) segments.pop();
  return segments.length ? `/${segments.join("/")}` : "";
};

const getPathnameForSection = (section) => {
  const basePath = getBasePath();
  return section === "home" ? `${basePath}/` : `${basePath}/${section}`;
};

// Keeps the query string so ?design=… survives section navigation.
export const getPathForSection = (section) =>
  `${getPathnameForSection(section)}${window.location.search}`;

export const setSectionPath = (section, { replace = false } = {}) => {
  const nextPathname = getPathnameForSection(section);
  if (
    normalizePathname(window.location.pathname) ===
    normalizePathname(nextPathname)
  ) {
    return;
  }
  const method = replace ? "replaceState" : "pushState";
  window.history[method]({}, "", `${nextPathname}${window.location.search}`);
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

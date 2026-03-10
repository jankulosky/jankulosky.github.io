const THEME_STORAGE_KEY = "vk-portfolio-theme";

export const THEME_DARK = "dark";
export const THEME_LIGHT = "light";

const canUseDOM = () => typeof window !== "undefined" && typeof document !== "undefined";

export const getInitialTheme = () => {
  if (!canUseDOM()) return THEME_DARK;

  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return saved === THEME_LIGHT ? THEME_LIGHT : THEME_DARK;
};

export const applyTheme = (nextTheme, options = {}) => {
  if (!canUseDOM()) return;

  const { animate = true, origin } = options;
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (origin && typeof origin.x === "number" && typeof origin.y === "number") {
    root.style.setProperty("--theme-origin-x", `${origin.x}px`);
    root.style.setProperty("--theme-origin-y", `${origin.y}px`);
  }

  const shouldAnimate = animate && !reduceMotion;

  if (shouldAnimate) {
    root.classList.remove("theme-switching");
    void root.offsetWidth;
    root.classList.add("theme-switching");
  }

  // Change theme on next frame so transitions are visible.
  window.requestAnimationFrame(() => {
    root.setAttribute("data-theme", nextTheme);
  });

  if (shouldAnimate) {
    window.setTimeout(() => {
      root.classList.remove("theme-switching");
    }, 800);
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
};

export const getNextTheme = (currentTheme) =>
  currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;


import { useEffect } from "react";

/**
 * Applies document-level settings for the active design: a class on <html>
 * (so each design can style html/body without leaking into the others),
 * its Google Fonts stylesheet and the browser theme color.
 */
export const useDesignShell = ({ className, fonts, themeColor }) => {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(className);

    if (fonts && !document.querySelector(`link[data-design-font="${className}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = fonts;
      link.dataset.designFont = className;
      document.head.appendChild(link);
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    const previousColor = meta ? meta.getAttribute("content") : null;
    if (meta && themeColor) meta.setAttribute("content", themeColor);

    return () => {
      root.classList.remove(className);
      if (meta && previousColor) meta.setAttribute("content", previousColor);
    };
  }, [className, fonts, themeColor]);
};

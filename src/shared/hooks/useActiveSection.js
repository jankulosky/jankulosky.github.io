import { useEffect, useState } from "react";

/**
 * Tracks which section currently crosses the middle of the viewport.
 * `refreshKey` re-binds the observer when sections render late (e.g. after data loads).
 */
export const useActiveSection = (ids, refreshKey) => {
  const idsKey = ids.join("|");
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const elements = idsKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [idsKey, refreshKey]);

  return active;
};

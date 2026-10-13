import { useEffect } from "react";

/**
 * Moves `ref` towards the pointer every frame. Adds `is-visible` while the
 * pointer is in the window and `is-hover` (+ data-label from [data-cursor])
 * over interactive elements.
 */
export const useCursorFollower = (
  ref,
  { enabled = true, ease = 0.2, hoverSelector = "a, button, [data-cursor]" } = {},
) => {
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return undefined;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;
    let frame = 0;

    const onMove = (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      element.classList.add("is-visible");
    };
    const onOver = (event) => {
      const target = event.target.closest ? event.target.closest(hoverSelector) : null;
      element.classList.toggle("is-hover", Boolean(target));
      element.dataset.label = (target && target.dataset.cursor) || "";
    };
    const onLeave = () => element.classList.remove("is-visible");
    const onDown = () => element.classList.add("is-down");
    const onUp = () => element.classList.remove("is-down");

    const loop = () => {
      x += (targetX - x) * ease;
      y += (targetY - y) * ease;
      element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, enabled, ease, hoverSelector]);
};

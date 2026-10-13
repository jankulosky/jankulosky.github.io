import React, { useLayoutEffect } from "react";
import Orbit from "./designs/orbit/Orbit";
import { useReducedMotion } from "./shared/hooks/useMediaQuery";

const App = () => {
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
    window.scrollTo(0, 0);
  }, [reducedMotion]);

  // Remounting restarts the scene, smooth scrolling and intro with the new motion setting.
  return <Orbit key={reducedMotion ? "calm" : "full"} />;
};

export default App;

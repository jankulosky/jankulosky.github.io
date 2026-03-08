import React, { useEffect } from "react";
import { About, Footer, Header, Skills, Testimonial, Work } from "./sections";
import { Navbar } from "./components";
import {
  getCurrentSectionFromPath,
  navigateToSection,
} from "./utils/sectionNavigation";
import "./App.scss";

const App = () => {
  useEffect(() => {
    const syncSectionWithPath = (replace = false) => {
      const section = getCurrentSectionFromPath();
      const behavior = replace ? "auto" : "smooth";
      navigateToSection(section, { replace, behavior });
    };

    syncSectionWithPath(true);

    const handlePopState = () => syncSectionWithPath(false);
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  return (
    <div className="app">
      <Navbar />
      <Header />
      <About />
      <Work />
      <Skills />
      <Testimonial />
      <Footer />
    </div>
  );
};

export default App;

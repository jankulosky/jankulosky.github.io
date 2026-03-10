import React, { useState } from "react";
import { HiMenuAlt4, HiX } from "react-icons/hi";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { motion } from "framer-motion";

import { images, NAV_SECTIONS } from "../../constants";
import {
  getPathForSection,
  navigateToSection,
  shouldHandleClientNav,
} from "../../utils/sectionNavigation";
import {
  applyTheme,
  getInitialTheme,
  getNextTheme,
  THEME_DARK,
} from "../../utils/theme";
import "./Navbar.scss";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const [theme, setTheme] = useState(getInitialTheme);
  const sections = NAV_SECTIONS;

  const handleNavClick = (event, section, closeMenu = false) => {
    if (!shouldHandleClientNav(event)) return;

    event.preventDefault();
    navigateToSection(section);

    if (closeMenu) setToggle(false);
  };

  const handleThemeToggle = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };

    setTheme((currentTheme) => {
      const nextTheme = getNextTheme(currentTheme);
      applyTheme(nextTheme, { origin });
      return nextTheme;
    });
  };

  return (
    <nav className="app__navbar">
      <div className="app__navbar-logo">
        <a
          className="logo-orbit"
          href={getPathForSection("home")}
          aria-label="Go to top"
          onClick={(event) => handleNavClick(event, "home")}
        >
          <img src={images.astronaut} alt="logo" />
        </a>
      </div>
      <ul className="app__navbar-links">
        {sections.map((item) => (
          <li className="app__flex p-text" key={`link-${item}`}>
            <div />
            <a
              href={getPathForSection(item)}
              onClick={(event) => handleNavClick(event, item)}
            >
              {item}
            </a>
          </li>
        ))}
      </ul>

      <div className="app__navbar-actions">
        <button
          type="button"
          className="app__theme-toggle"
          onClick={handleThemeToggle}
          aria-label={`Switch to ${theme === THEME_DARK ? "light" : "dark"} mode`}
          title={`Switch to ${theme === THEME_DARK ? "light" : "dark"} mode`}
        >
          {theme === THEME_DARK ? <BsSunFill /> : <BsMoonStarsFill />}
        </button>

        <div className="app__navbar-menu">
          <HiMenuAlt4 onClick={() => setToggle(true)} />

          {toggle && (
            <motion.div
              whileInView={{ x: [300, 0] }}
              transition={{ duration: 0.85, ease: "easeOut" }}
            >
              <HiX onClick={() => setToggle(false)} />
              <ul>
                {sections.map((item) => (
                  <li key={item}>
                    <a
                      href={getPathForSection(item)}
                      onClick={(event) => handleNavClick(event, item, true)}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

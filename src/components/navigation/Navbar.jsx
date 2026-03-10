import React, { useState } from "react";
import { HiMenuAlt4, HiX } from "react-icons/hi";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

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

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { x: 16, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  const mobileMenuOverlay = (
    <AnimatePresence>
      {toggle && (
        <>
          <motion.button
            type="button"
            className="app__navbar-menu-backdrop"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setToggle(false)}
          />

          <motion.aside
            className="app__navbar-menu-panel"
            initial={{ x: "105%", opacity: 0.85, scale: 0.98 }}
            animate={{ x: "0%", opacity: 1, scale: 1 }}
            exit={{ x: "105%", opacity: 0.85, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="app__navbar-menu-close"
              onClick={() => setToggle(false)}
              aria-label="Close menu"
            >
              <HiX />
            </button>

            <motion.ul variants={listVariants} initial="hidden" animate="visible">
              {sections.map((item) => (
                <motion.li key={item} variants={itemVariants}>
                  <a
                    href={getPathForSection(item)}
                    onClick={(event) => handleNavClick(event, item, true)}
                  >
                    {item}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

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
    <>
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
            <button
              type="button"
              className="app__navbar-menu-trigger"
              aria-label="Open menu"
              onClick={() => setToggle(true)}
            >
              <HiMenuAlt4 />
            </button>
          </div>
        </div>
      </nav>
      {createPortal(mobileMenuOverlay, document.body)}
    </>
  );
};

export default Navbar;

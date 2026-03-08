import React, { useState } from "react";
import { HiMenuAlt4, HiX } from "react-icons/hi";
import { motion } from "framer-motion";

import { images, NAV_SECTIONS } from "../../constants";
import {
  getPathForSection,
  navigateToSection,
  shouldHandleClientNav,
} from "../../utils/sectionNavigation";
import "./Navbar.scss";

const Navbar = () => {
  const [toggle, setToggle] = useState(false);
  const sections = NAV_SECTIONS;

  const handleNavClick = (event, section, closeMenu = false) => {
    if (!shouldHandleClientNav(event)) return;

    event.preventDefault();
    navigateToSection(section);

    if (closeMenu) setToggle(false);
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
    </nav>
  );
};

export default Navbar;

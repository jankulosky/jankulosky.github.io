import React from "react";
import { NAV_SECTIONS } from "../../constants";
import {
  getPathForSection,
  navigateToSection,
  shouldHandleClientNav,
} from "../../utils/sectionNavigation";

const NavigationDots = ({ active }) => (
  <div className="app__navigation">
    {NAV_SECTIONS.map((item, index) => (
      <a
        href={getPathForSection(item)}
        key={item + index}
        className="app__navigation-dot"
        onClick={(event) => {
          if (!shouldHandleClientNav(event)) return;
          event.preventDefault();
          navigateToSection(item);
        }}
        style={
          active === item ? { backgroundColor: "var(--accent-color)" } : {}
        }
      >
        {" "}
      </a>
    ))}
  </div>
);

export default NavigationDots;

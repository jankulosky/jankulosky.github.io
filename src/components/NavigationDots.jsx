import React from "react";

const NavigationDots = ({ active }) => (
  <div className="app__navigation">
    {["home", "about", "work", "skills", "contact"].map((item, index) => (
      <a
        href={`#${item}`}
        key={item + index}
        className="app__navigation-dot"
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

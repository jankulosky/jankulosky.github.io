import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppWrap } from "../../wrapper";
import { images } from "../../constants";
import headerImg from "../../assets/header-img.svg";
import AnimatedLetters from "../../components/AnimatedLetters";
import "./Header.scss";
import "animate.css";

const Header = () => {
  const [letterClass, setLetterClass] = useState("text-animate");
  const greetingArray = ["I", "'", "m"];
  const nameArray = ["V", "i", "k", "t", "o", "r"];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLetterClass("text-animate-hover");
    }, 4000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="hero">
      <div className="hero__frame">
        <motion.div
          whileInView={{ y: [28, 0], opacity: [0, 1] }}
          transition={{ duration: 0.7 }}
          className="hero__copy"
        >
          <div className="hero__badge">
            <span className={`letterClass ${letterClass} hero__hi`}>Hi</span>
            <span className="hero__pulse" aria-hidden="true" />
          </div>

          <h1 className="hero__title hero__title--glow">
            <span className="hero__title-line">
              <AnimatedLetters
                letterClass={letterClass}
                strArray={greetingArray}
                idx={15}
              />
              <AnimatedLetters
                letterClass={letterClass}
                strArray={nameArray}
                idx={15}
              />
            </span>
          </h1>

          <p className="hero__subtitle">
            Full-stack software developer with a Bachelor's in Computer Science,
            passionate about building and delivering high-quality software
            solutions using proven methodologies/practices and technologies.
          </p>

          <div className="hero__cta">
            <a className="hero__primary" href="#work">
              View Projects
            </a>
            <a className="hero__secondary" href="#contact">
              Let’s Connect
            </a>
          </div>

          <div className="hero__signals">
            <div>
              <span>Back-end</span>
              <p>.NET · Node.js</p>
            </div>
            <div>
              <span>Front-end</span>
              <p>Angular · React · Next.js</p>
            </div>
            <div>
              <span>Location</span>
              <p>EU · Remote</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileInView={{ opacity: [0, 1], y: [20, 0] }}
          transition={{ duration: 0.8 }}
          className="hero__visual"
        >
          <div className="hero__avatar">
            <img src={headerImg} alt="astronaut" />
            <div className="hero__ring" />
          </div>
          <div className="hero__chips">
            {[images.angular, images.dotnet, images.react].map(
              (chip, index) => (
                <div className="hero__chip" key={`chip-${index}`}>
                  <img src={chip} alt="tech" />
                </div>
              ),
            )}
          </div>
        </motion.div>
      </div>

      <div className="hero__marquee">
        <span>Design Systems</span>
        <span>API Integration</span>
        <span>UX Engineering</span>
        <span>Performance</span>
      </div>
    </div>
  );
};

export default AppWrap(Header, "home");

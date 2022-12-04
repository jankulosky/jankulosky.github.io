import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { AppWrap } from "../../wrapper";
import { images } from "../../constants";
import headerImg from "../../assets/header-img.svg";
import AnimatedLetters from "../../components/AnimatedLetters";
import "./Header.scss";
import "animate.css";
import { useEffect } from "react";

const scaleVariants = {
  whileInView: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 1,
      ease: "easeInOut",
    },
  },
};

const Header = () => {
  const [letterClass, setLetterClass] = useState("text-animate");
  const nameArray = ["V", "i", "k", "t", "o", "r"];

  useEffect(() => {
    return setTimeout(() => {
      setLetterClass("text-animate-hover");
    }, 4000);
  }, []);

  return (
    <div className="app__header app__flex">
      <motion.div
        whileInView={{ x: [-100, 0], opacity: [0, 1] }}
        transition={{ duration: 0.5 }}
        className="app__header-info"
      >
        <div className="app__header-badge">
          <div className="badge-cmp app__flex">
            <div style={{ marginLeft: 20 }}>
              <p className="p-intro">
                <span className={letterClass}>H</span>
                <span className={`${letterClass} _10`}>i</span>
                <span className={`${letterClass} _11`}>,</span>
                <span className={`${letterClass} _12`}>I</span>
                <span className={`${letterClass} _13`}>'</span>
                <span className={`${letterClass} _14`}>m</span>
              </p>
              <h1 className="intro-text">
                <AnimatedLetters
                  letterClass={letterClass}
                  strArray={nameArray}
                  idx={15}
                />
              </h1>
            </div>
          </div>

          <div className="tag-cmp app__flex">
            <p className="p-text">Nebbonaut</p>
            <p className="p-text">Software Developer</p>
            <p className="p-text">Trained in ReactJS and Angular</p>
          </div>
        </div>
      </motion.div>

      <div className="header">
        <motion.div
          whileInView={{ opacity: [0, 1] }}
          transition={{ duration: 0.5, delayChildren: 0.5 }}
          className="app__header-img animate__animated animate__zoomIn"
        >
          <img src={headerImg} alt="profile_bg" />
          <motion.img
            whileInView={{ scale: [0, 1] }}
            transition={{ duration: 1, ease: "easeInOut" }}
            src={images.circle}
            alt="profile_circle"
            className="overlay_circle"
          />
        </motion.div>
      </div>

      <motion.div
        variants={scaleVariants}
        whileInView={scaleVariants.whileInView}
        className="app__header-circles"
      >
        {[images.angular, images.dotnet, images.react].map((circle, index) => (
          <div className="circle-cmp app__flex" key={`circle-${index}`}>
            <img src={circle} alt="profile_bg" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AppWrap(Header, "home");

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppWrap, MotionWrap } from "../../layout";
import "./About.scss";
import { urlFor } from "../../client";
import { fetchAbouts } from "../../services/portfolioData";

const About = () => {
  const [abouts, setAbouts] = useState([]);

  useEffect(() => {
    fetchAbouts().then((data) => {
      setAbouts(data);
    });
  }, []);

  return (
    <>
      <div className="about__hero">
        <div className="section__heading">
          <p className="section__eyebrow">About</p>
          <h2 className="section__title">
            I Know that <span>Good Development</span> <br />
            means <span>Good Business</span>
          </h2>
        </div>
      </div>

      <div className="about__grid">
        {abouts.map((about, index) => (
          <motion.div
            whileInView={{ opacity: 1 }}
            whileHover={{ y: -10 }}
            transition={{ duration: 0.4, type: "tween" }}
            className="about__card"
            key={about.title + index}
          >
            <div className="about__media">
              <img src={urlFor(about.imgUrl)} alt={about.title} />
            </div>
            <div className="about__content">
              <h3>{about.title}</h3>
              <p>{about.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(About, "app__about"),
  "about",
  "app__whitebg"
);

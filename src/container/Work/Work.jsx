import React, { useState, useEffect } from "react";
import { AiFillEye, AiFillGithub } from "react-icons/ai";
import { motion } from "framer-motion";

import { AppWrap, MotionWrap } from "../../wrapper";
import { urlFor, client } from "../../client";
import "./Work.scss";

const Work = () => {
  const [works, setWorks] = useState([]);
  const [filterWork, setFilterWork] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [animateCard, setAnimateCard] = useState({ y: 0, opacity: 1 });

  useEffect(() => {
    const query = '*[_type == "works"]';

    client.fetch(query).then((data) => {
      setWorks(data);
      setFilterWork(data);
    });
  }, []);

  const handleWorkFilter = (item) => {
    setActiveFilter(item);
    setAnimateCard([{ y: 100, opacity: 0 }]);

    setTimeout(() => {
      setAnimateCard([{ y: 0, opacity: 1 }]);

      if (item === "All") {
        setFilterWork(works);
      } else {
        setFilterWork(works.filter((work) => work.tags.includes(item)));
      }
    }, 500);
  };

  return (
    <>
      <div className="work__hero">
        <div className="section__heading">
          <p className="section__eyebrow">Personal Projects</p>
          <h2 className="section__title">
            My Work <span>Projects</span>
          </h2>
        </div>
      </div>

      <div className="app__work-filter work__filter">
        {[
          "React",
          "Angular",
          ".NET & Angular",
          "Node.js & React",
          "Spring & React",
          "All",
        ].map((item, index) => (
          <div
            key={index}
            onClick={() => handleWorkFilter(item)}
            className={`app__work-filter-item app__flex p-text ${
              activeFilter === item ? "item-active" : ""
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      <motion.div
        animate={animateCard}
        transition={{ duration: 0.5, delayChildren: 0.5 }}
        className="work__showcase"
      >
        {filterWork.map((work, index) => (
          <div className="work__card" key={index}>
            <div className="work__media">
              <img src={urlFor(work.imgUrl)} alt={work.name} />
              <div className="work__glass">
                <span>{work.tags && work.tags[0]}</span>
              </div>
            </div>

            <div className="work__content">
              <div>
                <h4>{work.title}</h4>
                <p>{work.description}</p>
              </div>
              <div className="work__links">
                <a href={work.projectLink} target="_blank" rel="noreferrer">
                  <AiFillEye />
                  Live Site
                </a>
                <a href={work.codeLink} target="_blank" rel="noreferrer">
                  <AiFillGithub />
                  Source Code
                </a>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Work, "app__works"),
  "work",
  "app__primarybg",
);

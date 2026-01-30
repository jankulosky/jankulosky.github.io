import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ReactTooltip from "react-tooltip";

import { AppWrap, MotionWrap } from "../../wrapper";
import { urlFor, client } from "../../client";
import "./Skills.scss";

const Skills = () => {
  const [experiences, setExperiences] = useState([]);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const query = '*[_type == "experiences"]';
    const skillsQuery = '*[_type == "skills"]';

    client.fetch(query).then((data) => {
      const sortedData = [...data].sort(
        (a, b) => Number(b.year) - Number(a.year),
      );
      setExperiences(sortedData);
    });

    client.fetch(skillsQuery).then((data) => {
      setSkills(data);
    });
  }, []);

  return (
    <>
      <div className="skills__hero">
        <div className="section__heading">
          <p className="section__eyebrow">Toolkit</p>
          <h2 className="section__title">
            Skills & <span>Experience</span>
          </h2>
        </div>
        <p className="p-text">
          Modern frontend craftsmanship with a focus on reliable delivery and
          clean architecture.
        </p>
        <div className="skills__hero-badges">
          <span>Programming Languages</span>
          <span>Databases & Cloud</span>
          <span>Frameworks & Libraries</span>
          <span>Version control & Tools</span>
        </div>
      </div>

      <div className="skills__layout">
        <motion.div className="skills__skills-board">
          <div className="skills__board-head">
            <h3>Expertise</h3>
            <p className="p-text">
              Curated set of tools I use to design, ship and scale products.
            </p>
          </div>
          <div className="skills__chip-grid">
            {skills.map((skill) => (
              <motion.div
                whileInView={{ opacity: [0, 1] }}
                transition={{ duration: 0.5 }}
                className="skills__chip"
                key={skill.name}
              >
                <div
                  className="skills__chip-icon"
                  style={{ backgroundColor: skill.bgColor }}
                >
                  <img src={urlFor(skill.icon)} alt={skill.name} />
                </div>
                <div className="skills__chip-meta">
                  <p className="skills__chip-name">{skill.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div className="skills__exp-panel">
          <div className="skills__board-head">
            <h3>Professional Experience</h3>
            <p className="p-text">
              A snapshot of my career timeline including my most recent roles.
            </p>
          </div>
          <div className="skills__exp-list">
            {experiences.map((experience) => (
              <motion.div className="skills__exp-item" key={experience.year}>
                <div className="skills__exp-year">
                  <span>{experience.year}</span>
                </div>
                <div className="skills__exp-roles">
                  {experience.works.map((work) => (
                    <React.Fragment key={work.name}>
                      <motion.div
                        whileInView={{ opacity: [0, 1] }}
                        transition={{ duration: 0.5 }}
                        className="skills__exp-card"
                        data-tip
                        data-for={work.name}
                      >
                        <div>
                          <h4>{work.name}</h4>
                          <p>{work.company}</p>
                        </div>
                        <span className="skills__exp-dot" />
                      </motion.div>
                      <ReactTooltip
                        id={work.name}
                        effect="solid"
                        arrowColor="#141a2a"
                        className="skills-tooltip"
                      >
                        {work.desc}
                      </ReactTooltip>
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Skills, "app__skills"),
  "skills",
  "app__whitebg",
);

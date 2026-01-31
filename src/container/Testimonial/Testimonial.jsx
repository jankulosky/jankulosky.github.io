import React, { useState, useEffect } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { motion } from "framer-motion";

import { AppWrap, MotionWrap } from "../../wrapper";
import { urlFor, client } from "../../client";
import "./Testimonial.scss";

const Testimonial = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [brands, setBrands] = useState([]);

  const handleClick = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    const query = '*[_type == "testimonials"]';
    const brandsQuery = '*[_type == "brands"]';

    client.fetch(query).then((data) => {
      setTestimonials(data);
    });

    client.fetch(brandsQuery).then((data) => {
      setBrands(data);
    });
  }, []);

  return (
    <>
      <div className="testimonials__hero">
        <div className="section__heading">
          <p className="section__eyebrow">Testimonials</p>
          <h2 className="section__title">
            Colleague <span>References</span>
          </h2>
        </div>
      </div>

      {testimonials.length && (
        <div className="testimonials__stage">
          <div className="testimonials__main">
            <div className="testimonials__card">
              <div className="testimonials__profile">
                <img
                  src={urlFor(
                    testimonials[currentIndex].imageurl.asset._ref,
                  ).toString()}
                  alt={testimonials[currentIndex].name}
                />
                <div>
                  <h4>{testimonials[currentIndex].name}</h4>
                  <p>{testimonials[currentIndex].company}</p>
                </div>
              </div>
              <p className="testimonials__feedback">
                {testimonials[currentIndex].feedback}
              </p>
              <div className="testimonials__controls">
                <button
                  type="button"
                  onClick={() =>
                    handleClick(
                      currentIndex === 0
                        ? testimonials.length - 1
                        : currentIndex - 1,
                    )
                  }
                >
                  <HiChevronLeft />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleClick(
                      currentIndex === testimonials.length - 1
                        ? 0
                        : currentIndex + 1,
                    )
                  }
                >
                  Next
                  <HiChevronRight />
                </button>
              </div>
            </div>
          </div>
          <div className="testimonials__rail">
            {testimonials.map((item, index) => (
              <button
                type="button"
                key={item._id || index}
                className={`testimonials__rail-card ${
                  index === currentIndex ? "is-active" : ""
                }`}
                onClick={() => handleClick(index)}
              >
                <img
                  src={urlFor(item.imageurl.asset._ref).toString()}
                  alt={item.name}
                />
                <div>
                  <h5>{item.name}</h5>
                  <span>{item.company}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="testimonials__brands">
        {brands.map((brand) => (
          <motion.div
            whileInView={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, type: "tween" }}
            key={brand._id}
          >
            <img src={urlFor(brand.imgUrl)} alt={brand.name} />
          </motion.div>
        ))}
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Testimonial, "app__testimonial"),
  "testimonial",
  "app__primarybg",
);

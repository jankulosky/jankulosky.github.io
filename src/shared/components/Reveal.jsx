import React from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "../hooks/useMediaQuery";

const EASE = [0.16, 1, 0.3, 1];

const Reveal = ({
  as = "div",
  children,
  delay = 0,
  y = 36,
  x = 0,
  scale = 1,
  duration = 0.9,
  ...rest
}) => {
  const reduced = useReducedMotion();

  if (reduced) {
    const Tag = as;
    return <Tag {...rest}>{children}</Tag>;
  }

  const Component = motion[as];
  return (
    <Component
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Reveal;

import React from "react";
import { BsLinkedin, BsGithub } from "react-icons/bs";
import { FaFacebookF, FaEnvelope } from "react-icons/fa";

const SocialMedia = () => {
  return (
    <div className="app__social">
      <a
        href="https://www.linkedin.com/in/viktor-jankuloski/"
        aria-label="LinkedIn profile"
      >
        <BsLinkedin />
      </a>
      <a href="https://github.com/jankulosky" aria-label="GitHub profile">
        <BsGithub />
      </a>
      <a
        href="https://www.facebook.com/jankuloski.viktor/"
        aria-label="Facebook profile"
      >
        <FaFacebookF />
      </a>
      <a href="mailto:viktor.jankuloski@hotmail.com" aria-label="Send email">
        <FaEnvelope />
      </a>
    </div>
  );
};

export default SocialMedia;

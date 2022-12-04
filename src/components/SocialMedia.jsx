import React from "react";
import { BsLinkedin, BsGithub } from "react-icons/bs";
import { FaFacebookF, FaEnvelope } from "react-icons/fa";

const SocialMedia = () => {
  return (
    <div className="app__social">
      <a href="https://www.linkedin.com/in/viktor-jankuloski/">
        <BsLinkedin />
      </a>
      <a href="https://github.com/jankulosky">
        <BsGithub />
      </a>
      <a href="https://www.facebook.com/jankuloski.viktor/">
        <FaFacebookF />
      </a>
      <a href="mailto:viktor.jankuloski@hotmail.com">
        <FaEnvelope />
      </a>
    </div>
  );
};

export default SocialMedia;

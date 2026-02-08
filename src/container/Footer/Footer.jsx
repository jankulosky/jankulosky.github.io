import React, { useState } from "react";
import emailjs from "@emailjs/browser";

import { images } from "../../constants";
import { AppWrap, MotionWrap } from "../../wrapper";
import "./Footer.scss";

const Footer = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    message: "",
  });
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { username, email, message } = formData;

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = () => {
    const nextErrors = {};
    if (!formData.username.trim()) {
      nextErrors.username = "Please enter your name.";
    }
    if (!formData.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!formData.message.trim()) {
      nextErrors.message = "Please enter a short message.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    const templateParams = {
      from_name: formData.username,
      from_email: formData.email,
      message: formData.message,
      subject: `Message from ${formData.username}`,
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
      )
      .then(() => {
        setLoading(false);
        setIsFormSubmitted(true);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleReset = () => {
    setFormData({ username: "", email: "", message: "" });
    setIsFormSubmitted(false);
    setErrors({});
  };

  return (
    <>
      <div className="contact__hero">
        <div className="section__heading">
          <p className="section__eyebrow">Contact</p>
          <h2 className="section__title">
            Let’s build the next <span>great product</span>
          </h2>
        </div>
      </div>

      <div className="contact__canvas">
        <div className="contact__panel contact__panel--intro">
          <div className="contact__panel-head">
            <h3>Work with me</h3>
            <div className="contact__status">
              <span />
              Available now
            </div>
          </div>
          <p className="p-text">
            Tell me where you’re headed. I’ll help you design, build and launch
            a product that feels premium and performs.
          </p>
          <div className="contact__panel-actions">
            <a href="mailto:viktor.jankuloski@hotmail.com">Email me</a>
            <a href="tel:+ (389) 75-949-782">Call me</a>
          </div>
          <div className="contact__channels">
            <a href="mailto:viktor.jankuloski@hotmail.com">
              <img src={images.email} alt="email" />
              <div>
                <span>Email</span>
                <p>viktor.jankuloski@hotmail.com</p>
              </div>
            </a>
            <a href="tel:+ (389) 75-949-782">
              <img src={images.mobile} alt="phone" />
              <div>
                <span>Phone</span>
                <p>+ (389) 75-949-782</p>
              </div>
            </a>
          </div>
        </div>

        {!isFormSubmitted ? (
          <div className="contact__panel contact__panel--form">
            <div className="contact__panel-head">
              <h3>Send a message</h3>
            </div>
            <div className="contact__form-grid">
              <label className={errors.username ? "has-error" : ""}>
                Your Name
                <input
                  type="text"
                  placeholder="Name"
                  name="username"
                  value={username}
                  onChange={handleChangeInput}
                />
                {errors.username && (
                  <span className="contact__error">{errors.username}</span>
                )}
              </label>
              <label className={errors.email ? "has-error" : ""}>
                Email Address
                <input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={email}
                  onChange={handleChangeInput}
                />
                {errors.email && (
                  <span className="contact__error">{errors.email}</span>
                )}
              </label>
              <label
                className={`contact__full ${errors.message ? "has-error" : ""}`}
              >
                Your Message
                <textarea
                  placeholder="Tell me about your goals, needs, and constraints."
                  value={message}
                  name="message"
                  onChange={handleChangeInput}
                />
                {errors.message && (
                  <span className="contact__error">{errors.message}</span>
                )}
              </label>
            </div>
            <button type="button" onClick={handleSubmit}>
              {!loading ? "Send Message" : "Sending..."}
            </button>
          </div>
        ) : (
          <div className="contact__panel contact__panel--thanks">
            <h3 className="head-text">Thank you for getting in touch!</h3>
            <p className="p-text">I will reply within the next 24 hours.</p>
            <button
              type="button"
              className="contact__reset"
              onClick={handleReset}
            >
              Send another message
            </button>
          </div>
        )}
      </div>

      <div className="copyright">
        <p className="p-text">©2026 Viktor Jankuloski</p>
        <p className="p-text">All rights reserved</p>
      </div>
    </>
  );
};

export default AppWrap(
  MotionWrap(Footer, "app__footer"),
  "contact",
  "app__whitebg",
);

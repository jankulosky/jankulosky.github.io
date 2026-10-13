import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const INITIAL_VALUES = { name: "", email: "", message: "" };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateContact = (values) => {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.message.trim()) errors.message = "Please enter a short message.";
  return errors;
};

/**
 * status: "idle" | "sending" | "sent" | "error"
 */
export const useContactForm = ({ onSent } = {}) => {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const onSentRef = useRef(onSent);
  onSentRef.current = onSent;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  };

  const submit = async (event) => {
    if (event && event.preventDefault) event.preventDefault();
    if (status === "sending") return false;

    const nextErrors = validateContact(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return false;
    }

    setStatus("sending");
    const name = values.name.trim();

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: values.email.trim(),
          message: values.message.trim(),
          subject: `Message from ${name}`,
        },
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
      );
      setStatus("sent");
      if (onSentRef.current) onSentRef.current();
      return true;
    } catch (error) {
      console.error(error);
      setStatus("error");
      return false;
    }
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setStatus("idle");
  };

  return { values, errors, status, handleChange, submit, reset, setValues };
};

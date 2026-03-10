import { client } from "../client";

const QUERIES = {
  abouts: '*[_type == "abouts"]',
  works: '*[_type == "works"]',
  experiences: '*[_type == "experiences"]',
  skills: '*[_type == "skills"]',
  testimonials: '*[_type == "testimonials"]',
  brands: '*[_type == "brands"]',
};

export const fetchAbouts = () => client.fetch(QUERIES.abouts);
export const fetchWorks = () => client.fetch(QUERIES.works);
export const fetchExperiences = () => client.fetch(QUERIES.experiences);
export const fetchSkills = () => client.fetch(QUERIES.skills);
export const fetchTestimonials = () => client.fetch(QUERIES.testimonials);
export const fetchBrands = () => client.fetch(QUERIES.brands);


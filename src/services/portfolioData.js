import { client } from "../client";

const PORTFOLIO_QUERY = `{
  "abouts": *[_type == "abouts"] | order(_createdAt asc) { _id, title, description, imgUrl },
  "works": *[_type == "works"] | order(_createdAt desc) { _id, _createdAt, title, description, projectLink, codeLink, imgUrl, tags },
  "experiences": *[_type == "experiences"] { _id, year, works },
  "skills": *[_type == "skills"] { _id, name, bgColor, icon },
  "testimonials": *[_type == "testimonials"] | order(_createdAt asc) { _id, name, company, feedback, imageurl }
}`;

export const fetchPortfolio = () => client.fetch(PORTFOLIO_QUERY);

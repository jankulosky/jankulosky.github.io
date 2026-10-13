export const PROFILE = {
  firstName: "Viktor",
  lastName: "Jankuloski",
  fullName: "Viktor Jankuloski",
  role: "Full-Stack Software Developer",
  bio: "Full-stack software developer with a Bachelor's in Computer Science, passionate about building and delivering high-quality software solutions using proven methodologies, practices and technologies.",
  location: "EU · Remote",
  email: "viktor.jankuloski@hotmail.com",
  phone: "+389 75 949 782",
  phoneHref: "tel:+38975949782",
  socials: [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/viktor-jankuloski/",
    },
    { id: "github", label: "GitHub", href: "https://github.com/jankulosky" },
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/jankuloski.viktor/",
    },
  ],
};

export const SKILL_CATEGORY = {
  ".NET": "Framework",
  Angular: "Framework",
  React: "Library",
  "Node.js": "Runtime",
  "C#": "Language",
  JavaScript: "Language",
  TypeScript: "Language",
  HTML: "Markup",
  CSS: "Styling",
  MySQL: "Database",
  PostgreSQL: "Database",
  Git: "Tooling",
};

export const getSkillCategory = (name) => SKILL_CATEGORY[name] || "Tooling";

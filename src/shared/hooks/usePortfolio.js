import { useEffect, useState } from "react";
import { fetchPortfolio } from "../../services/portfolioData";

const EMPTY = {
  abouts: [],
  works: [],
  tags: [],
  roles: [],
  skills: [],
  testimonials: [],
  stats: { years: 0, projects: 0, skills: 0, roles: 0 },
  current: null,
};

const stripQuotes = (text = "") =>
  text.replace(/^[\s"“”„]+/, "").replace(/[\s"“”]+$/, "");

const normalize = (raw) => {
  const works = (raw.works || []).map((work, index) => ({
    id: work._id,
    index,
    title: work.title,
    description: work.description,
    projectLink: work.projectLink || null,
    codeLink: work.codeLink || null,
    image: work.imgUrl,
    tags: work.tags || [],
    year: work._createdAt ? new Date(work._createdAt).getFullYear() : null,
  }));

  const tagCounts = new Map();
  works.forEach((work) =>
    work.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)),
  );
  const tags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag, count]) => ({ tag, count }));

  const roles = [...(raw.experiences || [])]
    .sort((a, b) => Number(b.year) - Number(a.year))
    .flatMap((experience) =>
      (experience.works || []).map((role, index) => ({
        id: role._key || `${experience.year}-${index}`,
        year: experience.year,
        title: role.name,
        company: role.company,
        description: role.desc,
      })),
    );

  const skills = [...(raw.skills || [])]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill) => ({
      id: skill._id,
      name: skill.name,
      color: skill.bgColor || null,
      icon: skill.icon,
    }));

  const testimonials = (raw.testimonials || []).map((item) => ({
    id: item._id,
    name: item.name,
    company: item.company,
    feedback: stripQuotes(item.feedback),
    image: item.imageurl,
  }));

  const abouts = (raw.abouts || []).map((about) => ({
    id: about._id,
    title: about.title,
    description: about.description,
    image: about.imgUrl,
  }));

  const years = roles.map((role) => Number(role.year)).filter(Boolean);
  const startYear = years.length ? Math.min(...years) : null;

  return {
    abouts,
    works,
    tags,
    roles,
    skills,
    testimonials,
    stats: {
      years: startYear ? new Date().getFullYear() - startYear : 0,
      projects: works.length,
      skills: skills.length,
      roles: roles.length,
    },
    current: roles[0] || null,
  };
};

let cached = null;
let pending = null;

export const loadPortfolio = () => {
  if (cached) return Promise.resolve(cached);
  if (!pending) {
    pending = fetchPortfolio()
      .then((raw) => {
        cached = normalize(raw || {});
        return cached;
      })
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
};

export const usePortfolio = () => {
  const [state, setState] = useState(() =>
    cached
      ? { status: "ready", data: cached }
      : { status: "loading", data: EMPTY },
  );

  useEffect(() => {
    let alive = true;
    loadPortfolio()
      .then((data) => {
        if (alive) {
          setState((prev) =>
            prev.data === data ? prev : { status: "ready", data },
          );
        }
      })
      .catch((error) => {
        console.error(error);
        if (alive) setState({ status: "error", data: EMPTY });
      });
    return () => {
      alive = false;
    };
  }, []);

  return { ...state.data, status: state.status };
};

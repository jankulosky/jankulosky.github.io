import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiFacebook,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiPhone,
  FiSend,
} from "react-icons/fi";
import Reveal from "../../shared/components/Reveal";
import { PROFILE, getSkillCategory } from "../../shared/profile";
import { splitRoleDescription } from "../../shared/content";
import { imageUrl } from "../../shared/image";
import { pad } from "../../shared/math";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { useScramble } from "../../shared/hooks/useScramble";
import { useContactForm } from "../../shared/hooks/useContactForm";
import astronaut from "../../assets/astronaut.png";

const SOCIAL_ICONS = { linkedin: FiLinkedin, github: FiGithub, facebook: FiFacebook };

const SectionHead = ({ index, kicker, title, children }) => (
  <Reveal className="orbit-head">
    <p className="orbit-kicker">
      <span>{index}</span>
      {kicker}
    </p>
    <h2 className="orbit-title">{title}</h2>
    {children}
  </Reveal>
);

const SplitWord = ({ word, offset = 0 }) =>
  word.split("").map((char, index) => (
    <span key={index} className="orbit-hero__char" style={{ "--i": index + offset }}>
      {char}
    </span>
  ));

export const Hero = ({ data, linkProps }) => (
  <section id="home" className="orbit-hero">
    <div className="orbit-hero__content">
      <p className="orbit-tag orbit-hero__fade" style={{ "--d": "0ms" }}>
        <span className="orbit-tag__dot" />
        Signal acquired · {PROFILE.location}
      </p>
      <p className="orbit-hero__hello orbit-hero__fade" style={{ "--d": "120ms" }}>
        Hello, Earthling — I'm
      </p>
      <h1 className="orbit-hero__name" aria-label={PROFILE.fullName}>
        <span className="orbit-hero__word" aria-hidden="true">
          <SplitWord word={PROFILE.firstName} />
        </span>{" "}
        <span className="orbit-hero__word" aria-hidden="true">
          <SplitWord word={PROFILE.lastName} offset={PROFILE.firstName.length} />
        </span>
      </h1>
      <p className="orbit-hero__lead orbit-hero__fade" style={{ "--d": "900ms" }}>
        A full-stack software developer engineering reliable systems — from <b>.NET</b> and{" "}
        <b>Node.js</b> back-ends to <b>Angular</b> and <b>React</b> front-ends.
      </p>
      <div className="orbit-hero__actions orbit-hero__fade" style={{ "--d": "1050ms" }}>
        <a className="orbit-btn orbit-btn--primary" {...linkProps("work")}>
          Explore my work <FiArrowRight />
        </a>
        <a className="orbit-btn" {...linkProps("contact")}>
          Open a channel
        </a>
      </div>
    </div>

    <aside className="orbit-hero__telemetry orbit-hero__fade" style={{ "--d": "1250ms" }} aria-label="Mission telemetry">
      <header>
        <span>Mission telemetry</span>
        <span className="orbit-live">Live</span>
      </header>
      <dl>
        <div>
          <dt>Current orbit</dt>
          <dd>{data.current ? `${data.current.title} @ ${data.current.company}` : PROFILE.role}</dd>
        </div>
        <div>
          <dt>Flight time</dt>
          <dd>{data.stats.years}+ years</dd>
        </div>
        <div>
          <dt>Missions</dt>
          <dd>{data.stats.projects} shipped</dd>
        </div>
        <div>
          <dt>Systems</dt>
          <dd>{data.stats.skills} online</dd>
        </div>
      </dl>
      <div className="orbit-hero__signal" aria-hidden="true">
        {Array.from({ length: 28 }, (_, index) => (
          <i key={index} style={{ "--i": index }} />
        ))}
      </div>
    </aside>

    <div className="orbit-hero__scroll orbit-hero__fade" style={{ "--d": "1500ms" }}>
      <span>Scroll to orbit</span>
      <i />
    </div>
  </section>
);

const Stat = ({ value, suffix = "", label }) => {
  const [ref, display] = useCountUp(value);
  return (
    <div className="orbit-stat" ref={ref}>
      <b>
        {display}
        {suffix}
      </b>
      <span>{label}</span>
    </div>
  );
};

export const About = ({ data }) => (
  <section id="about" className="orbit-section orbit-split">
    <div className="orbit-split__col">
      <SectionHead
        index="01"
        kicker="Mission brief"
        title={
          <>
            Good development means <em>good business.</em>
          </>
        }
      />
      <Reveal as="p" className="orbit-lead" delay={0.1}>
        {PROFILE.bio}
      </Reveal>
      <Reveal className="orbit-stats" delay={0.15}>
        <Stat value={data.stats.years} suffix="+" label="Years in orbit" />
        <Stat value={data.stats.projects} label="Missions shipped" />
        <Stat value={data.stats.skills} label="Core systems" />
      </Reveal>
      <div className="orbit-about__cards">
        {data.abouts.map((about, index) => (
          <Reveal
            as="article"
            key={about.id}
            className="orbit-glass orbit-about__card"
            delay={0.12 * index}
          >
            <div className="orbit-about__media">
              <img src={imageUrl(about.image, { width: 640 })} alt="" loading="lazy" />
            </div>
            <div className="orbit-about__body">
              <span className="orbit-mono">Module {pad(index + 1)}</span>
              <h3>{about.title}</h3>
              <p>{about.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

const ProjectCard = forwardRef(function ProjectCard({ work, index }, forwardedRef) {
  const localRef = useRef(null);
  const setRefs = useCallback(
    (node) => {
      localRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const handleMove = (event) => {
    const card = localRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--mx", `${x * 100}%`);
    card.style.setProperty("--my", `${y * 100}%`);
    card.style.setProperty("--rx", `${(0.5 - y) * 7}deg`);
    card.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
  };

  const handleLeave = () => {
    const card = localRef.current;
    if (!card) return;
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.article
      layout
      ref={setRefs}
      className="orbit-project"
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25 } }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="orbit-project__inner">
        <div className="orbit-project__media">
          <img
            src={imageUrl(work.image, { width: 900 })}
            alt={`${work.title} screenshot`}
            loading="lazy"
          />
          <span className="orbit-project__id">M-{pad(index + 1)}</span>
        </div>
        <div className="orbit-project__body">
          <div className="orbit-project__tags">
            {work.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <h3>{work.title}</h3>
          <p>{work.description}</p>
          <div className="orbit-project__links">
            {work.projectLink && (
              <a href={work.projectLink} target="_blank" rel="noreferrer">
                Live site <FiArrowUpRight />
              </a>
            )}
            {work.codeLink && (
              <a href={work.codeLink} target="_blank" rel="noreferrer">
                Source <FiGithub />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
});

export const Work = ({ data }) => {
  const [filter, setFilter] = useState("All");
  const filters = useMemo(() => ["All", ...data.tags.map((item) => item.tag)], [data.tags]);
  const items =
    filter === "All" ? data.works : data.works.filter((work) => work.tags.includes(filter));

  const countFor = (item) =>
    item === "All"
      ? data.works.length
      : (data.tags.find((entry) => entry.tag === item) || {}).count;

  return (
    <section id="work" className="orbit-section orbit-work">
      <SectionHead
        index="02"
        kicker="Mission archive"
        title={
          <>
            Selected <em>work</em>
          </>
        }
      >
        <p className="orbit-head__aside">
          {data.works.length} missions logged — filter by stack, hover to inspect.
        </p>
      </SectionHead>
      <Reveal className="orbit-filters" role="tablist" aria-label="Filter projects">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            className={filter === item ? "is-active" : ""}
            onClick={() => setFilter(item)}
          >
            {item}
            <span>{countFor(item)}</span>
          </button>
        ))}
      </Reveal>
      <motion.div layout className="orbit-work__grid">
        <AnimatePresence mode="popLayout">
          {items.map((work) => (
            <ProjectCard key={work.id} work={work} index={work.index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

const RINGS = [
  { id: "languages", label: "Languages", match: ["Language", "Markup", "Styling"], size: 54, duration: 34, phase: 18 },
  { id: "frameworks", label: "Frameworks", match: ["Framework", "Library", "Runtime"], size: 78, duration: 52, phase: 62, reverse: true },
  { id: "data", label: "Data & tooling", match: ["Database", "Tooling"], size: 100, duration: 76, phase: 100 },
];

export const Skills = ({ data }) => {
  const rings = useMemo(
    () =>
      RINGS.map((ring) => ({
        ...ring,
        skills: data.skills.filter((skill) => ring.match.includes(getSkillCategory(skill.name))),
      })),
    [data.skills],
  );

  return (
    <section id="skills" className="orbit-section orbit-split">
      <div className="orbit-split__col">
        <SectionHead
          index="03"
          kicker="Systems online"
          title={
            <>
              Skills in <em>orbit</em>
            </>
          }
        />
        <Reveal as="p" className="orbit-lead" delay={0.1}>
          The core systems I use to design, ship and scale products — arranged by how close they
          sit to my day-to-day work.
        </Reveal>
        <div className="orbit-syscheck">
          {rings.map((ring, index) => (
            <Reveal key={ring.id} className="orbit-syscheck__row" delay={0.08 * index}>
              <span className="orbit-mono">{ring.label}</span>
              <div>
                {ring.skills.map((skill) => (
                  <span key={skill.id} className="orbit-chip">
                    <img src={imageUrl(skill.icon, { width: 64 })} alt="" />
                    {skill.name}
                  </span>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
      <Reveal className="orbit-system-wrap" scale={0.9} y={0} duration={1.4}>
        <div className="orbit-system" aria-hidden="true">
          <div className="orbit-system__plane">
            <div className="orbit-system__core">
              <img src={astronaut} alt="" />
            </div>
            {rings.map((ring) => (
              <div
                key={ring.id}
                className="orbit-ring"
                style={{
                  "--size": `${ring.size}%`,
                  "--dur": `${ring.duration}s`,
                  "--dir": ring.reverse ? "reverse" : "normal",
                }}
              >
                <div className="orbit-ring__spin">
                  {ring.skills.map((skill, index) => (
                    <div
                      key={skill.id}
                      className="orbit-node"
                      style={{ "--a": `${(360 / ring.skills.length) * index + ring.phase}deg` }}
                    >
                      <div className="orbit-node__face">
                        <img src={imageUrl(skill.icon, { width: 96 })} alt="" />
                        <span>{skill.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export const Experience = ({ data }) => (
  <section id="experience" className="orbit-section orbit-split">
    <div className="orbit-split__col">
      <SectionHead index="04" kicker="Flight log" title="Experience" />
      <ol className="orbit-log">
        {data.roles.map((role, index) => {
          const { summary, stack } = splitRoleDescription(role.description);
          return (
            <Reveal as="li" className="orbit-log__item" key={role.id} delay={0.05 * index}>
              <span className="orbit-log__marker" aria-hidden="true" />
              <div className="orbit-glass orbit-log__body">
                <div className="orbit-log__meta">
                  <span className="orbit-mono">
                    {role.year} · Mission {pad(data.roles.length - index)}
                  </span>
                  {index === 0 && <span className="orbit-live">Current</span>}
                </div>
                <h3>{role.title}</h3>
                <p className="orbit-log__company">@ {role.company}</p>
                <p>{summary}</p>
                {stack.length > 0 && (
                  <div className="orbit-log__stack">
                    {stack.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </ol>
    </div>
  </section>
);

const Transmission = ({ text }) => {
  const { revealed, noise, rest } = useScramble(text, { speed: 3.4 });
  return (
    <blockquote className="orbit-tx__quote">
      <span>{revealed}</span>
      <span className="orbit-tx__noise" aria-hidden="true">
        {noise}
      </span>
      <span className="orbit-tx__rest" aria-hidden="true">
        {rest}
      </span>
    </blockquote>
  );
};

const ROTATE_MS = 11000;

export const Testimonials = ({ data }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = data.testimonials.length;

  useEffect(() => {
    if (paused || count < 2) return undefined;
    const id = window.setTimeout(() => setActive((value) => (value + 1) % count), ROTATE_MS);
    return () => window.clearTimeout(id);
  }, [active, paused, count]);

  const current = data.testimonials[active];

  return (
    <section id="testimonial" className="orbit-section orbit-split orbit-split--right">
      <div className="orbit-split__col">
        <SectionHead
          index="05"
          kicker="Incoming transmissions"
          title={
            <>
              Voices from the <em>crew</em>
            </>
          }
        />
        {current && (
          <Reveal
            className="orbit-glass orbit-tx"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="orbit-tx__top">
              <span className="orbit-mono">
                CH-{pad(active + 1)} · {paused ? "On hold" : "Receiving"}
              </span>
              <div className="orbit-tx__wave" aria-hidden="true">
                {Array.from({ length: 22 }, (_, index) => (
                  <i key={index} style={{ "--i": index }} />
                ))}
              </div>
            </div>
            <Transmission key={current.id} text={current.feedback} />
            <div className="orbit-tx__from">
              <img src={imageUrl(current.image, { width: 120, height: 120, fit: "crop" })} alt="" />
              <div>
                <strong>{current.name}</strong>
                <span>{current.company}</span>
              </div>
            </div>
            <div className="orbit-tx__progress" aria-hidden="true">
              <i
                key={`${active}-${paused}`}
                style={{ animationDuration: `${ROTATE_MS}ms` }}
                className={paused ? "is-paused" : ""}
              />
            </div>
            <div className="orbit-tx__channels" role="tablist" aria-label="Testimonials">
              {data.testimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  aria-label={`Transmission from ${item.name}`}
                  className={index === active ? "is-active" : ""}
                  onClick={() => setActive(index)}
                >
                  <img src={imageUrl(item.image, { width: 96, height: 96, fit: "crop" })} alt="" />
                </button>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

const Field = ({ label, name, type = "text", textarea, value, error, onChange, placeholder, autoComplete }) => (
  <label className={`orbit-field${error ? " has-error" : ""}`}>
    <span className="orbit-mono">› {label}</span>
    {textarea ? (
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={5} />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
    )}
    {error && <em>{error}</em>}
  </label>
);

export const Contact = ({ onLaunch, linkProps }) => {
  const form = useContactForm({ onSent: onLaunch });
  const { values, errors, status } = form;

  return (
    <section id="contact" className="orbit-section orbit-contact">
      <SectionHead
        index="06"
        kicker="Open a channel"
        title={
          <>
            Ready for <em>launch?</em>
          </>
        }
      >
        <p className="orbit-lead">
          Tell me where you're headed. I'll help you design, build and launch a product that feels
          premium and performs.
        </p>
      </SectionHead>

      <div className="orbit-contact__grid">
        <Reveal className="orbit-contact__channels">
          <a className="orbit-channel" href={`mailto:${PROFILE.email}`}>
            <FiMail />
            <span>
              <small>Email</small>
              {PROFILE.email}
            </span>
            <FiArrowUpRight />
          </a>
          <a className="orbit-channel" href={PROFILE.phoneHref}>
            <FiPhone />
            <span>
              <small>Phone</small>
              {PROFILE.phone}
            </span>
            <FiArrowUpRight />
          </a>
          <div className="orbit-socials">
            {PROFILE.socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.id];
              return (
                <a key={social.id} href={social.href} target="_blank" rel="noreferrer" aria-label={social.label}>
                  <Icon />
                </a>
              );
            })}
          </div>
          <p className="orbit-status">
            <span className="orbit-tag__dot" />
            Available for new projects
          </p>
        </Reveal>

        <Reveal className="orbit-glass orbit-form-wrap" delay={0.1}>
          {status === "sent" ? (
            <div className="orbit-sent">
              <span className="orbit-mono">Transmission complete</span>
              <h3>Message launched.</h3>
              <p>Thanks for reaching out — I'll reply within the next 24 hours.</p>
              <button type="button" className="orbit-btn" onClick={form.reset}>
                Send another
              </button>
            </div>
          ) : (
            <form className="orbit-form" onSubmit={form.submit} noValidate>
              <Field
                label="Name"
                name="name"
                value={values.name}
                error={errors.name}
                onChange={form.handleChange}
                placeholder="Your name"
                autoComplete="name"
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={values.email}
                error={errors.email}
                onChange={form.handleChange}
                placeholder="you@company.com"
                autoComplete="email"
              />
              <Field
                label="Message"
                name="message"
                textarea
                value={values.message}
                error={errors.message}
                onChange={form.handleChange}
                placeholder="Tell me about your goals, timeline and constraints."
              />
              {status === "error" && (
                <p className="orbit-form__error">
                  Something went wrong. Please email me directly at {PROFILE.email}.
                </p>
              )}
              <button
                type="submit"
                className="orbit-btn orbit-btn--primary orbit-form__submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? (
                  "Launching…"
                ) : (
                  <>
                    Launch message <FiSend />
                  </>
                )}
              </button>
            </form>
          )}
        </Reveal>
      </div>

      <footer className="orbit-footer">
        <span>
          © {new Date().getFullYear()} {PROFILE.fullName}
        </span>
        <span className="orbit-mono">Crafted in low orbit · three.js</span>
        <a {...linkProps("home")}>Back to top ↑</a>
      </footer>
    </section>
  );
};

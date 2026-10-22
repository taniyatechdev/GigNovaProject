import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGigNova } from "./context/GigNovaContext";
import "./Home.css";

const WORDS = ["Web Developers", "Graphic Designers", "Content Writers", "Digital Marketers", "UI/UX Experts"];
const PORTFOLIO = [
  { id: 1, src: "https://images.pexels.com/photos/196646/pexels-photo-196646.jpeg?auto=compress&cs=tinysrgb&w=640", title: "Web App UI" },
  { id: 2, src: "https://images.pexels.com/photos/326503/pexels-photo-326503.jpeg?auto=compress&cs=tinysrgb&w=640", title: "Brand Identity" },
  { id: 3, src: "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=640", title: "Web Design" },
  { id: 4, src: "https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=640", title: "Illustration" },
  { id: 5, src: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=640", title: "Creative Technology" },
];
const CATEGORIES = [
  { icon: "💻", name: "Web Development", desc: "Websites, React and full-stack apps", skills: ["Full-Stack Development", "E-commerce Solutions", "React & Next.js Experts"] },
  { icon: "🎨", name: "Graphic Design", desc: "Logos, branding and creatives", skills: ["Brand Identity & Logos", "Social Media Graphics", "Illustrations & Vectors"] },
  { icon: "✍️", name: "Content Writing", desc: "Blogs, articles and copywriting", skills: ["SEO Article Writing", "Website Copywriting", "Email Newsletters"] },
  { icon: "📈", name: "Digital Marketing", desc: "SEO, social media and ads", skills: ["Google & Meta Ads", "Search Engine Optimization", "Social Media Growth"] },
];
const ROUTES = { browse: "/browse", post: "/post-gig", freelancers: "/freelancers", dashboard: "/dashboard" };

function formatBudget(gig) {
  const value = gig.budget ?? gig.budgetAmount ?? gig.salary;
  if (value === undefined || value === null || value === "") return "Budget on request";
  if (typeof value === "string" && /[₹$]|INR|USD|negotiable/i.test(value)) return value;
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  const currency = gig.currency === "USD" || gig.budgetCurrency === "USD" ? "USD" : "INR";
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : "en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(number);
}

export default function Home({ setPage, onViewGig }) {
  const navigate = useNavigate();
  const { gigs = [], projects = [], user } = useGigNova();
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeCategory, setActiveCategory] = useState(null);

  const go = (page) => {
    if (typeof setPage === "function") setPage(page);
    else navigate(ROUTES[page] || `/${page}`);
  };

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setCurrentText(WORDS[0]);
      return;
    }
    const word = WORDS[wordIndex];
    const finished = !deleting && currentText === word;
    const timer = window.setTimeout(() => {
      if (finished) setDeleting(true);
      else if (deleting && currentText.length === 0) {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % WORDS.length);
      } else setCurrentText(word.slice(0, currentText.length + (deleting ? -1 : 1)));
    }, finished ? 1900 : deleting ? 48 : 85);
    return () => window.clearTimeout(timer);
  }, [wordIndex, currentText, deleting]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    const nodes = document.querySelectorAll(".home .reveal-on-scroll");
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const openGigs = useMemo(() => gigs.filter((gig) => gig && (!gig.status || String(gig.status).toLowerCase() === "open")), [gigs]);
  const featured = useMemo(() => {
    const query = search.trim().toLowerCase();
    return openGigs.filter((gig) => {
      const matchesCategory = category === "All" || String(gig.category || "").toLowerCase() === category.toLowerCase();
      const text = [gig.title, gig.category, gig.description, ...(Array.isArray(gig.skills) ? gig.skills : [gig.skills])].join(" ").toLowerCase();
      return matchesCategory && (!query || text.includes(query));
    }).slice(0, 6);
  }, [openGigs, category, search]);

  return (
    <div className="home">
      <section className="hero" aria-labelledby="home-hero-heading">
        <div className="hero-content fade-up-enter">
          <span className="hero-badge"><span className="gn-sparkle">✦</span> Your next big idea starts here</span>
          <h1 id="home-hero-heading">Great work begins with <span className="dynamic-text">{currentText}<span className="cursor" aria-hidden="true">|</span></span></h1>
          <p>Meet skilled freelancers, discover meaningful projects, and bring ambitious ideas to life — all in one creative workspace.</p>
          <div className="hero-buttons">
            <button type="button" className="primary-btn" onClick={() => go("browse")}>Explore opportunities <span aria-hidden="true">↗</span></button>
            <button type="button" className="secondary-btn" onClick={() => go("post")}>Post a project <span aria-hidden="true">→</span></button>
          </div>
          <div className="gn-hero-proof"><span className="gn-proof-icon" aria-hidden="true">✦</span><span>Built for creators, clients and independent talent</span></div>
          <div className="hero-stats" aria-label="Current platform activity">
            <div className="stat"><h3>{openGigs.length}</h3><p>Open gigs</p></div>
            <div className="stat"><h3>{projects.length}</h3><p>Projects</p></div>
            <div className="stat"><h3>{CATEGORIES.length}</h3><p>Skill categories</p></div>
          </div>
        </div>
        <div className="hero-image fade-in-scale">
          <div className="gn-hero-image-wrap"><img src="https://images.pexels.com/photos/6392968/pexels-photo-6392968.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Creative professional working on a laptop" fetchPriority="high" /></div>
          <div className="floating-card completed-card float-anim-1"><span className="icon-green">✓</span><span><strong>Collaborate better</strong><small>Find your perfect match</small></span></div>
          <div className="floating-card earning-card float-anim-2"><span className="icon-green">✦</span><span><strong>Create something great</strong><small>Ideas into impact</small></span></div>
          <span className="gn-hero-orbit" aria-hidden="true">✳</span>
        </div>
      </section>

      <section className="gn-home-trust" aria-label="Platform highlights"><span>DISCOVER</span><span>•</span><span>CONNECT</span><span>•</span><span>COLLABORATE</span><span>•</span><span>GROW</span></section>

      <section className="gn-home-featured reveal-on-scroll" aria-labelledby="featured-heading">
        <div className="gn-home-section-head"><div><span className="gn-home-eyebrow">HANDPICKED FOR YOUR NEXT MOVE</span><h2 id="featured-heading">Explore fresh opportunities<span className="gn-dot">.</span></h2><p>Discover open projects and find work that fits your skills.</p></div><button type="button" className="gn-home-link" onClick={() => go("browse")}>View all gigs <span aria-hidden="true">↗</span></button></div>
        <div className="gn-home-filter-row"><label className="gn-home-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title, skill or keyword" aria-label="Search featured gigs" /></label><select aria-label="Filter gigs by category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="All">All categories</option>{CATEGORIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}</select></div>
        {featured.length > 0 ? <div className="gn-home-gig-grid">{featured.map((gig) => <article className="gn-home-gig-card" key={gig.id}><div className="gn-home-gig-top"><span className="gn-gig-category">{gig.category || "Freelance"}</span><span className="gn-home-open"><i aria-hidden="true" /> Open</span></div><h3>{gig.title || "Untitled gig"}</h3><p>{String(gig.description || "Explore this opportunity on GigNova.").replace(/<[^>]*>/g, "").slice(0, 145)}</p><div className="gn-home-gig-bottom"><div><small>Project budget</small><strong>{formatBudget(gig)}</strong></div><button type="button" onClick={() => onViewGig ? onViewGig(gig) : go("browse")}>View details <span aria-hidden="true">↗</span></button></div></article>)}</div> : <div className="gn-home-empty"><span aria-hidden="true">⌕</span><h3>{openGigs.length ? "No matching gigs" : "New opportunities are coming"}</h3><p>{openGigs.length ? "Try a different keyword or category." : "Browse all gigs to discover available opportunities."}</p><button type="button" onClick={() => { setSearch(""); setCategory("All"); }}>Clear filters</button></div>}
      </section>

      <section className="categories reveal-on-scroll" aria-labelledby="categories-heading"><div className="gn-centered-head"><span className="gn-home-eyebrow">EXPLORE WHAT YOU LOVE</span><h2 className="section-title" id="categories-heading">Talent for every idea<span className="gn-dot">.</span></h2><p className="section-subtitle">Explore in-demand skills and discover your next collaboration.</p></div><div className="category-grid">{CATEGORIES.map((c, i) => <div className={`flashcard ${activeCategory === i ? "is-flipped" : ""}`} key={c.name}><div className="flashcard-inner"><div className="flashcard-front"><span className="gn-card-number">0{i + 1}</span><div className="card-emoji" aria-hidden="true">{c.icon}</div><h3>{c.name}</h3><p>{c.desc}</p><button type="button" className="gn-flip-control" onClick={() => setActiveCategory(activeCategory === i ? null : i)} aria-label={`See skills in ${c.name}`} aria-expanded={activeCategory === i}>Discover skills <span aria-hidden="true">↗</span></button></div><div className="flashcard-back"><h3>{c.name}</h3><ul>{c.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul><div className="gn-card-actions"><button type="button" className="flash-btn" onClick={() => go("browse")}>Explore gigs →</button><button type="button" className="gn-back-control" onClick={() => setActiveCategory(null)} aria-label={`Flip ${c.name} back`}>↶</button></div></div></div></div>)}</div></section>

      <section className="gn-home-how reveal-on-scroll" aria-labelledby="how-heading"><div className="gn-home-section-head"><div><span className="gn-home-eyebrow">SIMPLE FROM START TO FINISH</span><h2 id="how-heading">Your journey, made simple<span className="gn-dot">.</span></h2><p>Everything you need to take your next project forward.</p></div></div><div className="gn-home-steps"><article><span className="gn-step-icon">⌕</span><span className="gn-step-number">01 / DISCOVER</span><h3>Find your opportunity</h3><p>Explore gigs or discover freelancers with the skills your project needs.</p></article><article><span className="gn-step-icon">↗</span><span className="gn-step-number">02 / CONNECT</span><h3>Start a conversation</h3><p>Send proposals, review applications, and collaborate after acceptance.</p></article><article><span className="gn-step-icon">✓</span><span className="gn-step-number">03 / CREATE</span><h3>Bring ideas to life</h3><p>Track your work, share deliverables, and record demo payments.</p></article></div></section>

      <section className="marquee-section reveal-on-scroll" aria-label="Creative inspiration gallery"><div className="gn-centered-head"><span className="gn-home-eyebrow">A LITTLE INSPIRATION</span><h2>Made for creative minds<span className="gn-dot">.</span></h2><p>Sample imagery showcasing the possibilities of creative work.</p></div><div className="marquee-container"><div className="marquee-track">{[...PORTFOLIO, ...PORTFOLIO].map((img, i) => <div className="marquee-item" key={`${img.id}-${i}`}><img src={img.src} alt={i < PORTFOLIO.length ? img.title : ""} loading="lazy" /><div className="marquee-overlay"><span>{img.title}</span></div></div>)}</div></div></section>

      <section className="gn-home-talent reveal-on-scroll"><div className="gn-talent-copy"><span className="gn-home-eyebrow">FOR AMBITIOUS TEAMS</span><h2>Big ideas deserve the right people<span className="gn-dot">.</span></h2><p>Explore freelancer profiles, compare skills and reviews, and invite talent to work with you.</p><button type="button" className="primary-btn" onClick={() => go("freelancers")}>Find freelancers <span aria-hidden="true">↗</span></button></div><div className="gn-home-talent-art" aria-hidden="true"><span>💻</span><span>🎨</span><span>✍️</span><div className="gn-art-caption">Your dream team starts here ✦</div></div></section>

      <section className="home-cta reveal-on-scroll"><span className="gn-home-eyebrow">LET'S BUILD SOMETHING GREAT</span><h2>{user ? "Your next big opportunity is waiting." : "Ready to make your next move?"}</h2><p>Discover projects, meet talent, and make meaningful work happen.</p><button type="button" className="primary-btn" onClick={() => go(user ? "dashboard" : "browse")}>{user ? "Open your dashboard" : "Explore GigNova"} <span aria-hidden="true">↗</span></button></section>
    </div>
  );
}

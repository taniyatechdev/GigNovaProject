import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import GigCard from "./GigCard";
import { fetchAllGigs } from "./services/gigApi";
import "./BrowseGigs.css";


const normalizeGigs = (result) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.gigs)) return result.gigs;
  if (Array.isArray(result?.jobs)) return result.jobs;
  return [];
};
const text = (value) => String(value ?? "").trim();
const lower = (value) => text(value).toLowerCase();
const getSkills = (gig) => Array.isArray(gig.skills)
  ? gig.skills.map(text).filter(Boolean)
  : text(gig.skills).split(",").map(text).filter(Boolean);
const getDate = (gig) => {
  const date = Date.parse(gig.createdAt || gig.publication_date || gig.postedAt || "");
  return Number.isFinite(date) ? date : 0;
};
const getBudgetInfo = (gig) => {
  const raw = gig.budgetNumeric ?? gig.budgetAmount ?? gig.budget;
  if (raw === null || raw === undefined || text(raw) === "") return null;
  const currencyRaw = String(gig.currency || gig.budgetCurrency || gig.bidCurrency || "").toUpperCase();
  const rawText = String(raw);
  const currency = currencyRaw === "USD" || /\$|\bUSD\b/i.test(rawText) ? "USD" : "INR";
  // Reject non-numeric or range budgets instead of inventing a precise amount.
  const cleaned = rawText.replace(/,/g, "").replace(/(?:INR|USD|₹|\$|\/hour|\/month)/gi, "").trim();
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? { amount, currency } : null;
};
const getWorkMode = (gig) => {
  const value = lower([gig.workMode, gig.workType, gig.job_type, gig.location, gig.candidate_required_location, gig.type].filter(Boolean).join(" "));
  if (/remote|work from home|wfh|anywhere/.test(value)) return "remote";
  if (/on.site|onsite|office|in.person|hybrid/.test(value)) return "onsite";
  return "unspecified";
};

export default function BrowseGigs({ gigs = [], onView, onViewGig }) {
  const navigate = useNavigate();
  const [apiGigs, setApiGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [skill, setSkill] = useState("all");
  const [workMode, setWorkMode] = useState("all");
  const [source, setSource] = useState("all");
  const [currency, setCurrency] = useState("INR");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchAllGigs();
        if (active) setApiGigs(normalizeGigs(result));
      } catch (err) {
        if (active) setError(err?.message || "Failed to load external gigs.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [retry]);

  const allGigs = useMemo(() => {
    const map = new Map();
    apiGigs.forEach((gig) => {
      if (gig?.id == null) return;
      map.set(String(gig.id), { ...gig, source: gig.source || "api" });
    });
    gigs.forEach((gig) => {
      if (gig?.id == null) return;
      if (gig.status && lower(gig.status) !== "open") return;
      map.set(String(gig.id), { ...gig, source: gig.source || "local" });
    });
    return [...map.values()];
  }, [apiGigs, gigs]);

  const categories = useMemo(() => [...new Set(allGigs.map((gig) => text(gig.category)).filter(Boolean))].sort(), [allGigs]);
  const skills = useMemo(() => [...new Set(allGigs.flatMap(getSkills))].sort((a, b) => a.localeCompare(b)), [allGigs]);
  const budgetFiltering = minBudget !== "" || maxBudget !== "";
  const invalidBudget = budgetFiltering && minBudget !== "" && maxBudget !== "" && Number(minBudget) > Number(maxBudget);

  const filteredGigs = useMemo(() => {
    const query = lower(search);
    const filtered = allGigs.filter((gig) => {
      const content = [gig.title, gig.description, gig.category, gig.company, ...getSkills(gig)].map(text).join(" ").toLowerCase();
      if (query && !content.includes(query)) return false;
      if (category !== "all" && lower(gig.category) !== lower(category)) return false;
      if (skill !== "all" && !getSkills(gig).some((item) => lower(item) === lower(skill))) return false;
      if (workMode !== "all" && getWorkMode(gig) !== workMode) return false;
      if (source !== "all" && (source === "local" ? gig.source !== "local" : gig.source === "local")) return false;
      if (budgetFiltering) {
        const budget = getBudgetInfo(gig);
        if (!budget || budget.currency !== currency || invalidBudget) return false;
        if (minBudget !== "" && budget.amount < Number(minBudget)) return false;
        if (maxBudget !== "" && budget.amount > Number(maxBudget)) return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "oldest") return getDate(a) - getDate(b);
      if (sort === "title") return text(a.title).localeCompare(text(b.title));
      if (sort === "budget-high" || sort === "budget-low") {
        // Currency-aware sorting: comparable known budgets first; no exchange-rate assumptions.
        const x = getBudgetInfo(a);
        const y = getBudgetInfo(b);
        const comparable = (v) => v && v.currency === currency;
        if (comparable(x) && !comparable(y)) return -1;
        if (!comparable(x) && comparable(y)) return 1;
        if (comparable(x) && comparable(y)) return sort === "budget-high" ? y.amount - x.amount : x.amount - y.amount;
      }
      return getDate(b) - getDate(a);
    });
  }, [allGigs, search, category, skill, workMode, source, currency, minBudget, maxBudget, budgetFiltering, invalidBudget, sort]);

  const clearFilters = () => {
    setSearch(""); setCategory("all"); setSkill("all"); setWorkMode("all");
    setSource("all"); setCurrency("INR"); setMinBudget(""); setMaxBudget(""); setSort("newest");
  };
  const handleView = (gig) => {
    if (gig?.id == null) return;
    const callback = onViewGig || onView;
    if (typeof callback === "function") callback(gig);
    else navigate(`/gigs/${encodeURIComponent(gig.id)}`, { state: { gig } });
  };

  return (
    <main className="browse-page gn-browse-updated">
      <div className="browse-header">
        <span className="gn-browse-eyebrow">GIGNOVA MARKETPLACE</span>
        <h1>Find your next opportunity</h1>
        <p>Explore freelance projects from GigNova clients and external listings.</p>
      </div>

      <section className="browse-controls" aria-label="Search and filter gigs">
        <label className="gn-filter-label" htmlFor="gn-gig-search">Search opportunities</label>
        <input id="gn-gig-search" type="search" className="search-input" placeholder="Search gigs, skills, companies..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="gn-browse-filter-grid">
          <label>Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>Skill
            <select value={skill} onChange={(e) => setSkill(e.target.value)}>
              <option value="all">All skills</option>
              {skills.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>Work location
            <select value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
              <option value="all">Any location</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site / Hybrid</option>
              <option value="unspecified">Not specified</option>
            </select>
          </label>
          <label>Listing source
            <select value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="all">All gigs</option>
              <option value="local">GigNova posted gigs</option>
              <option value="api">External listings</option>
            </select>
          </label>
          <label>Budget currency
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </label>
          <label>Minimum budget
            <input type="number" min="0" step="any" placeholder="No minimum" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
          </label>
          <label>Maximum budget
            <input type="number" min="0" step="any" placeholder="No maximum" value={maxBudget} onChange={(e) => setMaxBudget(e.target.value)} />
          </label>
          <label>Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="budget-high">Highest budget</option>
              <option value="budget-low">Lowest budget</option>
              <option value="title">Title A–Z</option>
            </select>
          </label>
        </div>
        <div className="controls-meta gn-browse-meta">
          <span aria-live="polite"><strong>{filteredGigs.length}</strong> gigs found</span>
          <button type="button" onClick={clearFilters}>Clear all filters</button>
        </div>
        {(budgetFiltering || sort.startsWith("budget")) && (
          <p className="gn-budget-note">Budget filters and sorting use {currency} only. Gigs with unknown or different-currency budgets are {budgetFiltering ? "excluded from budget-filtered results" : "shown after comparable gigs"}.</p>
        )}
        {invalidBudget && <p role="alert" className="gn-browse-validation">Minimum budget cannot exceed maximum budget.</p>}
      </section>

      {loading && <p className="gn-browse-status" role="status">Loading external gigs… {allGigs.length > 0 ? "Available gigs are shown below." : ""}</p>}
      {error && <div className="error-card" role="alert"><p>External listings could not be refreshed: {error}</p><button type="button" onClick={() => setRetry((value) => value + 1)}>Retry loading</button></div>}
      {!loading && filteredGigs.length === 0 && <div className="empty-card"><h3>No gigs found</h3><p>Try clearing some filters or searching for a different skill.</p><button type="button" onClick={clearFilters}>Reset filters</button></div>}
      <div className="gig-grid">
        {filteredGigs.map((gig) => <GigCard key={`${gig.source}-${gig.id}`} gig={gig} onView={handleView} />)}
      </div>
    </main>
  );
}

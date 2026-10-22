
import React, { useEffect, useMemo, useState } from "react";
import GigCard from "./GigCard";
import { fetchGigSuggestions } from "./services/gigApi";
import { validateGig } from "./utils/validateGig";
import "./PostGig.css";
import "./GigCard.css";

const CATEGORIES = [
  "Web Development",
  "Software Development",
  "Graphic Design",
  "UI/UX Design",
  "Content Writing",
  "Digital Marketing",
  "Video Editing",
  "Data Entry",
  "Customer Service",
];

const SKILL_OPTIONS = {
  "Web Development": [
    "React",
    "JavaScript",
    "HTML",
    "CSS",
    "Node.js",
    "MongoDB",
  ],
  "Software Development": [
    "Java",
    "Python",
    "SQL",
    "Git",
    "TypeScript",
    "Node.js",
  ],
  "Graphic Design": [
    "Figma",
    "Photoshop",
    "Illustrator",
    "Canva",
  ],
  "UI/UX Design": [
    "Figma",
    "Wireframing",
    "Prototyping",
    "User Research",
  ],
  "Content Writing": [
    "SEO",
    "Copywriting",
    "Blog Writing",
    "Editing",
  ],
  "Digital Marketing": [
    "SEO",
    "Google Ads",
    "Social Media",
    "Analytics",
  ],
  "Video Editing": [
    "Premiere Pro",
    "After Effects",
    "CapCut",
  ],
  "Data Entry": [
    "Excel",
    "Google Sheets",
    "Research",
  ],
};

const emptyForm = {
  title: "",
  category: "",
  experience: "",
  description: "",
  skills: "",
  paymentType: "fixed",
  currency: "INR",
  budget: "",
  deadline: "",
  durationMonths: "1",
};

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const today = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatMoney = (amount, currency = "INR") => {
  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "Not Specified";
  }

  return new Intl.NumberFormat(
    currency === "USD" ? "en-US" : "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(number);
};

const getBudgetText = (form) => {
  if (
    form.currency === "unspecified" ||
    String(form.budget ?? "").trim() === ""
  ) {
    return "Not Specified";
  }

  const amount = Number(form.budget);

  if (!Number.isFinite(amount) || amount <= 0) {
    return "Not Specified";
  }

  const suffix =
    form.paymentType === "hourly"
      ? "/hour"
      : form.paymentType === "monthly"
      ? "/month"
      : "";

  return `${formatMoney(amount, form.currency)}${suffix}`;
};

export default function PostGig({ onAddGig }) {
  const [form, setForm] = useState({ ...emptyForm });
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [apiError, setApiError] = useState("");
  const [showTitles, setShowTitles] = useState(true);
  const [showMore, setShowMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [postedGig, setPostedGig] = useState(null);

  const update = (name, value) => {
    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "currency" && value === "unspecified"
        ? { budget: "" }
        : {}),
    }));

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "currency" ? { budget: "" } : {}),
    }));

    setError("");
    setSuccess("");
  };

  useEffect(() => {
    let active = true;

    async function loadSuggestions() {
      try {
        const result = await fetchGigSuggestions();

        if (active) {
          setJobs(Array.isArray(result) ? result : []);
          setApiError("");
        }
      } catch {
        if (active) {
          setApiError(
            "Live job references are unavailable."
          );
        }
      } finally {
        if (active) {
          setLoadingJobs(false);
        }
      }
    }

    loadSuggestions();

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const fromApi = jobs
      .map((job) => job.category)
      .filter(Boolean);

    return [
      ...new Set([...CATEGORIES, ...fromApi]),
    ].sort();
  }, [jobs]);

  const titleSuggestions = useMemo(() => {
    if (form.title.trim().length < 3) {
      return [];
    }

    return jobs
      .filter((job) =>
        normalize(job.title).includes(
          normalize(form.title)
        )
      )
      .slice(0, 5);
  }, [jobs, form.title]);

  const relatedJobs = useMemo(() => {
    const words = normalize(form.title)
      .split(/[^a-z0-9+#.]+/)
      .filter((word) => word.length > 2);

    if (!form.category && words.length === 0) {
      return [];
    }

    return jobs
      .map((job) => {
        let score = 0;

        if (
          form.category &&
          normalize(job.category) ===
            normalize(form.category)
        ) {
          score += 5;
        }

        words.forEach((word) => {
          if (normalize(job.title).includes(word)) {
            score += 4;
          } else if (
            normalize(job.description).includes(word)
          ) {
            score += 1;
          }
        });

        return { ...job, score };
      })
      .filter((job) => job.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [jobs, form.title, form.category]);

  const suggestedSkills = useMemo(() => {
    const defaults =
      SKILL_OPTIONS[form.category] || [];

    const apiSkills = relatedJobs
      .slice(0, 8)
      .flatMap((job) =>
        Array.isArray(job.skills) ? job.skills : []
      );

    const unique = new Map();

    [...defaults, ...apiSkills].forEach((skill) => {
      const key = normalize(skill);

      if (key && !unique.has(key)) {
        unique.set(key, skill);
      }
    });

    return [...unique.values()].slice(0, 15);
  }, [form.category, relatedJobs]);

  const selectedSkills = useMemo(
    () =>
      form.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [form.skills]
  );

  const toggleSkill = (skill) => {
    const exists = selectedSkills.some(
      (item) => normalize(item) === normalize(skill)
    );

    const updated = exists
      ? selectedSkills.filter(
          (item) =>
            normalize(item) !== normalize(skill)
        )
      : [...selectedSkills, skill];

    update("skills", updated.join(", "));
  };

  const checks = [
    form.title.trim().length >= 10,
    Boolean(form.category),
    Boolean(form.experience),
    form.description.trim().length >= 20,
    selectedSkills.length > 0,
    !validateGig(form).budget &&
      !validateGig(form).currency,
    Boolean(form.deadline) &&
      form.deadline >= today(),
  ];

  const readiness = Math.round(
    (checks.filter(Boolean).length / checks.length) *
      100
  );

  const budgetText = getBudgetText(form);

  const previewGig = {
    id: "preview",
    title: form.title || "Your Project Title",
    category: form.category || "Project Category",
    description:
      form.description ||
      "Your project description will appear here as you type.",
    skills: form.skills,
    budget: budgetText,
    currency:
      form.currency === "unspecified"
        ? null
        : form.currency,
    paymentType: form.paymentType,
    experience: form.experience || "Not selected",
    deadline: form.deadline || "Not set",
    status: "open",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const errors = validateGig(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(
        "Please correct the highlighted fields before publishing."
      );
      return;
    }

    if (typeof onAddGig !== "function") {
      setError("Project saving is not connected.");
      return;
    }

    const hasBudget =
      form.currency !== "unspecified" &&
      String(form.budget).trim() !== "";

    const amount = hasBudget
      ? Number(form.budget)
      : null;

    const newGig = {
      id: Date.now(),
      title: form.title.trim(),
      category: form.category,
      experience: form.experience,
      description: form.description.trim(),
      skills: selectedSkills.join(", "),
      paymentType: form.paymentType,

      // Currency-aware budget
      currency: hasBudget ? form.currency : null,
      budgetCurrency: hasBudget
        ? form.currency
        : null,
      budget: budgetText,
      budgetAmount: amount,
      budgetNumeric: amount,
      budgetSpecified: hasBudget,

      deadline: form.deadline,
      durationMonths:
        form.paymentType === "monthly"
          ? Number(form.durationMonths)
          : null,
      status: "open",
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);

      await onAddGig(newGig);

      setPostedGig(newGig);
      setSuccess(
        "Your project has been posted successfully."
      );
      setForm({ ...emptyForm });
      setFieldErrors({});
      setShowTitles(true);
    } catch (err) {
      setError(
        err?.message ||
          "Could not publish the project."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const FieldError = ({ name }) =>
    fieldErrors[name] ? (
      <small
        role="alert"
        style={{
          display: "block",
          marginTop: "6px",
          color: "#b42318",
          fontWeight: 600,
        }}
      >
        {fieldErrors[name]}
      </small>
    ) : null;

  return (
    <main className="post-page">
      <div className="post-container">
        <header className="post-header">
          <div>
            <p className="post-label">
              GIGNOVA / CLIENT WORKSPACE
            </p>

            <h1>Post a Gig</h1>

            <p>
              Create a clear project brief and find
              the right freelancer for your work.
            </p>
          </div>

          <div className="post-header-badge">
            Project Workspace
          </div>
        </header>

        <div className="post-layout">
          <section className="post-form-card">
            <div className="post-section-heading">
              <div>
                <span className="post-section-kicker">
                  PROJECT INFORMATION
                </span>

                <h2>Project Details</h2>

                <p>
                  Tell freelancers what you need
                  and what success looks like.
                </p>
              </div>
            </div>

            {/* PROJECT READINESS */}
            <div className="gn-quality">
              <div className="gn-quality-top">
                <div>
                  <strong>Project Readiness</strong>

                  <p>
                    {readiness === 100
                      ? "All essential details are complete."
                      : "Complete the fields to prepare your project."}
                  </p>
                </div>

                <span>{readiness}%</span>
              </div>

              <div
                className="gn-quality-track"
                role="progressbar"
                aria-label="Project completeness"
                aria-valuenow={readiness}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="gn-quality-fill"
                  style={{
                    width: `${readiness}%`,
                  }}
                />
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              {/* BASIC INFORMATION */}
              <div className="post-form-section-title">
                <span>01</span>
                <h3>Basic Information</h3>
              </div>

              <div className="form-group">
                <label htmlFor="gig-title">
                  Project Title <span>*</span>
                </label>

                <input
                  id="gig-title"
                  value={form.title}
                  maxLength={100}
                  autoComplete="off"
                  aria-invalid={Boolean(
                    fieldErrors.title
                  )}
                  onChange={(e) => {
                    update("title", e.target.value);
                    setShowTitles(true);
                  }}
                  placeholder="e.g. Build a responsive React website"
                />

                <small>
                  Use a specific title that
                  describes the work.
                </small>

                <FieldError name="title" />

                {showTitles &&
                  titleSuggestions.length > 0 && (
                    <div className="gn-title-suggestions">
                      <p>
                        Related job title suggestions
                      </p>

                      {titleSuggestions.map((job) => (
                        <button
                          type="button"
                          key={job.id}
                          onClick={() => {
                            setForm((previous) => ({
                              ...previous,
                              title: job.title,
                              category:
                                job.category ||
                                previous.category,
                            }));

                            setFieldErrors(
                              (previous) => ({
                                ...previous,
                                title: "",
                                category: "",
                              })
                            );

                            setShowTitles(false);
                          }}
                        >
                          <span>{job.title}</span>
                          <small>{job.category}</small>
                        </button>
                      ))}
                    </div>
                  )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gig-category">
                    Category <span>*</span>
                  </label>

                  <select
                    id="gig-category"
                    value={form.category}
                    aria-invalid={Boolean(
                      fieldErrors.category
                    )}
                    onChange={(e) =>
                      update(
                        "category",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>

                  <FieldError name="category" />
                </div>

                <div className="form-group">
                  <label htmlFor="gig-experience">
                    Experience Level <span>*</span>
                  </label>

                  <select
                    id="gig-experience"
                    value={form.experience}
                    aria-invalid={Boolean(
                      fieldErrors.experience
                    )}
                    onChange={(e) =>
                      update(
                        "experience",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select Level
                    </option>
                    <option value="Beginner">
                      Beginner
                    </option>
                    <option value="Intermediate">
                      Intermediate
                    </option>
                    <option value="Expert">
                      Expert
                    </option>
                  </select>

                  <FieldError name="experience" />
                </div>
              </div>

              {/* SCOPE */}
              <div className="post-form-section-title">
                <span>02</span>
                <h3>Scope & Requirements</h3>
              </div>

              <div className="form-group">
                <label htmlFor="gig-description">
                  Project Description <span>*</span>
                </label>

                <textarea
                  id="gig-description"
                  rows={6}
                  maxLength={5000}
                  value={form.description}
                  aria-invalid={Boolean(
                    fieldErrors.description
                  )}
                  onChange={(e) =>
                    update(
                      "description",
                      e.target.value
                    )
                  }
                  placeholder="Describe the project goals, main requirements, expected deliverables and any important details..."
                />

                <div className="post-field-footer">
                  <small>
                    Minimum 20 characters
                  </small>

                  <small>
                    {form.description.length}/5000
                  </small>
                </div>

                <FieldError name="description" />
              </div>

              <div className="form-group">
                <label htmlFor="gig-skills">
                  Required Skills <span>*</span>
                </label>

                <input
                  id="gig-skills"
                  value={form.skills}
                  aria-invalid={Boolean(
                    fieldErrors.skills
                  )}
                  onChange={(e) =>
                    update("skills", e.target.value)
                  }
                  placeholder="React, JavaScript, CSS"
                />

                <small>
                  Separate multiple skills
                  with commas.
                </small>

                <FieldError name="skills" />

                {suggestedSkills.length > 0 && (
                  <div className="gn-smart-skills">
                    <div className="gn-smart-skills-heading">
                      <strong>
                        Recommended Skills
                      </strong>
                      <small>
                        Select relevant skills
                      </small>
                    </div>

                    <div className="gn-smart-skill-list">
                      {suggestedSkills.map((skill) => {
                        const selected =
                          selectedSkills.some(
                            (item) =>
                              normalize(item) ===
                              normalize(skill)
                          );

                        return (
                          <button
                            key={skill}
                            type="button"
                            className={
                              selected
                                ? "gn-smart-skill selected"
                                : "gn-smart-skill"
                            }
                            onClick={() =>
                              toggleSkill(skill)
                            }
                          >
                            {selected ? "✓ " : "+ "}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* BUDGET & TIMELINE */}
              <div className="post-form-section-title">
                <span>03</span>
                <h3>Budget & Timeline</h3>
              </div>

              <div className="form-group">
                <label htmlFor="payment-type">
                  Payment Structure <span>*</span>
                </label>

                <select
                  id="payment-type"
                  value={form.paymentType}
                  onChange={(e) =>
                    update(
                      "paymentType",
                      e.target.value
                    )
                  }
                >
                  <option value="fixed">
                    Fixed Project Price
                  </option>
                  <option value="hourly">
                    Hourly Rate
                  </option>
                  <option value="monthly">
                    Monthly Payment
                  </option>
                </select>

                <FieldError name="paymentType" />
              </div>

              {/* NEW CURRENCY SELECTOR */}
              <div className="form-group">
                <label htmlFor="gig-currency">
                  Budget Currency / Option
                </label>

                <select
                  id="gig-currency"
                  value={form.currency}
                  aria-invalid={Boolean(
                    fieldErrors.currency
                  )}
                  onChange={(e) =>
                    update(
                      "currency",
                      e.target.value
                    )
                  }
                >
                  <option value="INR">
                    INR (₹) — Indian Rupees
                  </option>

                  <option value="USD">
                    USD ($) — US Dollars
                  </option>

                  <option value="unspecified">
                    Not Specified — Discuss Later
                  </option>
                </select>

                <small>
                  Choose INR, USD, or leave
                  your budget unspecified.
                </small>

                <FieldError name="currency" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gig-budget">
                    {form.paymentType === "hourly"
                      ? "Hourly Rate"
                      : form.paymentType === "monthly"
                      ? "Monthly Amount"
                      : "Project Budget"}{" "}
                    (Optional)
                  </label>

                  {form.currency === "unspecified" ? (
                    <div
                      className="budget-input"
                      style={{
                        padding: "14px",
                        background: "#f4f8ee",
                        color: "#355e3b",
                        borderRadius: "10px",
                      }}
                    >
                      Not Specified — Discuss Later
                    </div>
                  ) : (
                    <div className="budget-input">
                      <span>
                        {form.currency === "USD"
                          ? "$"
                          : "₹"}
                      </span>

                      <input
                        id="gig-budget"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={form.budget}
                        aria-invalid={Boolean(
                          fieldErrors.budget
                        )}
                        onChange={(e) =>
                          update(
                            "budget",
                            e.target.value
                          )
                        }
                        placeholder={
                          form.currency === "USD"
                            ? "100"
                            : "15000"
                        }
                      />
                    </div>
                  )}

                  <small>
                    Leave blank to display
                    "Not Specified".
                  </small>

                  <FieldError name="budget" />
                </div>

                <div className="form-group">
                  <label htmlFor="gig-deadline">
                    Deadline <span>*</span>
                  </label>

                  <input
                    id="gig-deadline"
                    type="date"
                    min={today()}
                    value={form.deadline}
                    aria-invalid={Boolean(
                      fieldErrors.deadline
                    )}
                    onChange={(e) =>
                      update(
                        "deadline",
                        e.target.value
                      )
                    }
                  />

                  <FieldError name="deadline" />
                </div>
              </div>

              {/* MONTHLY CONTRACT */}
              {form.paymentType === "monthly" && (
                <div className="form-group">
                  <label htmlFor="gig-duration">
                    Contract Duration (months)
                  </label>

                  <input
                    id="gig-duration"
                    type="number"
                    min="1"
                    max="60"
                    value={form.durationMonths}
                    aria-invalid={Boolean(
                      fieldErrors.durationMonths
                    )}
                    onChange={(e) =>
                      update(
                        "durationMonths",
                        e.target.value
                      )
                    }
                  />

                  <small>
                    Estimated contract value:{" "}
                    {budgetText === "Not Specified"
                      ? "Not Specified"
                      : formatMoney(
                          Number(form.budget) *
                            Number(
                              form.durationMonths || 0
                            ),
                          form.currency
                        )}
                  </small>

                  <FieldError name="durationMonths" />
                </div>
              )}

              {/* ERROR / SUCCESS */}
              {error && (
                <div
                  className="post-error"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="post-success"
                  role="status"
                >
                  {success}
                </div>
              )}

              <div className="post-publish-footer">
                <div>
                  <strong>
                    Ready to publish?
                  </strong>

                  <p>
                    Review your details
                    before posting.
                  </p>
                </div>

                <button
                  type="submit"
                  className="post-submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Publishing..."
                    : "Publish Project →"}
                </button>
              </div>
            </form>

            {/* PUBLISHED GIG PREVIEW */}
            {postedGig && (
              <div className="gn-posted-preview">
                <h3>Project Published</h3>

                <p>
                  Your project was submitted
                  successfully.
                </p>

                <GigCard
                  gig={postedGig}
                  onView={() => {}}
                />
              </div>
            )}
          </section>

          {/* SIDEBAR */}
          <aside className="post-sidebar">
            {/* LIVE PREVIEW */}
            <section className="gn-live-preview">
              <div className="post-side-heading">
                <div>
                  <span>REAL-TIME PREVIEW</span>
                  <h3>Project Preview</h3>
                </div>

                <span className="gn-preview-indicator">
                  ● Live
                </span>
              </div>

              <div className="gn-preview-card-wrap">
                <GigCard
                  gig={previewGig}
                  onView={() => {}}
                />
              </div>

              <p className="gn-side-note">
                This is how your project card
                may appear to freelancers.
              </p>
            </section>

            {/* REMOTIVE JOB REFERENCES */}
            <section className="gn-similar-jobs">
              <div className="post-side-heading">
                <div>
                  <span>
                    EXTERNAL JOB REFERENCES
                  </span>

                  <h3>Market Insights</h3>
                </div>
              </div>

              <p className="gn-similar-intro">
                Explore related remote job
                listings from Remotive.
              </p>

              {loadingJobs ? (
                <div className="gn-similar-state">
                  Loading job references...
                </div>
              ) : apiError ? (
                <div className="gn-similar-state">
                  {apiError}
                </div>
              ) : relatedJobs.length === 0 ? (
                <div className="gn-similar-state">
                  Enter a project title or
                  select a category to view
                  related jobs.
                </div>
              ) : (
                <>
                  <div className="gn-similar-list">
                    {relatedJobs
                      .slice(
                        0,
                        showMore ? 8 : 4
                      )
                      .map((job) => (
                        <article
                          className="gn-similar-item"
                          key={job.id}
                        >
                          <span className="gn-api-tag">
                            REMOTIVE
                          </span>

                          <h4>{job.title}</h4>
                          <p>{job.company}</p>

                          {job.salary && (
                            <small>
                              Listed Salary:{" "}
                              {job.salary}
                            </small>
                          )}

                          <div className="gn-similar-tags">
                            {(Array.isArray(job.skills)
                              ? job.skills
                              : []
                            )
                              .slice(0, 3)
                              .map((skill) => (
                                <span key={skill}>
                                  {skill}
                                </span>
                              ))}
                          </div>

                          {job.url && (
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View original listing ↗
                            </a>
                          )}
                        </article>
                      ))}
                  </div>

                  {relatedJobs.length > 4 && (
                    <button
                      type="button"
                      className="gn-show-more"
                      onClick={() =>
                        setShowMore(
                          (value) => !value
                        )
                      }
                    >
                      {showMore
                        ? "Show Fewer Jobs"
                        : "Show More Jobs"}
                    </button>
                  )}
                </>
              )}

              <p className="gn-side-note">
                These are external job references,
                not GigNova client projects.
              </p>
            </section>

            {/* GUIDANCE */}
            <section className="post-guidance-card">
              <h3>Before You Publish</h3>

              <div className="post-guidance-item">
                <span>01</span>
                <p>
                  Write a clear and specific
                  project title.
                </p>
              </div>

              <div className="post-guidance-item">
                <span>02</span>
                <p>
                  Explain the expected deliverables.
                </p>
              </div>

              <div className="post-guidance-item">
                <span>03</span>
                <p>
                  Choose relevant skills
                  and experience.
                </p>
              </div>

              <div className="post-guidance-item">
                <span>04</span>
                <p>
                  Select INR, USD or Not Specified
                  for your budget.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

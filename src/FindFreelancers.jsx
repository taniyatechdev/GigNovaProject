
import React, { useMemo, useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./FindFreelancers.css";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const norm = (x) => String(x ?? "").trim().toLowerCase();

const loadProfile = (email) => {
  try {
    const v = JSON.parse(
      localStorage.getItem(`gignovaProfile:${norm(email)}`) || "null"
    );

    return v && typeof v === "object" && !Array.isArray(v)
      ? v
      : {};
  } catch {
    return {};
  }
};

const today = () => {
  const d = new Date();

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const emptyForm = {
  title: "",
  description: "",
  budget: "",
  deadline: "",
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function FindFreelancers({
  proposals = [],
  projects = [],
  reviews = [],
}) {
  const { user, sendInvitation } = useGigNova();

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("all");
  const [minRating, setMinRating] = useState("all");
  const [sort, setSort] = useState("rating");

  const [selected, setSelected] = useState(null);
  const [hireOpen, setHireOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // GET FREELANCERS
  // ========================================

  const freelancers = useMemo(() => {
    const map = new Map();

    [...proposals, ...projects].forEach((item) => {
      const email = norm(item.freelancerEmail);

      if (email && !map.has(email)) {
        map.set(email, {
          email,
          name: item.freelancerName || "Freelancer",
        });
      }
    });

    return [...map.values()].map((item) => {
      const p = loadProfile(item.email);

      const skills = (
        Array.isArray(p.skills)
          ? p.skills
          : String(p.skills || "").split(",")
      )
        .map((x) => String(x).trim())
        .filter(Boolean);

      const matches = reviews.filter(
        (r) =>
          norm(r.freelancerEmail) === item.email &&
          Number(r.rating) >= 1 &&
          Number(r.rating) <= 5
      );

      const average = matches.length
        ? matches.reduce((sum, r) => sum + Number(r.rating), 0) /
          matches.length
        : 0;

      const completed = projects.filter(
        (pr) =>
          norm(pr.freelancerEmail) === item.email &&
          pr.status === "completed"
      ).length;

      return {
        ...item,
        name: p.name || item.name,
        bio: p.bio || "",
        location: p.location || "Not specified",
        experience: p.experience || "Not specified",
        skills,
        reviews: matches,
        total: matches.length,
        average,
        completed,
      };
    });
  }, [proposals, projects, reviews]);

  // ========================================
  // SEARCH, FILTER AND SORT
  // ========================================

  const results = useMemo(() => {
    return freelancers
      .filter((f) => {
        const text = norm(
          [f.name, f.bio, f.location, ...f.skills].join(" ")
        );

        const matchSearch =
          !search || text.includes(norm(search));

        const matchExperience =
          experience === "all" ||
          norm(f.experience) === norm(experience);

        const matchRating =
          minRating === "all" ||
          (f.total > 0 && f.average >= Number(minRating));

        return matchSearch && matchExperience && matchRating;
      })
      .sort((a, b) => {
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        }

        if (sort === "projects") {
          return (
            b.completed - a.completed ||
            b.average - a.average
          );
        }

        return (
          b.average - a.average ||
          b.total - a.total
        );
      });
  }, [freelancers, search, experience, minRating, sort]);

  // ========================================
  // SELECTED FREELANCER
  // ========================================

  const freelancer = freelancers.find(
    (f) => f.email === selected
  );

  // ========================================
  // VIEW FREELANCER PROFILE
  // ========================================

  const showProfile = (email) => {
    setSelected(email);
    setHireOpen(false);
    setError("");
    setSuccess("");
    setForm(emptyForm);
  };

  // ========================================
  // SEND HIRING INVITATION
  // ========================================

  const submitHire = (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      sendInvitation({
        ...form,
        freelancerEmail: freelancer.email,
        freelancerName: freelancer.name,
      });

      setSuccess(
        "Invitation sent! Check My Invitations → Sent."
      );

      setHireOpen(false);
      setForm(emptyForm);
    } catch (err) {
      setError(
        err.message || "Unable to send invitation."
      );
    }
  };

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setSearch("");
    setExperience("all");
    setMinRating("all");
    setSort("rating");
  };

  // ========================================
  // JSX
  // ========================================

  return (
    <main className="ff-page">
      <div className="ff-container">

        {freelancer ? (
          <>
            {/* BACK BUTTON */}

            <button
              className="ff-back"
              onClick={() => setSelected(null)}
            >
              ← Back to Freelancers
            </button>

            {/* FREELANCER PROFILE HEADER */}

            <section className="ff-profile-head">
              <div className="ff-avatar">
                {freelancer.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1>{freelancer.name}</h1>

                <p>{freelancer.location}</p>

                <strong>
                  {freelancer.total
                    ? `⭐ ${freelancer.average.toFixed(1)} / 5 (${freelancer.total} reviews)`
                    : "☆ No reviews yet"}
                </strong>
              </div>
            </section>

            {/* FREELANCER DETAILS */}

            <section className="ff-panel">
              <h2>About Freelancer</h2>

              <p>
                {freelancer.bio || "No bio added yet."}
              </p>

              <h2>Skills</h2>

              <div className="ff-tags">
                {freelancer.skills.length
                  ? freelancer.skills.map((skill, index) => (
                      <span key={index}>{skill}</span>
                    ))
                  : "No skills added yet."}
              </div>

              <h2>Experience</h2>
              <p>{freelancer.experience}</p>

              <h2>Completed Projects</h2>
              <p>{freelancer.completed}</p>
            </section>

            {/* HIRE FREELANCER */}

            {!user ? (
              <p className="ff-notice">
                Log in to send a hiring invitation.
              </p>
            ) : (
              norm(user.email) !== freelancer.email && (
                <section className="ff-panel">

                  <button
                    className="ff-primary"
                    onClick={() => {
                      setHireOpen((v) => !v);
                      setError("");
                      setSuccess("");
                    }}
                  >
                    💼 {hireOpen ? "Cancel" : "Hire Freelancer"}
                  </button>

                  {success && (
                    <p className="ff-success" role="status">
                      {success}
                    </p>
                  )}

                  {hireOpen && (
                    <form
                      className="ff-form"
                      onSubmit={submitHire}
                    >
                      <h2>Send Project Invitation</h2>

                      {/* PROJECT TITLE */}

                      <label>
                        Project Title

                        <input
                          required
                          minLength={5}
                          value={form.title}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              title: e.target.value,
                            })
                          }
                        />
                      </label>

                      {/* DESCRIPTION */}

                      <label>
                        Description

                        <textarea
                          required
                          minLength={20}
                          rows={4}
                          value={form.description}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              description: e.target.value,
                            })
                          }
                        />
                      </label>

                      {/* BUDGET */}

                      <label>
                        Budget (₹)

                        <input
                          type="number"
                          min="1"
                          required
                          value={form.budget}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              budget: e.target.value,
                            })
                          }
                        />
                      </label>

                      {/* DEADLINE */}

                      <label>
                        Deadline

                        <input
                          type="date"
                          min={today()}
                          required
                          value={form.deadline}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              deadline: e.target.value,
                            })
                          }
                        />
                      </label>

                      {/* ERROR MESSAGE */}

                      {error && (
                        <p className="ff-error" role="alert">
                          {error}
                        </p>
                      )}

                      <button
                        className="ff-primary"
                        type="submit"
                      >
                        Send Invitation →
                      </button>
                    </form>
                  )}
                </section>
              )
            )}

            {/* CLIENT REVIEWS */}

            <section className="ff-panel">
              <h2>Client Reviews</h2>

              {freelancer.reviews.length ? (
                freelancer.reviews.map((review, index) => (
                  <article
                    className="ff-review"
                    key={review.id || index}
                  >
                    <strong>
                      {review.clientName || "Client"} ·{" "}
                      {"★".repeat(
                        Math.round(Number(review.rating))
                      )}
                    </strong>

                    <p>{review.comment}</p>
                  </article>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </section>
          </>
        ) : (
          <>
            {/* PAGE HEADER */}

            <header className="ff-header">
              <small>GIGNOVA TALENT DIRECTORY</small>

              <h1>Find Your Perfect Freelancer</h1>

              <p>
                Discover real freelancers, skills,
                experience and client reviews.
              </p>
            </header>

            {/* SEARCH AND FILTERS */}

            <div className="ff-filters">

              {/* SEARCH */}

              <label>
                Search

                <input
                  placeholder="Name, skill or location"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </label>

              {/* EXPERIENCE */}

              <label>
                Experience

                <select
                  value={experience}
                  onChange={(e) =>
                    setExperience(e.target.value)
                  }
                >
                  <option value="all">All</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              {/* RATING */}

              <label>
                Rating

                <select
                  value={minRating}
                  onChange={(e) =>
                    setMinRating(e.target.value)
                  }
                >
                  <option value="all">All</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </label>

              {/* SORT */}

              <label>
                Sort

                <select
                  value={sort}
                  onChange={(e) =>
                    setSort(e.target.value)
                  }
                >
                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="projects">
                    Most Projects
                  </option>

                  <option value="name">
                    Name A–Z
                  </option>
                </select>
              </label>

              {/* CLEAR FILTERS */}

              <button onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

            {/* FREELANCERS COUNT */}

            <h2>
              Explore Freelancers ({results.length})
            </h2>

            {/* FREELANCERS LIST */}

            {results.length === 0 ? (
              <div className="ff-panel">
                {freelancers.length
                  ? "No freelancers match your filters."
                  : "No freelancers yet. Freelancers appear after submitting a proposal or joining a project."}
              </div>
            ) : (
              <div className="ff-grid">

                {results.map((f) => (
                  <article
                    className="ff-card"
                    key={f.email}
                  >
                    {/* CARD HEADER */}

                    <div className="ff-card-head">
                      <div className="ff-avatar">
                        {f.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3>{f.name}</h3>
                        <p>{f.location}</p>
                      </div>
                    </div>

                    {/* RATING */}

                    <div className="ff-rating">
                      {f.total
                        ? `⭐ ${f.average.toFixed(1)} / 5 (${f.total} reviews)`
                        : "☆ No reviews yet"}
                    </div>

                    {/* BIO */}

                    <p>{f.bio || "No bio added yet."}</p>

                    {/* SKILLS */}

                    <div className="ff-tags">
                      {f.skills.slice(0, 5).map((skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* EXPERIENCE */}

                    <p>
                      <strong>Experience:</strong>{" "}
                      {f.experience}
                    </p>

                    {/* COMPLETED PROJECTS */}

                    <p>
                      <strong>Completed:</strong>{" "}
                      {f.completed} projects
                    </p>

                    {/* VIEW PROFILE */}

                    <button
                      className="ff-primary"
                      onClick={() => showProfile(f.email)}
                    >
                      View Freelancer Profile →
                    </button>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}


import React, { useEffect, useMemo, useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./MyProfile.css";

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const readStorage = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  } catch {
    return {};
  }
};

const initialProfile = {
  name: "",
  headline: "",
  bio: "",
  location: "",
  experience: "",
  education: "",
  hourlyRate: "",
  skills: [],
  portfolio: [],
  avatar: "",
  availability: "Available for Work",
};

const toSkills = (value) =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function MyProfile() {
  const { user, projects = [] } = useGigNova();

  const email = normalize(user?.email);
  const profileKey = `gignovaProfile:${email || user?.id || "guest"}`;

  const [profile, setProfile] = useState(initialProfile);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [portfolioTitle, setPortfolioTitle] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");

  useEffect(() => {
    const saved = readStorage(profileKey);

    setProfile({
      ...initialProfile,
      ...saved,
      name: saved.name || user?.name || "",
      skills: Array.isArray(saved.skills)
        ? saved.skills
        : toSkills(saved.skills || ""),
      portfolio: Array.isArray(saved.portfolio)
        ? saved.portfolio
        : [],
    });

    setMessage("");
  }, [profileKey, user?.name]);

  const updateField = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setMessage("");
  };

  const completion = useMemo(() => {
    const fields = [
      profile.name,
      profile.headline,
      profile.bio,
      profile.location,
      profile.experience,
      profile.education,
      profile.hourlyRate,
      profile.avatar,
      profile.skills.length > 0,
      profile.portfolio.length > 0,
    ];

    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const myProjects = projects.filter(
    (project) =>
      normalize(project.freelancerId) === normalize(user?.id) ||
      normalize(project.freelancerEmail) === email ||
      normalize(project.clientId) === normalize(user?.id) ||
      normalize(project.clientEmail) === email
  );

  const completedProjects = myProjects.filter(
    (project) => project.status === "completed"
  );

  const saveProfile = () => {
    if (!profile.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    try {
      localStorage.setItem(profileKey, JSON.stringify(profile));
      setEditing(false);
      setMessage("Profile saved successfully!");
    } catch {
      setMessage(
        "Could not save your profile. Try using a smaller photo."
      );
    }
  };

  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 500000) {
      setMessage("Please choose an image smaller than 500 KB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("avatar", String(reader.result));
    };

    reader.onerror = () => {
      setMessage("Unable to upload profile photo.");
    };

    reader.readAsDataURL(file);
  };

  const addSkill = () => {
    const newSkill = skillInput.trim();

    if (!newSkill) return;

    if (
      profile.skills.some(
        (skill) => normalize(skill) === normalize(newSkill)
      )
    ) {
      setSkillInput("");
      return;
    }

    updateField("skills", [...profile.skills, newSkill]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    updateField(
      "skills",
      profile.skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const addPortfolio = () => {
    const title = portfolioTitle.trim();
    const link = portfolioLink.trim();

    if (!title) {
      setMessage("Please enter a portfolio project title.");
      return;
    }

    if (link) {
      try {
        const url = new URL(link);
        if (!["https:", "http:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setMessage("Enter a valid http or https project URL.");
        return;
      }
    }

    updateField("portfolio", [
      ...profile.portfolio,
      {
        id: Date.now().toString(),
        title,
        link,
      },
    ]);

    setPortfolioTitle("");
    setPortfolioLink("");
  };

  const removePortfolio = (id) => {
    updateField(
      "portfolio",
      profile.portfolio.filter((item) => item.id !== id)
    );
  };

  const cancelEditing = () => {
    const saved = readStorage(profileKey);

    setProfile({
      ...initialProfile,
      ...saved,
      name: saved.name || user?.name || "",
      skills: Array.isArray(saved.skills)
        ? saved.skills
        : toSkills(saved.skills || ""),
      portfolio: Array.isArray(saved.portfolio)
        ? saved.portfolio
        : [],
    });

    setEditing(false);
    setMessage("");
  };

  return (
    <main className="gn-profile-page">
      <div className="gn-profile-heading">
        <div>
          <span className="gn-profile-eyebrow">
            GIGNOVA WORKSPACE
          </span>
          <h1>My Profile</h1>
          <p>Build your professional identity on GigNova.</p>
        </div>

        {!editing ? (
          <button
            type="button"
            className="gn-profile-primary"
            onClick={() => setEditing(true)}
          >
            ✎ Edit Profile
          </button>
        ) : (
          <div className="gn-profile-heading-actions">
            <button
              type="button"
              className="gn-profile-outline"
              onClick={cancelEditing}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gn-profile-primary"
              onClick={saveProfile}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="gn-profile-message" role="status">
          {message}
        </div>
      )}

      <div className="gn-profile-layout">
        <div className="gn-profile-main">
          {/* PROFILE HEADER */}
          <section className="gn-profile-card gn-profile-hero">
            <div className="gn-profile-cover" />

            <div className="gn-profile-hero-content">
              <div className="gn-profile-avatar-wrap">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="gn-profile-avatar"
                  />
                ) : (
                  <div className="gn-profile-avatar gn-profile-avatar-placeholder">
                    {profile.name?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                )}

                {editing && (
                  <label className="gn-profile-upload">
                    📷
                    <input
                      type="file"
                      accept="image/*"
                      onChange={uploadAvatar}
                      hidden
                    />
                  </label>
                )}
              </div>

              <div className="gn-profile-identity">
                {editing ? (
                  <>
                    <label>Full Name</label>
                    <input
                      value={profile.name}
                      onChange={(e) =>
                        updateField("name", e.target.value)
                      }
                      placeholder="Your full name"
                    />

                    <label>Professional Headline</label>
                    <input
                      value={profile.headline}
                      onChange={(e) =>
                        updateField("headline", e.target.value)
                      }
                      placeholder="React Developer | UI Designer"
                    />
                  </>
                ) : (
                  <>
                    <h2>{profile.name || "Your Name"}</h2>
                    <p>
                      {profile.headline ||
                        "Add your professional headline"}
                    </p>
                  </>
                )}

                <div className="gn-profile-badges">
                  <span>✓ GigNova Member</span>
                  <span>
                    {profile.availability || "Available for Work"}
                  </span>
                </div>
              </div>
            </div>

            <div className="gn-profile-stats">
              <div>
                <strong>{myProjects.length}</strong>
                <span>Total Projects</span>
              </div>

              <div>
                <strong>{completedProjects.length}</strong>
                <span>Completed</span>
              </div>

              <div>
                <strong>{profile.skills.length}</strong>
                <span>Skills</span>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section className="gn-profile-card gn-profile-section">
            <div className="gn-profile-section-header">
              <h3>👤 About Me</h3>
              <span>Professional Introduction</span>
            </div>

            {editing ? (
              <textarea
                rows={5}
                value={profile.bio}
                onChange={(e) =>
                  updateField("bio", e.target.value)
                }
                placeholder="Tell clients about your experience, strengths and what you can offer..."
              />
            ) : (
              <p className="gn-profile-body">
                {profile.bio ||
                  "Write a professional introduction to help clients understand your expertise."}
              </p>
            )}
          </section>

          {/* SKILLS */}
          <section className="gn-profile-card gn-profile-section">
            <div className="gn-profile-section-header">
              <h3>⚡ Skills & Expertise</h3>
              <span>{profile.skills.length} Skills</span>
            </div>

            <div className="gn-profile-skills">
              {profile.skills.length === 0 && !editing && (
                <p className="gn-profile-muted">
                  No skills added yet.
                </p>
              )}

              {profile.skills.map((skill) => (
                <span className="gn-profile-skill" key={skill}>
                  {skill}

                  {editing && (
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {editing && (
              <div className="gn-profile-inline-form">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add skill e.g. React"
                />

                <button
                  type="button"
                  className="gn-profile-primary"
                  onClick={addSkill}
                >
                  + Add
                </button>
              </div>
            )}
          </section>

          {/* PORTFOLIO */}
          <section className="gn-profile-card gn-profile-section">
            <div className="gn-profile-section-header">
              <h3>💼 Portfolio</h3>
              <span>Featured Work</span>
            </div>

            {profile.portfolio.length === 0 && (
              <p className="gn-profile-muted">
                Add projects to showcase your best work.
              </p>
            )}

            <div className="gn-profile-portfolio-grid">
              {profile.portfolio.map((item) => (
                <div
                  className="gn-profile-portfolio-item"
                  key={item.id}
                >
                  <div className="gn-profile-portfolio-icon">
                    💻
                  </div>

                  <h4>{item.title}</h4>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Project ↗
                    </a>
                  )}

                  {editing && (
                    <button
                      type="button"
                      className="gn-profile-remove"
                      onClick={() => removePortfolio(item.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {editing && (
              <div className="gn-profile-portfolio-form">
                <input
                  value={portfolioTitle}
                  onChange={(e) =>
                    setPortfolioTitle(e.target.value)
                  }
                  placeholder="Project title"
                />

                <input
                  value={portfolioLink}
                  onChange={(e) =>
                    setPortfolioLink(e.target.value)
                  }
                  placeholder="https://your-project-link.com"
                />

                <button
                  type="button"
                  className="gn-profile-primary"
                  onClick={addPortfolio}
                >
                  + Add Portfolio Project
                </button>
              </div>
            )}
          </section>

          {/* EXPERIENCE */}
          <section className="gn-profile-card gn-profile-section">
            <div className="gn-profile-section-header">
              <h3>🎓 Experience & Education</h3>
            </div>

            <div className="gn-profile-fields">
              <div>
                <label>Experience</label>

                {editing ? (
                  <input
                    value={profile.experience}
                    onChange={(e) =>
                      updateField("experience", e.target.value)
                    }
                    placeholder="e.g. 1 year"
                  />
                ) : (
                  <strong>
                    {profile.experience || "Not added"}
                  </strong>
                )}
              </div>

              <div>
                <label>Education</label>

                {editing ? (
                  <input
                    value={profile.education}
                    onChange={(e) =>
                      updateField("education", e.target.value)
                    }
                    placeholder="e.g. BTech Computer Science"
                  />
                ) : (
                  <strong>
                    {profile.education || "Not added"}
                  </strong>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="gn-profile-sidebar">
          <section className="gn-profile-card gn-profile-side-card">
            <h3>Profile Strength</h3>

            <div className="gn-profile-completion">
              <strong>{completion}%</strong>
              <span>Completed</span>
            </div>

            <div className="gn-profile-progress-track">
              <div
                className="gn-profile-progress-fill"
                style={{ width: `${completion}%` }}
              />
            </div>

            <p>
              Complete your profile to showcase more
              information to clients.
            </p>
          </section>

          <section className="gn-profile-card gn-profile-side-card">
            <h3>Profile Details</h3>

            <div className="gn-profile-side-field">
              <span>📍 Location</span>

              {editing ? (
                <input
                  value={profile.location}
                  onChange={(e) =>
                    updateField("location", e.target.value)
                  }
                  placeholder="City, Country"
                />
              ) : (
                <strong>
                  {profile.location || "Not added"}
                </strong>
              )}
            </div>

            <div className="gn-profile-side-field">
              <span>💰 Hourly Rate</span>

              {editing ? (
                <input
                  type="number"
                  min="0"
                  value={profile.hourlyRate}
                  onChange={(e) =>
                    updateField("hourlyRate", e.target.value)
                  }
                  placeholder="₹ per hour"
                />
              ) : (
                <strong>
                  {profile.hourlyRate
                    ? `₹${profile.hourlyRate}/hr`
                    : "Not specified"}
                </strong>
              )}
            </div>

            <div className="gn-profile-side-field">
              <span>🟢 Availability</span>

              {editing ? (
                <select
                  value={profile.availability}
                  onChange={(e) =>
                    updateField("availability", e.target.value)
                  }
                >
                  <option>Available for Work</option>
                  <option>Busy</option>
                  <option>Not Available</option>
                </select>
              ) : (
                <strong>{profile.availability}</strong>
              )}
            </div>

            <div className="gn-profile-side-field">
              <span>✉️ Email</span>
              <strong className="gn-profile-email">
                {user?.email || "Not available"}
              </strong>
            </div>
          </section>

          <section className="gn-profile-card gn-profile-side-card">
            <h3>Why Complete Your Profile?</h3>

            <p>
              A detailed profile helps clients learn about
              your skills, work and experience.
            </p>

            {!editing && (
              <button
                type="button"
                className="gn-profile-primary gn-profile-full"
                onClick={() => setEditing(true)}
              >
                Improve Profile →
              </button>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}

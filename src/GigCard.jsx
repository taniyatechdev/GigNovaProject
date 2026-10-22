
import React from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  saveGig,
  removeSavedGig,
} from "./redux/savedGigsSlice";

import "./GigCard.css";

export default function GigCard({
  gig,
  onView,
  onViewGig,
}) {
  const dispatch = useDispatch();

  const savedGigs = useSelector(
    (state) => state.savedGigs.gigs
  );

  if (!gig) {
    return null;
  }

  const isSaved = savedGigs.some(
    (item) => String(item.id) === String(gig.id)
  );

  const handleSave = () => {
    if (isSaved) {
      dispatch(removeSavedGig(gig.id));
    } else {
      dispatch(saveGig(gig));
    }
  };

  const handleViewDetails = () => {
    const viewHandler = onViewGig || onView;

    if (typeof viewHandler === "function") {
      viewHandler(gig);
    }
  };

  const skills = Array.isArray(gig.skills)
    ? gig.skills
    : typeof gig.skills === "string"
    ? gig.skills.split(",").map((skill) => skill.trim())
    : [];

  const budget =
    gig.budget !== undefined &&
    gig.budget !== null &&
    gig.budget !== ""
      ? gig.budget
      : gig.salary || "Negotiable";

  const status = gig.status || "Open";

  return (
    <article className="gig-flashcard">
      <div className="flashcard-header">
        <span className="flashcard-badge">
          {gig.category || "Freelance"}
        </span>

        <span className="flashcard-status">
          {status}
        </span>
      </div>

      <h3 className="flashcard-title">
        {gig.title || "Untitled Gig"}
      </h3>

      <p className="flashcard-description">
        {gig.description
          ? String(gig.description)
              .replace(/<[^>]*>/g, "")
              .slice(0, 170)
          : "Explore this freelance opportunity."}
      </p>

      <div className="flashcard-skills">
        {skills.slice(0, 5).map((skill, index) => (
          <span
            className="skill-pill"
            key={`${skill}-${index}`}
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flashcard-footer">
        <div className="flashcard-pricing">
          <span className="price-label">
            Budget
          </span>

          <strong className="price-value">
            {typeof budget === "number"
              ? `₹${budget.toLocaleString("en-IN")}`
              : String(budget)}
          </strong>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            aria-pressed={isSaved}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1px solid #9ab9a6",
              background: isSaved
                ? "#e0f2e5"
                : "#ffffff",
              color: "#245b3e",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {isSaved ? "♥ Saved" : "♡ Save Gig"}
          </button>

          <button
            type="button"
            className="view-details-cta"
            onClick={handleViewDetails}
          >
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
}


import React, { useState } from "react";
import "./Reviews.css";

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

function Reviews({
  user,
  projects = [],
  reviews = [],
  onAddReview,
}) {
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId =
    user?.id ?? user?.email ?? user?.name;

  const completedProjects = projects.filter(
    (project) =>
      project.status === "completed" &&
      sameId(project.clientId, userId)
  );

  const handleSubmit = (project) => {
    setError("");
    setSuccess("");

    const rating = Number(ratings[project.id]);
    const comment = (comments[project.id] || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (comment.length < 10) {
      setError("Please write at least 10 characters.");
      return;
    }

    try {
      onAddReview({
        projectId: project.id,
        rating,
        comment,
      });

      setSuccess("Review submitted successfully!");
      setComments((prev) => ({
        ...prev,
        [project.id]: "",
      }));
    } catch (err) {
      setError(err.message || "Could not submit review.");
    }
  };

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <p>GIGNOVA FEEDBACK</p>
        <h1>Ratings & Reviews ⭐</h1>
        <span>
          Share feedback about your completed projects.
        </span>
      </div>

      {error && (
        <p className="reviews-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="reviews-success" role="status">
          {success}
        </p>
      )}

      {completedProjects.length === 0 && (
        <div className="reviews-empty">
          <h3>No completed projects yet</h3>
          <p>
            Once your project is completed, you can
            review the freelancer here.
          </p>
        </div>
      )}

      <div className="reviews-grid">
        {completedProjects.map((project) => {
          const existingReview = reviews.find(
            (review) =>
              sameId(review.projectId, project.id)
          );

          return (
            <div className="review-card" key={project.id}>
              <h3>{project.title}</h3>

              <p>
                Freelancer:{" "}
                <strong>{project.freelancerName}</strong>
              </p>

              {existingReview ? (
                <div className="existing-review">
                  <div className="review-stars">
                    {"★".repeat(existingReview.rating)}
                    {"☆".repeat(5 - existingReview.rating)}
                  </div>
                  <p>{existingReview.comment}</p>
                  <small>Review submitted</small>
                </div>
              ) : (
                <>
                  <p>How would you rate this freelancer?</p>

                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        aria-label={`${star} star rating`}
                        aria-pressed={
                          Number(ratings[project.id]) === star
                        }
                        className={
                          star <= (ratings[project.id] || 0)
                            ? "selected-star"
                            : ""
                        }
                        onClick={() =>
                          setRatings((prev) => ({
                            ...prev,
                            [project.id]: star,
                          }))
                        }
                      >
                        ★
                      </button>
                    ))}
                  </div>

                  <textarea
                    placeholder="Write your experience with this freelancer..."
                    value={comments[project.id] || ""}
                    maxLength={1000}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [project.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    className="submit-review-btn"
                    onClick={() => handleSubmit(project)}
                  >
                    Submit Review
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Reviews;

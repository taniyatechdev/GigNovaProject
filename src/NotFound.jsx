
import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  return (
    <main className="nf-page">
      <section className="nf-card">
        <div className="nf-brand">
          <span className="nf-brand-icon">✦</span>
          <span>Gig</span>
          <span>Nova</span>
        </div>

        <div className="nf-illustration">
          <span className="nf-star nf-star-one">✦</span>
          <span className="nf-star nf-star-two">✧</span>
          <div className="nf-planet">404</div>
          <span className="nf-orbit" />
        </div>

        <span className="nf-badge">OOPS! WRONG TURN</span>

        <h1>
          Looks like you're
          <br />
          <span>off the map.</span>
        </h1>

        <p className="nf-description">
          The page you're looking for may have moved,
          or it might not exist. Let's get your journey
          back on track!
        </p>

        <div className="nf-actions">
          <Link to="/" className="nf-home-btn">
            <span>←</span> Back to Home
          </Link>

          <button
            type="button"
            className="nf-back-btn"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>

        <div className="nf-footer">
          <span>404</span> — PAGE NOT FOUND
          <span className="nf-footer-brand">
            From Dream to Destination ✨
          </span>
        </div>
      </section>
    </main>
  );
}

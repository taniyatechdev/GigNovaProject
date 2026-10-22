import React from "react";
import "./Home.css";

function Home({ setPage }) {
  return (
    <div className="home">

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            ✦ The Future of Freelancing
          </div>

          <h1>
            Turn Your
            <br />
            <span>Skills Into</span>
            <br />
            Opportunities.
          </h1>

          <p>
            GigNova connects talented freelancers with amazing clients.
            Find work, showcase your skills, and grow your career.
          </p>

          <div className="hero-buttons">

            <button onClick={() => setPage("browse")}>
              Browse Gigs →
            </button>

            <button onClick={() => setPage("post")}>
              Post a Gig
            </button>

          </div>


          {/* STATS */}

          <div className="hero-stats">

            <div className="stat">
              <h3>10K+</h3>
              <p>Freelancers</p>
            </div>

            <div className="stat">
              <h3>5K+</h3>
              <p>Projects</p>
            </div>

            <div className="stat">
              <h3>4.9★</h3>
              <p>Rating</p>
            </div>

          </div>

        </div>


        {/* ================= HERO IMAGE ================= */}

        <div className="hero-image">

          <img
            src="https://images.pexels.com/photos/6392968/pexels-photo-6392968.jpeg"
            alt="Freelancer working on laptop"
          />

          <div className="floating-card completed-card">
            ✓ Project Completed
          </div>

          <div className="floating-card earning-card">
            ₹25K Earned
          </div>

        </div>

      </section>


      {/* ================= CATEGORIES ================= */}

      <section className="categories">

        <h2 className="section-title">
          Explore Popular Skills
        </h2>

        <p className="section-subtitle">
          Find talented freelancers for your next project
        </p>


        <div className="category-grid">

          <div className="category-card">
            <div>💻</div>
            <h3>Web Development</h3>
            <p>
              Websites, React, JavaScript and more
            </p>
          </div>


          <div className="category-card">
            <div>🎨</div>
            <h3>Graphic Design</h3>
            <p>
              Logos, branding and creative designs
            </p>
          </div>


          <div className="category-card">
            <div>✍️</div>
            <h3>Content Writing</h3>
            <p>
              Blogs, articles and copywriting
            </p>
          </div>


          <div className="category-card">
            <div>📈</div>
            <h3>Digital Marketing</h3>
            <p>
              SEO, social media and marketing
            </p>
          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}

      <section className="home-cta">

        <h2>
          Ready to Start Your Journey?
        </h2>

        <p>
          Your next opportunity is just a click away.
        </p>

        <button
          className="primary-btn"
          onClick={() => setPage("browse")}
        >
          Explore Gigs →
        </button>

      </section>

    </div>
  );
}

export default Home;
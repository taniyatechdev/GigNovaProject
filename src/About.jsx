import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="about-label">✦ About GigNova</div>

        <h1>Building GigNova</h1>

        <p>
          GigNova is a freelancing platform designed to connect clients
          with talented freelancers. This project has been developed
          step-by-step using React and simple interactive features.
        </p>
      </section>


      {/* ================= INTRO ================= */}
      <section className="about-intro">
        <h2>What is GigNova?</h2>

        <p>
          GigNova allows users to explore available freelance gigs,
          view project details, post their own projects, and manage
          their posted gigs. The main goal of this project is to create
          a simple, user-friendly and interactive freelancing platform.
        </p>
      </section>


      {/* ================= PROJECT TRACK ================= */}
      <section className="project-track">

        <div className="track-heading">
          <h2>🚀 Project Development Track</h2>

          <p>
            Here is the journey of GigNova from a basic website to
            an interactive React project.
          </p>
        </div>


        <div className="timeline">

          {/* PHASE 1 */}
          <div className="track-item">

            <div className="track-number">
              1
            </div>

            <div className="track-card">

              <h3>Phase 1 — Basic Website</h3>

              <ul>
                <li>Created the basic GigNova website structure.</li>
                <li>Designed the Home page.</li>
                <li>Added Navbar and Footer.</li>
                <li>Created Browse Gigs page.</li>
                <li>Created Post a Gig page.</li>
              </ul>

            </div>
          </div>


          {/* PHASE 2 */}
          <div className="track-item">

            <div className="track-number">
              2
            </div>

            <div className="track-card">

              <h3>Phase 2 — React Conversion</h3>

              <ul>
                <li>Converted the website into React.</li>
                <li>Created reusable React components.</li>
                <li>Created GigCard component.</li>
                <li>Used React props to pass data.</li>
                <li>Used useState for dynamic functionality.</li>
              </ul>

            </div>
          </div>


          {/* PHASE 3 */}
          <div className="track-item">

            <div className="track-number">
              3
            </div>

            <div className="track-card">

              <h3>Phase 3 — Gig Features</h3>

              <ul>
                <li>Added search functionality for gigs.</li>
                <li>Added gig filtering.</li>
                <li>Created Gig Details page.</li>
                <li>Added Post a Gig form.</li>
                <li>Added Dashboard for posted gigs.</li>
                <li>Added Delete Gig functionality.</li>
              </ul>

            </div>
          </div>


          {/* PHASE 4 */}
          <div className="track-item">

            <div className="track-number">
              4
            </div>

            <div className="track-card">

              <h3>Phase 4 — Authentication</h3>

              <ul>
                <li>Created Login page.</li>
                <li>Created Signup page.</li>
                <li>Added email and password validation.</li>
                <li>Added login and logout functionality.</li>
                <li>Used browser storage for login data.</li>
              </ul>

            </div>
          </div>


          {/* PHASE 5 */}
          <div className="track-item">

            <div className="track-number">
              5
            </div>

            <div className="track-card">

              <h3>Phase 5 — UI & User Experience</h3>

              <ul>
                <li>Improved the overall website design.</li>
                <li>Added Pista Green and Cream theme.</li>
                <li>Improved cards, buttons and forms.</li>
                <li>Added responsive design for smaller screens.</li>
                <li>Improved navigation between pages.</li>
              </ul>

            </div>
          </div>

        </div>
      </section>


      {/* ================= CURRENT STATUS ================= */}
      <section className="current-status">

        <div className="status-box">

          <h2>📌 Current Project Status</h2>

          <p>
            GigNova is currently working as a React-based freelancing
            platform with interactive gig management, authentication,
            search, filtering and browser storage features.
          </p>

          <div className="status-badge">
            ✓ React Project — In Development
          </div>

        </div>

      </section>


      {/* ================= FUTURE PLANS ================= */}
      <section className="future-section">

        <h2>🔮 Future Improvements</h2>

        <div className="future-grid">

          <div className="future-card">

            <div className="future-icon">
              🌐
            </div>

            <h3>Real Backend</h3>

            <p>
              Connect GigNova with a real backend and database
              for storing users and gigs online.
            </p>

          </div>


          <div className="future-card">

            <div className="future-icon">
              💼
            </div>

            <h3>Proposal System</h3>

            <p>
              Allow freelancers to send proposals and clients
              to manage received proposals.
            </p>

          </div>


          <div className="future-card">

            <div className="future-icon">
              💳
            </div>

            <h3>Online Payments</h3>

            <p>
              Add secure online payment functionality for
              completed freelance projects.
            </p>

          </div>


          <div className="future-card">

            <div className="future-icon">
              👤
            </div>

            <h3>Freelancer Profiles</h3>

            <p>
              Create detailed freelancer profiles with skills,
              experience and portfolio information.
            </p>

          </div>


          <div className="future-card">

            <div className="future-icon">
              🔔
            </div>

            <h3>Notifications</h3>

            <p>
              Add notifications for new gigs, proposals and
              project updates.
            </p>

          </div>


          <div className="future-card">

            <div className="future-icon">
              📱
            </div>

            <h3>Mobile Experience</h3>

            <p>
              Further improve the mobile experience and make
              GigNova easier to use on different devices.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}

export default About;
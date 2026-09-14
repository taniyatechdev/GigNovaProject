import React, { useState } from "react";

function Dashboard({
  user,
  gigs,
  proposals = [],
  onDeleteGig,
  onAcceptProposal
}) {
  const [activeTab, setActiveTab] =
    useState("gigs");

  // ================= MY GIGS =================

  const myGigs = gigs.filter(
    (gig) => gig.postedBy === "You"
  );

  // ================= DELETE GIG =================

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this gig?"
    );

    if (confirmDelete) {
      onDeleteGig(id);
    }
  };

  return (
    <div className="dashboard">

      {/* ================= HEADER ================= */}

      <div className="dashboard-header">

        <p className="dashboard-label">
          GIGNOVA DASHBOARD
        </p>

        <h1>
          Welcome, {user?.name || "User"} 👋
        </h1>

        <p>
          Manage your projects and proposals
          from one place.
        </p>

      </div>

      {/* ================= TABS ================= */}

      <div className="dashboard-tabs">

        <button
          className={
            activeTab === "gigs"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("gigs")
          }
        >
          My Gigs
        </button>

        <button
          className={
            activeTab === "proposals"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            setActiveTab("proposals")
          }
        >
          My Proposals
        </button>

      </div>

      {/* ================================================= */}
      {/* MY GIGS */}
      {/* ================================================= */}

      {activeTab === "gigs" && (

        <div className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                My Posted Gigs
              </h2>

              <p>
                Projects you have posted
                on GigNova
              </p>

            </div>

            <span className="gig-count">
              {myGigs.length} Gigs
            </span>

          </div>

          {/* NO GIGS */}

          {myGigs.length === 0 ? (

            <div className="empty-dashboard">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No gigs posted yet
              </h3>

              <p>
                Start by posting your first
                project and connect with
                talented freelancers.
              </p>

            </div>

          ) : (

            <div className="dashboard-gig-grid">

              {myGigs.map((gig) => (

                <div
                  className="dashboard-gig-card"
                  key={gig.id}
                >

                  <div className="gig-top">

                    <span className="gig-category">
                      {gig.category}
                    </span>

                    <span className="gig-status">
                      ● Active
                    </span>

                  </div>

                  <h3>
                    {gig.title}
                  </h3>

                  <p className="dashboard-description">
                    {gig.description ||
                      "No description available."}
                  </p>

                  <div className="gig-info">

                    <div>

                      <span>
                        Budget
                      </span>

                      <strong>
                        {gig.budget}
                      </strong>

                    </div>

                    <div>

                      <span>
                        Experience
                      </span>

                      <strong>
                        {gig.experience ||
                          "Any"}
                      </strong>

                    </div>

                  </div>

                  {/* SKILLS */}

                  {gig.skills && (

                    <div className="skills">

                      {(Array.isArray(gig.skills)
                        ? gig.skills
                        : gig.skills
                            .split(",")
                            .map(
                              (skill) =>
                                skill.trim()
                            )
                      ).map(
                        (skill, index) => (
                          <span key={index}>
                            {skill}
                          </span>
                        )
                      )}

                    </div>

                  )}

                  {/* DEADLINE */}

                  {gig.deadline && (

                    <div className="gig-deadline">
                      📅 Deadline:{" "}
                      {gig.deadline}
                    </div>

                  )}

                  {/* DELETE */}

                  <div className="gig-actions">

                    <button
                      className="delete-gig-btn"
                      onClick={() =>
                        handleDelete(
                          gig.id
                        )
                      }
                    >
                      🗑 Delete Gig
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      )}

      {/* ================================================= */}
      {/* MY PROPOSALS */}
      {/* ================================================= */}

      {activeTab === "proposals" && (

        <div className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                My Proposals
              </h2>

              <p>
                Proposals you have sent
                to clients
              </p>

            </div>

            <span className="gig-count">
              {proposals.length} Proposals
            </span>

          </div>

          {/* NO PROPOSALS */}

          {proposals.length === 0 ? (

            <div className="empty-dashboard">

              <div className="empty-icon">
                💼
              </div>

              <h3>
                No proposals yet
              </h3>

              <p>
                Browse available gigs and
                send your first proposal.
              </p>

            </div>

          ) : (

            <div className="dashboard-gig-grid">

              {proposals.map(
                (proposal) => (

                  <div
                    className="dashboard-gig-card"
                    key={proposal.id}
                  >

                    <div className="gig-top">

                      <span className="gig-category">
                        Proposal
                      </span>

                      <span className="gig-status">
                        ●{" "}
                        {proposal.status ||
                          "Pending"}
                      </span>

                    </div>

                    <h3>
                      {proposal.gigTitle}
                    </h3>

                    <p className="dashboard-description">
                      {proposal.message}
                    </p>

                    <div className="gig-info">

                      <div>

                        <span>
                          Bid Amount
                        </span>

                        <strong>
                          {proposal.bidAmount}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Freelancer
                        </span>

                        <strong>
                          {proposal.freelancerName ||
                            "You"}
                        </strong>

                      </div>

                    </div>

                    {proposal.submittedAt && (

                      <div className="gig-deadline">
                        📅 Submitted:{" "}
                        {new Date(
                          proposal.submittedAt
                        ).toLocaleDateString()}
                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </div>

      )}

    </div>
  );
}

export default Dashboard;
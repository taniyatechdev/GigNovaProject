import React, { useState } from "react";

function Dashboard({ user, gigs, onDeleteGig }) {

  const [activeTab, setActiveTab] = useState("gigs");

  // Show only gigs posted by the user
  const myGigs = gigs.filter(
    (gig) => gig.postedBy === "You"
  );

  // Delete gig
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
          Welcome, {user.name} 👋
        </h1>

        <p>
          Manage your projects and proposals from one place.
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
          onClick={() => setActiveTab("gigs")}
        >
          My Gigs
        </button>


        <button
          className={
            activeTab === "proposals"
              ? "active-tab"
              : ""
          }
          onClick={() => setActiveTab("proposals")}
        >
          My Proposals
        </button>

      </div>


      {/* ================= MY GIGS ================= */}

      {activeTab === "gigs" && (

        <div className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>My Posted Gigs</h2>

              <p>
                Projects you have posted on GigNova
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
                Start by posting your first project
                and connect with talented freelancers.
              </p>

            </div>

          ) : (

            /* ================= GIG CARDS ================= */

            <div className="dashboard-gig-grid">

              {myGigs.map((gig) => (

                <div
                  className="dashboard-gig-card"
                  key={gig.id}
                >

                  {/* TOP */}

                  <div className="gig-top">

                    <span className="gig-category">
                      {gig.category}
                    </span>

                    <span className="gig-status">
                      ● Active
                    </span>

                  </div>


                  {/* TITLE */}

                  <h3>
                    {gig.title}
                  </h3>


                  {/* DESCRIPTION */}

                  <p className="dashboard-description">
                    {gig.description ||
                      "No description available."}
                  </p>


                  {/* INFORMATION */}

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
                        {gig.experience || "Any"}
                      </strong>

                    </div>

                  </div>


                  {/* SKILLS */}

                  {gig.skills && (

                    <div className="skills">

                      {gig.skills
                        .split(",")
                        .map((skill, index) => (

                          <span key={index}>
                            {skill.trim()}
                          </span>

                        ))}

                    </div>

                  )}


                  {/* DEADLINE */}

                  {gig.deadline && (

                    <div className="gig-deadline">

                      📅 Deadline: {gig.deadline}

                    </div>

                  )}


                  {/* DELETE BUTTON */}

                  <div className="gig-actions">

                    <button
                      className="delete-gig-btn"
                      onClick={() =>
                        handleDelete(gig.id)
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


      {/* ================= PROPOSALS ================= */}

      {activeTab === "proposals" && (

        <div className="dashboard-section">

          <div className="section-heading">

            <div>

              <h2>
                My Proposals
              </h2>

              <p>
                Proposals you have sent to clients
              </p>

            </div>

          </div>


          <div className="empty-dashboard">

            <div className="empty-icon">
              💼
            </div>

            <h3>
              No proposals yet
            </h3>

            <p>
              Browse available gigs and send your
              first proposal.
            </p>

          </div>

        </div>

      )}

    </div>
  );
}

export default Dashboard;
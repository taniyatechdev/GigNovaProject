import { useState } from "react";
import "./Gigdetails.css";

function GigDetails({
  gig,
  user,
  onBack,
  onAddProposal,
  onAcceptProposal
}) {
  const [showProposalForm, setShowProposalForm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [bidAmount, setBidAmount] =
    useState("");

  // ================= NO GIG =================

  if (!gig) {
    return (
      <div className="gig-details-page">

        <div className="gig-details-card">

          <h2>
            No gig selected
          </h2>

          <button
            className="back-gigs"
            onClick={onBack}
          >
            ← Back
          </button>

        </div>

      </div>
    );
  }

  // ================= SKILLS =================

  const skills = Array.isArray(gig.skills)
    ? gig.skills
    : (gig.skills || "")
        .split(",")
        .map((skill) => skill.trim())
        .filter(
          (skill) => skill !== ""
        );

  // ================= SUBMIT PROPOSAL =================

  const handleSubmitProposal = (e) => {
    e.preventDefault();

    // User check

    if (!user) {
      alert(
        "Please login before sending a proposal."
      );
      return;
    }

    // Message check

    if (!message.trim()) {
      alert(
        "Please enter your proposal message."
      );
      return;
    }

    // Bid check

    if (!bidAmount.trim()) {
      alert(
        "Please enter your bid amount."
      );
      return;
    }

    // Create proposal

    const newProposal = {
      id: Date.now(),

      gigId: gig.id,

      gigTitle: gig.title,

      freelancerName:
        user.name ||
        user.username ||
        "You",

      freelancerEmail:
        user.email || "",

      message: message.trim(),

      bidAmount: bidAmount.trim(),

      status: "Pending",

      submittedAt:
        new Date().toISOString()
    };

    // Send proposal to App

    if (onAddProposal) {
      onAddProposal(newProposal);
    }

    // Clear form

    setMessage("");
    setBidAmount("");

    // Hide form

    setShowProposalForm(false);

    // Success message

    alert(
      "Proposal sent successfully!"
    );
  };

  return (
    <div className="gig-details-page">

      <div className="gig-details-card">

        {/* ================= TOP ================= */}

        <div className="gig-details-top">

          <span className="gig-badge">
            {gig.category}
          </span>

          <h1>
            {gig.title}
          </h1>

          <p>
            Find the right freelancer for
            this project.
          </p>

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="gig-summary">

          <div>

            <span>
              Category
            </span>

            <strong>
              {gig.category}
            </strong>

          </div>

          <div>

            <span>
              Budget
            </span>

            <strong className="gig-price">
              {gig.budget}
            </strong>

          </div>

          <div>

            <span>
              Posted By
            </span>

            <strong>
              {gig.postedBy}
            </strong>

          </div>

          <div>

            <span>
              Experience
            </span>

            <strong>
              {gig.experience}
            </strong>

          </div>

        </div>

        {/* ================= INFO ================= */}

        <div className="gig-info-row">

          <div className="gig-info">

            📅

            <span>
              Deadline
            </span>

            <strong>
              {gig.deadline}
            </strong>

          </div>

          <div className="gig-info">

            📊

            <span>
              Experience
            </span>

            <strong>
              {gig.experience}
            </strong>

          </div>

        </div>

        {/* ================= DESCRIPTION ================= */}

        <div className="gig-section">

          <h2>
            Project Description
          </h2>

          <p>
            {gig.description}
          </p>

        </div>

        {/* ================= SKILLS ================= */}

        <div className="gig-section">

          <h2>
            Required Skills
          </h2>

          <div className="gig-skills">

            {skills.map(
              (skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              )
            )}

          </div>

        </div>

        {/* ================================================= */}
        {/* PROPOSAL FORM */}
        {/* ================================================= */}

        {showProposalForm && (

          <div className="proposal-form">

            <h2>
              Send Your Proposal
            </h2>

            <p>
              Apply for this project by
              entering your message and
              bid amount.
            </p>

            <form
              onSubmit={
                handleSubmitProposal
              }
            >

              {/* MESSAGE */}

              <div className="proposal-field">

                <label>
                  Proposal Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value
                    )
                  }
                  placeholder="Explain why you are suitable for this project..."
                  rows="6"
                />

              </div>

              {/* BID AMOUNT */}

              <div className="proposal-field">

                <label>
                  Your Bid Amount
                </label>

                <input
                  type="text"
                  value={bidAmount}
                  onChange={(e) =>
                    setBidAmount(
                      e.target.value
                    )
                  }
                  placeholder="Example: ₹8,000"
                />

              </div>

              {/* FORM BUTTONS */}

              <div className="gig-buttons">

                <button
                  type="submit"
                  className="send-proposal"
                >
                  ✓ Submit Proposal
                </button>

                <button
                  type="button"
                  className="back-gigs"
                  onClick={() => {
                    setShowProposalForm(
                      false
                    );
                  }}
                >
                  ✕ Cancel
                </button>

              </div>

            </form>

          </div>

        )}

        {/* ================================================= */}
        {/* MAIN BUTTONS */}
        {/* ================================================= */}

        {!showProposalForm && (

          <div className="gig-buttons">

            <button
              className="send-proposal"
              onClick={() => {

                if (!user) {
                  alert(
                    "Please login before sending a proposal."
                  );
                  return;
                }

                setShowProposalForm(
                  true
                );

              }}
            >
              → Send Proposal
            </button>

            <button
              className="back-gigs"
              onClick={onBack}
            >
              ← Back to Gigs
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default GigDetails;
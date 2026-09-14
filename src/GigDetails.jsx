import "./Gigdetails.css";

function GigDetails({ gig, onBack }) {

  if (!gig) {
    return (
      <div className="gig-details-page">
        <div className="gig-details-card">
          <h2>No gig selected</h2>

          <button className="back-gigs" onClick={onBack}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const skills = Array.isArray(gig.skills)
    ? gig.skills
    : gig.skills.split(",").map((skill) => skill.trim());

  return (
    <div className="gig-details-page">

      <div className="gig-details-card">

        <div className="gig-details-top">

          <span className="gig-badge">
            {gig.category}
          </span>

          <h1>{gig.title}</h1>

          <p>
            Find the right freelancer for this project.
          </p>

        </div>


        <div className="gig-summary">

          <div>
            <span>Category</span>
            <strong>{gig.category}</strong>
          </div>

          <div>
            <span>Budget</span>
            <strong className="gig-price">
              {gig.budget}
            </strong>
          </div>

          <div>
            <span>Posted By</span>
            <strong>{gig.postedBy}</strong>
          </div>

          <div>
            <span>Experience</span>
            <strong>{gig.experience}</strong>
          </div>

        </div>


        <div className="gig-info-row">

          <div className="gig-info">
            📅 <span>Deadline</span>
            <strong>{gig.deadline}</strong>
          </div>

          <div className="gig-info">
            📊 <span>Experience</span>
            <strong>{gig.experience}</strong>
          </div>

        </div>


        <div className="gig-section">

          <h2>Project Description</h2>

          <p>
            {gig.description}
          </p>

        </div>


        <div className="gig-section">

          <h2>Required Skills</h2>

          <div className="gig-skills">

            {skills.map((skill, index) => (
              <span key={index}>
                {skill}
              </span>
            ))}

          </div>

        </div>


        <div className="gig-buttons">

          <button
            className="send-proposal"
            onClick={() =>
              alert("Proposal sent successfully!")
            }
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

      </div>

    </div>
  );
}

export default GigDetails;
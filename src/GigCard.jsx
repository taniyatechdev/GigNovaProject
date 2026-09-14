function GigCard({ gig, onView }) {
  return (
    <div className="gig-card">
      <h2>{gig.title}</h2>

      <p>
        <strong>Category:</strong> {gig.category}
      </p>

      <p>
        <strong>Budget:</strong> {gig.budget}
      </p>

      <p>
        <strong>Posted by:</strong> {gig.postedBy}
      </p>

      <button onClick={() => onView(gig)}>
        View Gig
      </button>
    </div>
  );
}

export default GigCard;
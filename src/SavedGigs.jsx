import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { removeSavedGig } from "./redux/savedGigsSlice";

export default function SavedGigs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const savedGigs = useSelector(
    (state) => state.savedGigs.gigs
  );

  return (
    <main style={{ padding: "40px 6%" }}>
      <h1>My Saved Gigs</h1>
      <p>Manage your bookmarked opportunities.</p>

      {savedGigs.length === 0 ? (
        <div>
          <h3>No saved gigs yet</h3>
          <button onClick={() => navigate("/browse")}>
            Explore Gigs
          </button>
        </div>
      ) : (
        <div className="gig-grid">
          {savedGigs.map((gig) => (
            <article
              key={gig.id}
              className="gig-flashcard"
            >
              <h3>{gig.title}</h3>
              <p>{gig.category || "Freelance"}</p>
              <p>{gig.budget || "Negotiable"}</p>

              <button
                onClick={() =>
                  navigate(
                    `/gigs/${encodeURIComponent(gig.id)}`,
                    { state: { gig } }
                  )
                }
              >
                View Details
              </button>

              <button
                onClick={() =>
                  dispatch(removeSavedGig(gig.id))
                }
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
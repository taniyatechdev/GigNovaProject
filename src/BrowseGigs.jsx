import { useState } from "react";
import GigCard from "./GigCard";
import "./BrowseGigs.css";

function BrowseGigs({ gigs, onView }) {

  const [search, setSearch] = useState("");

  const filteredGigs = gigs.filter((gig) =>
    gig.title.toLowerCase().includes(search.toLowerCase()) ||
    gig.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">

      <h1>Browse Gigs</h1>

      <p>Find the perfect project for your skills.</p>

      <input
        type="text"
        placeholder="Search gigs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="gig-container">

        {filteredGigs.length > 0 ? (

          filteredGigs.map((gig) => (
            <GigCard
              key={gig.id}
              gig={gig}
              onView={onView}
            />
          ))

        ) : (

          <p>No gigs found.</p>

        )}

      </div>

    </div>
  );
}

export default BrowseGigs;
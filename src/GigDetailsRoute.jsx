
import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";

import GigDetails from "./GigDetails";
import { fetchAllGigs } from "./services/gigApi";
import { useGigNova } from "./context/GigNovaContext";

function normalizeGigs(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.gigs)) return result.gigs;
  if (Array.isArray(result?.jobs)) return result.jobs;
  return [];
}

export default function GigDetailsRoute() {
  const { gigId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    gigs = [],
    addProposal,
    acceptProposal,
    rejectProposal,
  } = useGigNova();

  const [apiGig, setApiGig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const localGig = gigs.find(
    (gig) => String(gig.id) === String(gigId)
  );

  const passedGig =
    String(location.state?.gig?.id) ===
    String(gigId)
      ? location.state.gig
      : null;

  useEffect(() => {
    if (localGig || passedGig) return;

    let active = true;

    async function loadGig() {
      setLoading(true);
      setError("");

      try {
        const result = await fetchAllGigs();

        const found = normalizeGigs(result).find(
          (gig) =>
            String(gig.id) === String(gigId)
        );

        if (active) {
          setApiGig(found || null);
        }
      } catch (err) {
        if (active) {
          setError(
            err?.message ||
            "Unable to load gig details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadGig();

    return () => {
      active = false;
    };
  }, [gigId, localGig, passedGig]);

  const gig =
    localGig ||
    passedGig ||
    (String(apiGig?.id) === String(gigId)
      ? apiGig
      : null);

  if (loading && !gig) {
    return (
      <main style={{ padding: 32 }}>
        <h2>Loading Gig Details...</h2>
      </main>
    );
  }

  if (!gig) {
    return (
      <main style={{ padding: 32 }}>
        <h2>Gig not found</h2>
        <p>
          {error ||
            "This gig is currently unavailable."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/browse")}
        >
          Back to Browse Gigs
        </button>
      </main>
    );
  }

  const isExternal =
    gig.source === "api" ||
    (!localGig &&
      Boolean(gig.url) &&
      gig.source !== "local");

  if (isExternal) {
    return (
      <main
        style={{
          maxWidth: 900,
          margin: "40px auto",
          padding: 24,
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #d9e8d8",
        }}
      >
        <button
          type="button"
          onClick={() => navigate("/browse")}
        >
          ← Back to Browse
        </button>

        <h1>{gig.title}</h1>

        <p>
          <strong>Company:</strong>{" "}
          {gig.company || "Not specified"}
        </p>

        <p>
          <strong>Category:</strong>{" "}
          {gig.category || "Freelance"}
        </p>

        <p>
          <strong>Budget:</strong>{" "}
          {gig.budget || "Not specified"}
        </p>

        <p>
          <strong>Location:</strong>{" "}
          {gig.location || "Remote"}
        </p>

        <h3>Job Description</h3>

        <p style={{ whiteSpace: "pre-wrap" }}>
          {String(gig.description || "")
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim() ||
            "No description available."}
        </p>

        {gig.url && (
          <a
            href={gig.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 16,
              padding: "12px 20px",
              background: "#467c56",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            View Original Job ↗
          </a>
        )}
      </main>
    );
  }

  return (
    <GigDetails
      key={gig.id}
      gig={gig}
      user={user}
      onBack={() => navigate("/browse")}
      onAddProposal={addProposal}
      onAcceptProposal={acceptProposal}
      onRejectProposal={rejectProposal}
    />
  );
}

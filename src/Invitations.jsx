
import React, { useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./Invitations.css";

const sameEmail = (a, b) =>
  Boolean(a && b) &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

function Invitations({ setPage }) {
  const {
    user,
    invitations,
    respondToInvitation,
  } = useGigNova();

  const [tab, setTab] = useState("received");
  const [error, setError] = useState("");

  const received = invitations.filter((invitation) =>
    sameEmail(invitation.freelancerEmail, user?.email)
  );

  const sent = invitations.filter((invitation) =>
    sameEmail(invitation.clientEmail, user?.email)
  );

  const visible = tab === "received" ? received : sent;

  const handleResponse = (invitation, status) => {
    setError("");

    const message =
      status === "accepted"
        ? "Accept this project invitation?"
        : "Reject this project invitation?";

    if (!window.confirm(message)) return;

    try {
      respondToInvitation(invitation.id, status);
    } catch (err) {
      setError(err.message || "Unable to update invitation.");
    }
  };

  if (!user) {
    return (
      <main className="invitations-page">
        <div className="invitations-container">
          <h2>Please log in to view invitations.</h2>
          <button
            className="inv-primary-btn"
            onClick={() => setPage("login")}
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="invitations-page">
      <div className="invitations-container">
        <header className="inv-header">
          <span>GIGNOVA DIRECT HIRE</span>
          <h1>My Invitations 💌</h1>
          <p>
            Manage your project invitations and direct
            hiring requests.
          </p>
        </header>

        <div className="inv-tabs">
          <button
            className={tab === "received" ? "active" : ""}
            onClick={() => {
              setTab("received");
              setError("");
            }}
          >
            Received ({received.length})
          </button>

          <button
            className={tab === "sent" ? "active" : ""}
            onClick={() => {
              setTab("sent");
              setError("");
            }}
          >
            Sent ({sent.length})
          </button>
        </div>

        {error && (
          <p className="inv-error" role="alert">
            {error}
          </p>
        )}

        {visible.length === 0 ? (
          <div className="inv-empty">
            <div>📨</div>
            <h3>No invitations yet</h3>
            <p>
              {tab === "received"
                ? "Project invitations from clients will appear here."
                : "Invitations you send to freelancers will appear here."}
            </p>
          </div>
        ) : (
          <div className="inv-grid">
            {visible.map((invitation) => (
              <article
                className="inv-card"
                key={invitation.id}
              >
                <div className="inv-card-top">
                  <span className="inv-category">
                    {tab === "received"
                      ? "Received Invitation"
                      : "Sent Invitation"}
                  </span>

                  <span
                    className={`inv-status ${invitation.status}`}
                  >
                    {invitation.status}
                  </span>
                </div>

                <h3>{invitation.title}</h3>
                <p className="inv-description">
                  {invitation.description}
                </p>

                <div className="inv-details">
                  <p>
                    <strong>Client:</strong>{" "}
                    {invitation.clientName}
                  </p>

                  <p>
                    <strong>Freelancer:</strong>{" "}
                    {invitation.freelancerName}
                  </p>

                  <p>
                    <strong>Budget:</strong> ₹
                    {Number(invitation.budget).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <p>
                    <strong>Deadline:</strong>{" "}
                    {invitation.deadline}
                  </p>
                </div>

                {tab === "received" &&
                  invitation.status === "pending" && (
                    <div className="inv-actions">
                      <button
                        className="inv-primary-btn"
                        onClick={() =>
                          handleResponse(invitation, "accepted")
                        }
                      >
                        ✓ Accept Invitation
                      </button>

                      <button
                        className="inv-reject-btn"
                        onClick={() =>
                          handleResponse(invitation, "rejected")
                        }
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}

                {invitation.status === "accepted" && (
                  <div className="inv-accepted">
                    <p>✓ Invitation accepted! Project created.</p>

                    <button
                      className="inv-primary-btn"
                      onClick={() => setPage("projects")}
                    >
                      View Project →
                    </button>
                  </div>
                )}

                {invitation.status === "rejected" && (
                  <p className="inv-rejected">
                    This invitation was declined.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Invitations;

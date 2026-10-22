
import React, { useEffect, useState } from "react";
import Chat from "./Chat";
import WorkflowOverview from "./WorkflowOverview";
import { useGigNova } from "./context/GigNovaContext";
import "./Dashboard.css";

// ----------------------------------------
// HELPERS
// ----------------------------------------

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

const normalize = (value) =>
  String(value ?? "").trim().toLowerCase();

const formatStatus = (status) => {
  const value = String(status || "pending")
    .replace(/_/g, " ");

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString("en-IN");
};

// ----------------------------------------
// CURRENCY HELPERS
// ----------------------------------------

const getCurrency = (item) => {
  const currency =
    item?.currency ||
    item?.bidCurrency ||
    item?.budgetCurrency;

  if (currency === "USD" || currency === "INR") {
    return currency;
  }

  const budget = String(item?.budget || "");

  if (budget.includes("$")) return "USD";

  return "INR";
};

const formatMoney = (amount, currency = "INR") => {
  if (
    amount === null ||
    amount === undefined ||
    String(amount).trim() === ""
  ) {
    return "Not Specified";
  }

  const number = Number(amount);

  if (!Number.isFinite(number)) {
    return "Not Specified";
  }

  const selectedCurrency =
    currency === "USD" ? "USD" : "INR";

  return new Intl.NumberFormat(
    selectedCurrency === "USD"
      ? "en-US"
      : "en-IN",
    {
      style: "currency",
      currency: selectedCurrency,
      maximumFractionDigits: 2,
    }
  ).format(number);
};

const formatGigBudget = (gig) => {
  const budget = String(gig?.budget ?? "").trim();

  // Preserve already formatted values,
  // including USD, INR and Not Specified.
  if (budget) {
    return budget;
  }

  const amount =
    gig?.budgetAmount ?? gig?.budgetNumeric;

  if (amount === null || amount === undefined) {
    return "Not Specified";
  }

  const formatted = formatMoney(
    amount,
    getCurrency(gig)
  );

  const suffix =
    gig?.paymentType === "hourly"
      ? "/hour"
      : gig?.paymentType === "monthly"
      ? "/month"
      : "";

  return formatted === "Not Specified"
    ? formatted
    : `${formatted}${suffix}`;
};

const formatProposalBid = (proposal) => {
  return formatMoney(
    proposal?.bidAmount,
    getCurrency(proposal)
  );
};

// ----------------------------------------
// DASHBOARD COMPONENT
// ----------------------------------------

export default function Dashboard({
  user,
  gigs = [],
  proposals = [],
  reviews = [],
  projects = [],
  setPage,
  onDeleteGig,
  onAcceptProposal,
  onRejectProposal,
  onOpenProjects,
  onOpenPayments,
}) {
  const {
    notifications = [],
    unreadCount = 0,
    readNotificationIds = [],
    markNotificationRead,
    markAllNotificationsRead,
  } = useGigNova();
  const latestNotifications = notifications.slice(0, 4);
  const unreadNotifications = latestNotifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  );

  const [demoTransactions, setDemoTransactions] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem("gignovaMockApiPayments") || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  });

  useEffect(() => {
    const refresh = () => {
      try {
        const value = JSON.parse(localStorage.getItem("gignovaMockApiPayments") || "[]");
        setDemoTransactions(Array.isArray(value) ? value : []);
      } catch { setDemoTransactions([]); }
    };
    window.addEventListener("focus", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const [activeTab, setActiveTab] = useState("gigs");
  const [actionError, setActionError] = useState("");

  const [selectedGigId, setSelectedGigId] =
    useState(null);

  const [selectedChat, setSelectedChat] =
    useState(null);

  const [
    selectedFreelancer,
    setSelectedFreelancer,
  ] = useState(null);

  const userId =
    user?.id ?? user?.email ?? user?.name;

  // ----------------------------------------
  // FILTER USER DATA
  // ----------------------------------------

  const myGigs = gigs.filter((gig) => {
    if (gig.ownerId != null) {
      return sameId(gig.ownerId, userId);
    }

    return gig.postedBy === "You";
  });

  const myProposals = proposals.filter((proposal) => {
    if (proposal.freelancerEmail && user?.email) {
      return sameId(
        proposal.freelancerEmail,
        user.email
      );
    }

    if (proposal.freelancerId != null) {
      return sameId(
        proposal.freelancerId,
        userId
      );
    }

    return sameId(
      proposal.freelancerName,
      user?.name
    );
  });

  const ownedGigIds = new Set(
    myGigs.map((gig) => String(gig.id))
  );

  const receivedProposals = proposals.filter(
    (proposal) =>
      ownedGigIds.has(String(proposal.gigId))
  );

  const filteredReceivedProposals =
    selectedGigId == null
      ? receivedProposals
      : receivedProposals.filter((proposal) =>
          sameId(
            proposal.gigId,
            selectedGigId
          )
        );

  const getGig = (gigId) =>
    gigs.find((gig) =>
      sameId(gig.id, gigId)
    );

  const getGigTitle = (proposal) =>
    proposal.gigTitle ||
    getGig(proposal.gigId)?.title ||
    "Gig details unavailable";

  const getProposalCount = (gigId) =>
    proposals.filter((proposal) =>
      sameId(proposal.gigId, gigId)
    ).length;

  // ----------------------------------------
  // PERSONALIZED WORKFLOW SUMMARY
  // ----------------------------------------
  const belongsToMe = (project) =>
    sameId(project.clientId, userId) ||
    sameId(project.clientId, user?.email) ||
    sameId(project.clientEmail, user?.email) ||
    sameId(project.freelancerId, userId) ||
    sameId(project.freelancerId, user?.email) ||
    sameId(project.freelancerEmail, user?.email);

  const myProjects = projects.filter(belongsToMe);
  const clientProjects = myProjects.filter((project) =>
    sameId(project.clientId, userId) ||
    sameId(project.clientId, user?.email) ||
    sameId(project.clientEmail, user?.email)
  );
  const freelancerProjects = myProjects.filter((project) =>
    sameId(project.freelancerId, userId) ||
    sameId(project.freelancerId, user?.email) ||
    sameId(project.freelancerEmail, user?.email)
  );

  const successfulPayment = (project) => demoTransactions.some(
    (payment) => sameId(payment.projectId, project.id) &&
      payment.status === "demo_success"
  );

  const pendingTasks = [
    ...receivedProposals.filter((p) => normalize(p.status) === "pending")
      .map((p) => ({ id: `proposal-${p.id}`, label: `Review proposal for ${getGigTitle(p)}`, page: "received" })),
    ...freelancerProjects.filter((p) => p.status === "accepted")
      .map((p) => ({ id: `start-${p.id}`, label: `Start project: ${p.title}`, page: "projects" })),
    ...freelancerProjects.filter((p) => p.status === "in_progress")
      .map((p) => ({ id: `submit-${p.id}`, label: `Submit work: ${p.title}`, page: "projects" })),
    ...clientProjects.filter((p) => p.status === "in_review")
      .map((p) => ({ id: `review-${p.id}`, label: `Review submitted work: ${p.title}`, page: "projects" })),
    ...clientProjects.filter((p) => p.status === "completed" && !successfulPayment(p))
      .map((p) => ({ id: `pay-${p.id}`, label: `Demo payment pending: ${p.title}`, page: "payments" })),
  ];

  const recentActivity = [
    ...myProposals.map((p) => ({
      id: `mine-${p.id}`, label: `Proposal ${formatStatus(p.status)}: ${getGigTitle(p)}`,
      date: p.updatedAt || p.createdAt || p.submittedAt,
    })),
    ...receivedProposals.map((p) => ({
      id: `received-${p.id}`, label: `Received proposal: ${getGigTitle(p)}`,
      date: p.updatedAt || p.createdAt || p.submittedAt,
    })),
    ...myProjects.map((p) => ({
      id: `project-${p.id}`, label: `Project ${formatStatus(p.status)}: ${p.title}`,
      date: p.completedAt || p.submittedAt || p.startedAt || p.createdAt,
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 5);

  const myDemoPayments = demoTransactions.filter((payment) =>
    myProjects.some((project) => sameId(project.id, payment.projectId)) &&
    payment.status === "demo_success"
  );
  const demoTotals = myDemoPayments.reduce((totals, payment) => {
    const currency = payment.currency === "USD" ? "USD" : "INR";
    totals[currency] += Number(payment.amount) || 0;
    return totals;
  }, { INR: 0, USD: 0 });

  const goToDashboardPage = (page) => {
    if (page === "received") { switchTab("received"); return; }
    if (page === "projects") { onOpenProjects?.(); return; }
    if (page === "payments") { onOpenPayments?.(); return; }
    setPage?.(page);
  };

  // ----------------------------------------
  // FREELANCER REVIEWS
  // ----------------------------------------

  const getFreelancerReviews = (email) => {
    if (!email) return [];

    return reviews.filter((review) =>
      sameId(
        review.freelancerEmail,
        email
      )
    );
  };

  const getFreelancerRating = (email) => {
    const validReviews =
      getFreelancerReviews(email).filter(
        (review) => {
          const rating = Number(review.rating);

          return (
            Number.isFinite(rating) &&
            rating >= 1 &&
            rating <= 5
          );
        }
      );

    if (validReviews.length === 0) {
      return {
        average: null,
        total: 0,
      };
    }

    const sum = validReviews.reduce(
      (total, review) =>
        total + Number(review.rating),
      0
    );

    return {
      average: (
        sum / validReviews.length
      ).toFixed(1),
      total: validReviews.length,
    };
  };

  const getFreelancerProfile = (proposal) => {
    const email = normalize(
      proposal.freelancerEmail
    );

    const fallback = {
      name:
        proposal.freelancerName ||
        "Freelancer",
      bio: "",
      skills: "",
      experience: "Not specified",
      location: "",
    };

    if (!email) return fallback;

    try {
      const saved = JSON.parse(
        localStorage.getItem(
          `gignovaProfile:${email}`
        ) || "null"
      );

      if (
        !saved ||
        typeof saved !== "object" ||
        Array.isArray(saved)
      ) {
        return fallback;
      }

      return {
        ...fallback,
        name: saved.name || fallback.name,
        bio: saved.bio || "",
        skills: saved.skills || "",
        experience:
          saved.experience ||
          "Not specified",
        location: saved.location || "",
      };
    } catch {
      return fallback;
    }
  };

  // ----------------------------------------
  // GIG ACTIONS
  // ----------------------------------------

  const handleDelete = async (gigId) => {
    setActionError("");

    const gig = getGig(gigId);

    if (
      !gig ||
      !sameId(gig.ownerId, userId)
    ) {
      setActionError(
        "You cannot delete this gig."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this gig?"
      )
    ) {
      return;
    }

    try {
      await onDeleteGig(gigId);
    } catch (error) {
      setActionError(
        error?.message ||
          "Unable to delete gig."
      );
    }
  };

  // ----------------------------------------
  // ACCEPT PROPOSAL
  // ----------------------------------------

  const handleAccept = async (proposal) => {
    setActionError("");

    const gig = getGig(proposal.gigId);

    if (
      !gig ||
      !sameId(gig.ownerId, userId)
    ) {
      setActionError(
        "Only the gig owner can accept proposals."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to accept this proposal?"
      )
    ) {
      return;
    }

    try {
      await onAcceptProposal(
        proposal.gigId,
        proposal.id
      );
    } catch (error) {
      setActionError(
        error?.message ||
          "Unable to accept proposal."
      );
    }
  };

  // ----------------------------------------
  // REJECT PROPOSAL
  // ----------------------------------------

  const handleReject = async (proposal) => {
    setActionError("");

    const gig = getGig(proposal.gigId);

    if (
      !gig ||
      !sameId(gig.ownerId, userId)
    ) {
      setActionError(
        "Only the gig owner can reject proposals."
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to reject this proposal?"
      )
    ) {
      return;
    }

    try {
      await onRejectProposal(
        proposal.gigId,
        proposal.id
      );
    } catch (error) {
      setActionError(
        error?.message ||
          "Unable to reject proposal."
      );
    }
  };

  // ----------------------------------------
  // CHAT
  // ----------------------------------------

  const canOpenChat = (proposal) => {
    const gig = getGig(proposal.gigId);

    if (
      !gig ||
      normalize(proposal.status) !==
        "accepted"
    ) {
      return false;
    }

    const isClient = sameId(
      gig.ownerId,
      userId
    );

    const isFreelancer =
      sameId(
        proposal.freelancerEmail,
        user?.email
      ) ||
      sameId(
        proposal.freelancerId,
        userId
      );

    return isClient || isFreelancer;
  };

  const openChat = (proposal) => {
    setActionError("");

    if (!canOpenChat(proposal)) {
      setActionError(
        "Chat is available only to the client and accepted freelancer."
      );
      return;
    }

    setSelectedChat({
      gigId: proposal.gigId,
      proposalId: proposal.id,
    });
  };

  const viewGigProposals = (gigId) => {
    setSelectedGigId(gigId);
    setActiveTab("received");
    setActionError("");
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSelectedGigId(null);
    setSelectedFreelancer(null);
    setActionError("");
  };

  // ----------------------------------------
  // GIG CARD
  // ----------------------------------------

  const renderGigCard = (gig) => {
    const isOwner =
      gig.ownerId != null &&
      sameId(gig.ownerId, userId);

    const skills = Array.isArray(gig.skills)
      ? gig.skills
      : String(gig.skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    return (
      <article
        className="dashboard-gig-card"
        key={gig.id}
      >
        <div className="gig-top">
          <span className="gig-category">
            {gig.category || "Freelance"}
          </span>

          <span className="gig-status">
            ● {formatStatus(gig.status || "open")}
          </span>
        </div>

        <h3>{gig.title}</h3>

        <p className="dashboard-description">
          {gig.description ||
            "No description available."}
        </p>

        <div className="gig-info">
          <div>
            <span>Budget</span>
            <strong>
              {formatGigBudget(gig)}
            </strong>
          </div>

          <div>
            <span>Experience</span>
            <strong>
              {gig.experience || "Any"}
            </strong>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="skills">
            {skills.map((skill, index) => (
              <span
                key={`${skill}-${index}`}
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {gig.deadline && (
          <div className="gig-deadline">
            📅 Deadline: {gig.deadline}
          </div>
        )}

        <div className="gig-deadline">
          📩 {getProposalCount(gig.id)}{" "}
          Received Proposals
        </div>

        <div className="gig-actions">
          {isOwner && (
            <button
              type="button"
              className="view-proposals-btn"
              onClick={() =>
                viewGigProposals(gig.id)
              }
            >
              View Proposals
            </button>
          )}

          {isOwner && (
            <button
              type="button"
              className="delete-gig-btn"
              onClick={() =>
                handleDelete(gig.id)
              }
            >
              🗑 Delete Gig
            </button>
          )}
        </div>
      </article>
    );
  };

  // ----------------------------------------
  // PROPOSAL CARD
  // ----------------------------------------

  const renderProposalCard = (
    proposal,
    isReceived = false
  ) => {
    const status = normalize(
      proposal.status || "pending"
    );

    const rating = getFreelancerRating(
      proposal.freelancerEmail
    );

    return (
      <article
        className="dashboard-gig-card"
        key={proposal.id}
      >
        <div className="gig-top">
          <span className="gig-category">
            {isReceived
              ? proposal.freelancerName ||
                "Freelancer"
              : "My Application"}
          </span>

          <span className="gig-status">
            ● {formatStatus(status)}
          </span>
        </div>

        <h3>
          {getGigTitle(proposal)}
        </h3>

        <p className="dashboard-description">
          {proposal.coverLetter ||
            proposal.message ||
            "No cover letter provided."}
        </p>

        <div className="gig-info">
          <div>
            <span>Bid Amount</span>

            {/* INR / USD SUPPORT */}
            <strong>
              {formatProposalBid(proposal)}
            </strong>
          </div>

          <div>
            <span>Delivery Time</span>
            <strong>
              {proposal.deliveryDays != null
                ? `${proposal.deliveryDays} days`
                : "Not specified"}
            </strong>
          </div>
        </div>

        <div className="gig-deadline">
          👤 Freelancer:{" "}
          {proposal.freelancerName ||
            (isReceived
              ? "Unknown"
              : user?.name || "You")}
        </div>

        {isReceived && (
          <>
            <div className="proposal-freelancer-rating">
              {rating.average ? (
                <>
                  <span className="proposal-rating-stars">
                    ⭐ {rating.average} / 5
                  </span>

                  <span className="proposal-rating-count">
                    ({rating.total} reviews)
                  </span>
                </>
              ) : (
                <span className="proposal-no-rating">
                  ☆ New Freelancer · No reviews yet
                </span>
              )}
            </div>

            <div className="gig-actions">
              <button
                type="button"
                className="view-freelancer-btn"
                onClick={() =>
                  setSelectedFreelancer(proposal)
                }
              >
                👤 View Freelancer Profile
              </button>
            </div>
          </>
        )}

        {isReceived &&
          proposal.freelancerEmail && (
            <div className="gig-deadline">
              ✉ {proposal.freelancerEmail}
            </div>
          )}

        {(proposal.createdAt ||
          proposal.submittedAt) && (
          <div className="gig-deadline">
            📅 Submitted:{" "}
            {formatDate(
              proposal.createdAt ||
                proposal.submittedAt
            )}
          </div>
        )}

        {isReceived &&
          status === "pending" && (
            <div className="gig-actions">
              <button
                type="button"
                className="accept-proposal-btn"
                onClick={() =>
                  handleAccept(proposal)
                }
              >
                ✓ Accept
              </button>

              <button
                type="button"
                className="reject-proposal-btn"
                onClick={() =>
                  handleReject(proposal)
                }
              >
                ✕ Reject
              </button>
            </div>
          )}

        {status === "accepted" && (
          <>
            <p className="proposal-success">
              ✓{" "}
              {isReceived
                ? "Proposal Accepted"
                : "Your proposal has been accepted!"}
            </p>

            {canOpenChat(proposal) && (
              <div className="gig-actions">
                <button
                  type="button"
                  className="open-chat-btn"
                  onClick={() =>
                    openChat(proposal)
                  }
                >
                  💬 Open Chat
                </button>
              </div>
            )}
          </>
        )}

        {status === "rejected" && (
          <p className="proposal-rejected">
            ✕{" "}
            {isReceived
              ? "Proposal Rejected"
              : "This proposal was not selected."}
          </p>
        )}
      </article>
    );
  };

  // ----------------------------------------
  // ACCEPTED PROPOSAL CHAT
  // ----------------------------------------

  if (selectedChat) {
    const gig = getGig(
      selectedChat.gigId
    );

    const proposal = proposals.find(
      (item) =>
        sameId(
          item.id,
          selectedChat.proposalId
        ) &&
        sameId(
          item.gigId,
          selectedChat.gigId
        )
    );

    if (
      gig &&
      proposal &&
      canOpenChat(proposal)
    ) {
      return (
        <Chat
          key={`${gig.id}:${proposal.id}:${user?.email}`}
          user={user}
          gig={gig}
          proposal={proposal}
          onBack={() =>
            setSelectedChat(null)
          }
        />
      );
    }
  }

  // ----------------------------------------
  // FREELANCER PROFILE
  // ----------------------------------------

  if (selectedFreelancer) {
    const freelancer =
      getFreelancerProfile(
        selectedFreelancer
      );

    const freelancerReviews =
      getFreelancerReviews(
        selectedFreelancer.freelancerEmail
      );

    const rating =
      getFreelancerRating(
        selectedFreelancer.freelancerEmail
      );

    const skills = Array.isArray(
      freelancer.skills
    )
      ? freelancer.skills
      : String(freelancer.skills || "")
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);

    return (
      <div className="freelancer-profile-page">
        <div className="freelancer-profile-container">
          <button
            type="button"
            className="freelancer-back-btn"
            onClick={() =>
              setSelectedFreelancer(null)
            }
          >
            ← Back to Proposals
          </button>

          <div className="freelancer-profile-header">
            <div className="freelancer-profile-avatar">
              {String(
                freelancer.name || "F"
              )
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h1>
                {freelancer.name}
              </h1>

              <p>
                {selectedFreelancer.freelancerEmail ||
                  "Email not available"}
              </p>

              <div className="freelancer-rating">
                {rating.average ? (
                  <>
                    <span>
                      ⭐ {rating.average} / 5
                    </span>

                    <span>
                      ({rating.total} reviews)
                    </span>
                  </>
                ) : (
                  <span>
                    ☆ No ratings yet
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="freelancer-profile-section">
            <h2>About Freelancer</h2>

            <p>
              {freelancer.bio ||
                "No bio added yet."}
            </p>
          </div>

          <div className="freelancer-profile-section">
            <h2>Skills</h2>

            <div className="freelancer-skills">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p>
                  No skills added yet.
                </p>
              )}
            </div>
          </div>

          <div className="freelancer-profile-section">
            <h2>Experience</h2>
            <p>
              {freelancer.experience}
            </p>
          </div>

          <div className="freelancer-profile-section">
            <h2>Location</h2>
            <p>
              {freelancer.location ||
                "Not specified"}
            </p>
          </div>

          <div className="freelancer-profile-section">
            <h2>
              ⭐ Client Ratings & Reviews
            </h2>

            {freelancerReviews.length === 0 ? (
              <p>
                No client reviews yet.
                Reviews will appear after
                completed projects.
              </p>
            ) : (
              <div className="freelancer-reviews-list">
                {freelancerReviews.map(
                  (review, index) => {
                    const stars = Math.max(
                      0,
                      Math.min(
                        5,
                        Math.round(
                          Number(
                            review.rating
                          ) || 0
                        )
                      )
                    );

                    return (
                      <div
                        className="freelancer-review-card"
                        key={
                          review.id ||
                          index
                        }
                      >
                        <h3>
                          {review.clientName ||
                            "Client"}
                        </h3>

                        <p className="freelancer-review-stars">
                          {"★".repeat(stars)}
                          {"☆".repeat(
                            5 - stars
                          )}
                        </p>

                        <p>
                          {review.comment}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // MAIN DASHBOARD
  // ----------------------------------------

  return (
    <main className="dashboard">
      {/* WELCOME */}
      <div className="dashboard-header">
        <p className="dashboard-label">
          GIGNOVA DASHBOARD
        </p>

        <h1>
          Welcome, {user?.name || "User"} 👋
        </h1>

        <p>
          Manage your projects and
          proposals from one place.
        </p>
      </div>

      {/* PERSONAL NOTIFICATIONS OVERVIEW */}
      <section className="gn-dash-notifications" aria-label="Latest notifications">
        <div className="gn-dash-notifications-head">
          <div>
            <p className="gn-dash-notifications-eyebrow">YOUR UPDATES</p>
            <h2>🔔 Notifications <span className="gn-dash-unread-count">{unreadCount} unread</span></h2>
            <p>Latest proposal, project, invitation and demo payment updates.</p>
          </div>
          <div className="gn-dash-notifications-actions">
            <button type="button" onClick={() => setPage?.("notifications")}>View All →</button>
            {unreadCount > 0 && typeof markAllNotificationsRead === "function" && (
              <button type="button" className="gn-dash-mark-all" onClick={markAllNotificationsRead}>Mark all read</button>
            )}
          </div>
        </div>
        {latestNotifications.length === 0 ? (
          <p className="gn-dash-notifications-empty">No notifications yet. Updates will appear as you use GigNova.</p>
        ) : (
          <div className="gn-dash-notifications-list">
            {latestNotifications.map((item) => {
              const isUnread = !readNotificationIds.includes(item.id);
              return (
                <article key={item.id} className={`gn-dash-notification-item ${isUnread ? "is-unread" : ""}`}>
                  <div className="gn-dash-notification-content">
                    <strong>{isUnread ? "● " : ""}{item.title || "Project update"}</strong>
                    <p>{item.description || "You have a new update."}</p>
                    <small>{item.createdAt && !Number.isNaN(Date.parse(item.createdAt)) ? new Date(item.createdAt).toLocaleString("en-IN") : ""}</small>
                  </div>
                  <div className="gn-dash-notification-controls">
                    {isUnread && typeof markNotificationRead === "function" && (
                      <button type="button" onClick={() => markNotificationRead(item.id)}>Mark read</button>
                    )}
                    <button type="button" onClick={() => {
                      if (isUnread && typeof markNotificationRead === "function") markNotificationRead(item.id);
                      setPage?.(item.link || "notifications");
                    }}>Open →</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {unreadNotifications.length > 0 && <p className="gn-dash-notifications-foot">{unreadNotifications.length} unread among your latest updates</p>}
      </section>

      {/* HORIZONTAL WORKFLOW / PAYMENTS */}
      <div className="dashboard-workflow-row">
        <WorkflowOverview
          onProjects={onOpenProjects}
          onPayments={onOpenPayments}
        />
      </div>

      {/* QUICK ACTIONS + ACTIVITY + PENDING TASKS */}
      <section className="gn-dash-extras" aria-label="Dashboard quick overview">
        <div className="gn-dash-extra-card gn-dash-quick">
          <h2>⚡ Quick Actions</h2>
          <div className="gn-dash-quick-grid">
            <button type="button" onClick={() => goToDashboardPage("browse")}>🔎 Browse Gigs</button>
            <button type="button" onClick={() => goToDashboardPage("post")}>✚ Post a Gig</button>
            <button type="button" onClick={() => goToDashboardPage("projects")}>📁 My Projects</button>
            <button type="button" onClick={() => goToDashboardPage("earnings")}>💸 My Earnings</button>
          </div>
        </div>

        <div className="gn-dash-extra-card">
          <h2>📌 Pending Tasks <span>({pendingTasks.length})</span></h2>
          {pendingTasks.length ? (
            <ul className="gn-dash-extra-list">
              {pendingTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <span>{task.label}</span>
                  <button type="button" onClick={() => goToDashboardPage(task.page)}>Open →</button>
                </li>
              ))}
            </ul>
          ) : <p className="gn-dash-muted">No pending tasks right now.</p>}
        </div>

        <div className="gn-dash-extra-card">
          <h2>🕒 Recent Activity</h2>
          {recentActivity.length ? (
            <ul className="gn-dash-extra-list">
              {recentActivity.map((item) => (
                <li key={item.id}>
                  <span>{item.label}</span>
                  <small>{formatDate(item.date) || "Recent"}</small>
                </li>
              ))}
            </ul>
          ) : <p className="gn-dash-muted">Your latest projects and proposals will appear here.</p>}
        </div>

        <div className="gn-dash-extra-card">
          <h2>💳 Demo Payment Overview</h2>
          <p className="gn-dash-muted">{myDemoPayments.length} successful demo transactions · No real money transferred</p>
          <div className="gn-dash-currency-totals">
            <div><small>INR</small><strong>{formatMoney(demoTotals.INR, "INR")}</strong></div>
            <div><small>USD</small><strong>{formatMoney(demoTotals.USD, "USD")}</strong></div>
          </div>
          <p className="gn-dash-muted">{clientProjects.filter((p) => p.status === "completed" && !successfulPayment(p)).length} completed client projects awaiting demo payment</p>
          <button type="button" className="gn-dash-pay-link" onClick={() => goToDashboardPage("payments")}>View Payments →</button>
        </div>
      </section>

      {/* DASHBOARD TABS */}
      <div className="dashboard-tabs">
        <button
          type="button"
          className={
            activeTab === "gigs"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            switchTab("gigs")
          }
        >
          My Gigs ({myGigs.length})
        </button>

        <button
          type="button"
          className={
            activeTab === "proposals"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            switchTab("proposals")
          }
        >
          My Proposals (
          {myProposals.length})
        </button>

        <button
          type="button"
          className={
            activeTab === "received"
              ? "active-tab"
              : ""
          }
          onClick={() =>
            switchTab("received")
          }
        >
          Received Proposals (
          {receivedProposals.length})
        </button>
      </div>

      {actionError && (
        <p
          className="dashboard-error"
          role="alert"
        >
          {actionError}
        </p>
      )}

      {/* MY GIGS */}
      {activeTab === "gigs" && (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                My Posted Gigs
              </h2>

              <p>
                Projects you have posted
                on GigNova.
              </p>
            </div>

            <span className="gig-count">
              {myGigs.length} Gigs
            </span>
          </div>

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
                freelancers.
              </p>
            </div>
          ) : (
            <div className="dashboard-gig-grid">
              {myGigs.map(
                renderGigCard
              )}
            </div>
          )}
        </section>
      )}

      {/* MY PROPOSALS */}
      {activeTab === "proposals" && (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                My Proposals
              </h2>

              <p>
                Proposals you have submitted
                to clients.
              </p>
            </div>

            <span className="gig-count">
              {myProposals.length} Proposals
            </span>
          </div>

          {myProposals.length === 0 ? (
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
              {myProposals.map(
                (proposal) =>
                  renderProposalCard(
                    proposal
                  )
              )}
            </div>
          )}
        </section>
      )}

      {/* RECEIVED PROPOSALS */}
      {activeTab === "received" && (
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <h2>
                {selectedGigId != null
                  ? "Proposals for Selected Gig"
                  : "Received Proposals"}
              </h2>

              <p>
                Review applications
                submitted to your projects.
              </p>
            </div>

            <span className="gig-count">
              {filteredReceivedProposals.length}{" "}
              Proposals
            </span>
          </div>

          {selectedGigId != null && (
            <button
              type="button"
              className="view-proposals-btn"
              onClick={() =>
                setSelectedGigId(null)
              }
            >
              ← View All Received Proposals
            </button>
          )}

          {filteredReceivedProposals.length ===
          0 ? (
            <div className="empty-dashboard">
              <div className="empty-icon">
                📩
              </div>

              <h3>
                No proposals received yet
              </h3>

              <p>
                When freelancers apply
                to your projects,
                their proposals will
                appear here.
              </p>
            </div>
          ) : (
            <div className="dashboard-gig-grid">
              {filteredReceivedProposals.map(
                (proposal) =>
                  renderProposalCard(
                    proposal,
                    true
                  )
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

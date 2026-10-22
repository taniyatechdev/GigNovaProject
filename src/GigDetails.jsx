
import React, { useEffect, useState } from "react";
import { validateProposal } from "./utils/validateProposal";
import "./Gigdetails.css";

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

const getGigCurrency = (gig) => {
  const currency = gig?.currency || gig?.budgetCurrency;

  if (currency === "INR" || currency === "USD") {
    return currency;
  }

  if (String(gig?.budget || "").includes("$")) {
    return "USD";
  }

  return "INR";
};

const formatMoney = (amount, currency) =>
  new Intl.NumberFormat(
    currency === "USD" ? "en-US" : "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(Number(amount));

function GigDetails({
  gig,
  user,
  onBack,
  onAddProposal,
  onAcceptProposal,
  onRejectProposal,
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [currency, setCurrency] = useState(
    () => getGigCurrency(gig)
  );

  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCurrency(getGigCurrency(gig));
    setCoverLetter("");
    setBidAmount("");
    setDeliveryDays("");
    setFieldErrors({});
    setError("");
    setSuccess("");
  }, [gig?.id]);

  const userId = user?.id ?? user?.email ?? user?.name;

  const isOwner = Boolean(
    user && gig?.ownerId != null &&
    sameId(gig.ownerId, userId)
  );

  const paymentType = gig?.paymentType || "fixed";

  const isOpen =
    String(gig?.status || "open").toLowerCase() === "open";

  const updateField = (name, value) => {
    if (name === "currency") setCurrency(value);
    if (name === "bidAmount") setBidAmount(value);
    if (name === "deliveryDays") setDeliveryDays(value);
    if (name === "coverLetter") setCoverLetter(value);

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    if (!user) {
      setError(
        "Please log in before submitting a proposal."
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

    if (isOwner) {
      setError(
        "You cannot submit a proposal to your own gig."
      );
      return;
    }

    if (!isOpen) {
      setError(
        "This gig is no longer accepting proposals."
    // Message check

    if (!message.trim()) {
      alert(
        "Please enter your proposal message."
      );
      return;
    }

    if (typeof onAddProposal !== "function") {
      setError(
        "Proposal submission is not connected."
    // Bid check

    if (!bidAmount.trim()) {
      alert(
        "Please enter your bid amount."
      );
      return;
    }

    const form = {
      currency,
      bidAmount,
      deliveryDays,
      coverLetter,
    };

    const errors = validateProposal(form);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(
        "Please correct the highlighted fields."
      );
      return;
    }

    try {
      setSubmitting(true);

      await onAddProposal({
        id: Date.now(),
        gigId: gig.id,
        coverLetter: coverLetter.trim(),
        bidAmount: Number(bidAmount),
        currency,
        bidCurrency: currency,
        paymentType,
        deliveryDays: Number(deliveryDays),
      });

      setSuccess(
        "Your proposal has been submitted successfully!"
      );

      setCoverLetter("");
      setBidAmount("");
      setDeliveryDays("");
      setFieldErrors({});
    } catch (err) {
      setError(
        err?.message ||
          "Could not submit your proposal."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const amountPreview =
    bidAmount.trim() !== "" &&
    Number.isFinite(Number(bidAmount)) &&
    Number(bidAmount) > 0
      ? formatMoney(bidAmount, currency)
      : "Not entered";

  const fieldErrorStyle = {
    display: "block",
    color: "#b42318",
    marginTop: "6px",
    fontSize: "13px",
    fontWeight: 600,
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
      <button
        type="button"
        className="secondary-button"
        onClick={onBack}
      >
        ← Back to Browse Gigs
      </button>

      {/* GIG DETAILS */}
      <section className="gig-details-card">
        <p className="post-label">
          {gig.category}
        </p>
      <div className="gig-details-card">

        {/* ================= TOP ================= */}

        <div className="gig-details-top">

        <h1>{gig.title}</h1>

        <p>{gig.description}</p>
          <h1>
            {gig.title}
          </h1>

        <div className="gig-details-meta">
          <p>
            <strong>Budget:</strong>{" "}
            {gig.budget || "Not Specified"}
          </p>

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
            <strong>Payment:</strong>{" "}
            {paymentType}
          </p>

          {gig.durationMonths && (
            <p>
              <strong>Duration:</strong>{" "}
              {gig.durationMonths} months
            </p>
          )}

          <p>
            <strong>Experience:</strong>{" "}
            {gig.experience || "Not specified"}
          </p>
        </div>

        {/* ================= SKILLS ================= */}

        <div className="gig-section">

          <h2>
            Required Skills
          </h2>

          <p>
            <strong>Deadline:</strong>{" "}
            {gig.deadline || "Not specified"}
          </p>

          <p>
            <strong>Skills:</strong>{" "}
            {Array.isArray(gig.skills)
              ? gig.skills.join(", ")
              : gig.skills || "Not specified"}
          </p>
            {skills.map(
              (skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              )
            )}

          <p>
            <strong>Posted by:</strong>{" "}
            {gig.postedBy || "Client"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {gig.status || "open"}
          </p>
        </div>
      </section>

      {/* OWNER MESSAGE */}
      {isOwner ? (
        <section className="gig-details-card">
          <h2>This is your gig</h2>
          <p>
            Manage proposals from your dashboard.
          </p>
        </section>
      ) : !isOpen ? (
        <section className="gig-details-card">
          <h2>Project is no longer open</h2>
          <p>
            This gig is not accepting new proposals.
          </p>
        </section>
      ) : !user ? (
        <section className="gig-details-card">
          <h2>Interested in this project?</h2>
          <p>
            Log in to submit your proposal.
          </p>
        </section>
      ) : (
        <section className="gig-details-card">
          <h2>Submit Your Proposal</h2>

          <p>
            Explain why you are suitable for
            this project.
          </p>
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

          <form onSubmit={handleSubmit} noValidate>
            {/* CURRENCY */}
            <div className="form-group">
              <label htmlFor="proposal-currency">
                Bid Currency *
              </label>

              <select
                id="proposal-currency"
                value={currency}
                onChange={(e) =>
                  updateField(
                    "currency",
                    e.target.value
                  )
                }
                aria-invalid={Boolean(
                  fieldErrors.currency
                )}
              >
                <option value="INR">
                  INR (₹) — Indian Rupees
                </option>

                <option value="USD">
                  USD ($) — US Dollars
                </option>
              </select>

              <small>
                {gig.currency === "USD" ||
                gig.budgetCurrency === "USD"
                  ? "Client selected USD for this project."
                  : gig.currency === "INR" ||
                    gig.budgetCurrency === "INR"
                  ? "Client selected INR for this project."
                  : "Choose the currency for your proposal."}
              </small>

              {fieldErrors.currency && (
                <small
                  role="alert"
                  style={fieldErrorStyle}
                >
                  {fieldErrors.currency}
                </small>
              )}
            </div>

            {/* BID AMOUNT */}
            <div className="form-group">
              <label htmlFor="proposal-amount">
                Your proposed amount (
                {currency === "USD" ? "$" : "₹"}) *
              </label>

              <input
                id="proposal-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={bidAmount}
                onChange={(e) =>
                  updateField(
                    "bidAmount",
                    e.target.value
                  )
                }
                aria-invalid={Boolean(
                  fieldErrors.bidAmount
                )}
                placeholder={
                  currency === "USD"
                    ? "e.g. 100"
                    : "e.g. 5000"
                }
              />

              <small>
                For hourly or monthly gigs,
                enter your rate for that period.
              </small>

              {fieldErrors.bidAmount && (
                <small
                  role="alert"
                  style={fieldErrorStyle}
                >
                  {fieldErrors.bidAmount}
                </small>
              )}
            </div>

            {/* DELIVERY TIME */}
            <div className="form-group">
              <label htmlFor="proposal-days">
                Estimated delivery time (days) *
              </label>

              <input
                id="proposal-days"
                type="number"
                min="1"
                max="3650"
                step="1"
                value={deliveryDays}
                onChange={(e) =>
                  updateField(
                    "deliveryDays",
                    e.target.value
                  )
                }
                aria-invalid={Boolean(
                  fieldErrors.deliveryDays
                )}
                placeholder="e.g. 7"
              />

              {fieldErrors.deliveryDays && (
                <small
                  role="alert"
                  style={fieldErrorStyle}
                >
                  {fieldErrors.deliveryDays}
                </small>
              )}
            </div>

            {/* COVER LETTER */}
            <div className="form-group">
              <label htmlFor="proposal-letter">
                Cover Letter *
              </label>

              <textarea
                id="proposal-letter"
                value={coverLetter}
                onChange={(e) =>
                  updateField(
                    "coverLetter",
                    e.target.value
                  )
                }
                minLength={20}
                maxLength={3000}
                rows={6}
                aria-invalid={Boolean(
                  fieldErrors.coverLetter
                )}
                placeholder="Describe your relevant skills and how you would approach the project..."
              />

              <small>
                {coverLetter.length}/3000
                characters (minimum 20)
              </small>

              {fieldErrors.coverLetter && (
                <small
                  role="alert"
                  style={fieldErrorStyle}
                >
                  {fieldErrors.coverLetter}
                </small>
              )}
            </div>

            {/* BID PREVIEW */}
            <div
              style={{
                padding: "16px",
                marginBottom: "20px",
                borderRadius: "12px",
                background: "#f1f7ed",
                border: "1px solid #dce9d2",
              }}
            >
              <strong>
                Proposal Summary
              </strong>

              <p style={{ marginTop: "10px" }}>
                <strong>Your Bid:</strong>{" "}
                {amountPreview}
              </p>

              <p>
                <strong>Payment Type:</strong>{" "}
                {paymentType}
              </p>

              <p>
                <strong>Delivery:</strong>{" "}
                {deliveryDays
                  ? `${deliveryDays} days`
                  : "Not entered"}
              </p>
            </div>

            {/* FORM MESSAGES */}
            {error && (
              <p
                className="post-error"
                role="alert"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="post-success"
                role="status"
              >
                {success}
              </p>
            )}

            <button
              className="post-submit"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Proposal →"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

export default GigDetails;


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
      );
      return;
    }

    if (typeof onAddProposal !== "function") {
      setError(
        "Proposal submission is not connected."
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

        <h1>{gig.title}</h1>

        <p>{gig.description}</p>

        <div className="gig-details-meta">
          <p>
            <strong>Budget:</strong>{" "}
            {gig.budget || "Not Specified"}
          </p>

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


import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { useGigNova } from "./context/GigNovaContext";

import "./Projects.css";
import "./Workflow.css";

// =============================
// HELPERS
// =============================

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

const MAX_FILE_SIZE = 300000;

const DEMO_PAYMENT_KEY = "gignovaMockApiPayments";

const getDeadlineInfo = (project) => {
  if (!project?.deadline) return { label: "No deadline", state: "none" };
  const date = new Date(project.deadline);
  if (Number.isNaN(date.getTime())) return { label: "Deadline unavailable", state: "none" };
  const due = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((due - today) / 86400000);
  if (project.status === "completed") return { label: "Completed", state: "done" };
  if (days < 0) return { label: `${Math.abs(days)} day(s) overdue`, state: "overdue" };
  if (days === 0) return { label: "Due today", state: "soon" };
  if (days <= 3) return { label: `${days} day(s) remaining`, state: "soon" };
  return { label: `${days} day(s) remaining`, state: "normal" };
};

const isActive = (project) => ["accepted", "in_progress", "in_review"].includes(project.status);

const steps = [
  { key: "accepted", label: "Accepted" },
  { key: "in_progress", label: "In Progress" },
  { key: "in_review", label: "In Review" },
  { key: "completed", label: "Completed" },
];

const getCurrency = (item) => {
  const currency = item?.currency || item?.bidCurrency || item?.budgetCurrency;
  if (currency === "USD" || currency === "INR") return currency;
  return String(item?.budget ?? "").includes("$") ? "USD" : "INR";
};

const formatMoney = (value, currency = "INR") => {
  if (value == null || String(value).trim() === "" ||
      String(value).trim().toLowerCase() === "not specified") {
    return "Not Specified";
  }
  const amount = typeof value === "number"
    ? value
    : Number(String(value).replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(amount)) return String(value);
  const selected = currency === "USD" ? "USD" : "INR";
  return new Intl.NumberFormat(selected === "USD" ? "en-US" : "en-IN", {
    style: "currency",
    currency: selected,
    maximumFractionDigits: 2,
  }).format(amount);
};

const receiptMoney = (value, currency = "INR") =>
  formatMoney(value, currency);

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-IN");
};

const formatDateTime = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not set"
    : date.toLocaleString("en-IN");
};

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(
        new Error("Unable to read selected file.")
      );
    };

    reader.readAsDataURL(file);
  });

const readDemoPayments = () => {
  try {
    const data = JSON.parse(
      localStorage.getItem(DEMO_PAYMENT_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

// =============================
// PROJECTS COMPONENT
// =============================

function Projects({
  user,
  projects = [],
  onUpdateStatus,
  onOpenChat,
}) {
  const {
    submissions = [],
    getPaymentQuote,
    submitWork,
  } = useGigNova();

  const fileInputRef = useRef(null);
  const selectedProjectRef = useRef(null);

  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const [demoPayments, setDemoPayments] = useState(
    readDemoPayments
  );

  // =============================
  // REFRESH PAYMENT HISTORY
  // =============================

  useEffect(() => {
    const refreshPayments = () => {
      setDemoPayments(readDemoPayments());
    };

    refreshPayments();

    window.addEventListener(
      "focus",
      refreshPayments
    );

    window.addEventListener(
      "storage",
      refreshPayments
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshPayments
      );

      window.removeEventListener(
        "storage",
        refreshPayments
      );
    };
  }, []);

  // =============================
  // USER ROLES
  // =============================

  const userId =
    user?.id ?? user?.email ?? user?.name;

  const isClient = (project) =>
    sameId(project.clientId, userId) ||
    sameId(project.clientId, user?.email) ||
    (
      project.clientEmail != null &&
      sameId(project.clientEmail, user?.email)
    );

  const isFreelancer = (project) =>
    sameId(project.freelancerId, userId) ||
    sameId(project.freelancerId, user?.email) ||
    (
      project.freelancerEmail != null &&
      sameId(project.freelancerEmail, user?.email)
    );

  const myProjects = projects.filter(
    (project) =>
      isClient(project) ||
      isFreelancer(project)
  );

  const visibleProjects = myProjects.filter((project) => {
    if (filter === "all") return true;
    if (filter === "active") return isActive(project);
    if (filter === "overdue") return getDeadlineInfo(project).state === "overdue";
    return project.status === filter;
  });

  const activeCount = myProjects.filter(isActive).length;
  const overdueCount = myProjects.filter(
    (project) => getDeadlineInfo(project).state === "overdue"
  ).length;
  const pendingReviewCount = myProjects.filter(
    (project) => project.status === "in_review"
  ).length;

  // =============================
  // START PROJECT
  // =============================

  const handleStartProject = (project) => {
    setError("");

    if (!isFreelancer(project)) {
      setError(
        "Only the freelancer can start this project."
      );
      return;
    }

    if (
      !window.confirm(
        "Start working on this project?"
      )
    ) {
      return;
    }

    try {
      if (typeof onUpdateStatus !== "function") {
        throw new Error(
          "Project status update is unavailable."
        );
      }

      onUpdateStatus(
        project.id,
        "in_progress"
      );
    } catch (err) {
      setError(
        err.message || "Could not start project."
      );
    }
  };

  // =============================
  // SUBMIT WORK
  // =============================

  const handleSubmitClick = (project) => {
    setError("");

    if (!isFreelancer(project)) {
      setError(
        "Only the freelancer can submit work."
      );
      return;
    }

    if (project.status !== "in_progress") {
      setError(
        "Project must be in progress before submission."
      );
      return;
    }

    selectedProjectRef.current = project;

    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];
    const project = selectedProjectRef.current;

    event.target.value = "";

    if (!file || !project) {
      return;
    }

    setError("");

    if (file.size === 0) {
      setError("The selected file is empty.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Please select a file smaller than 300 KB."
      );
      return;
    }

    let hours = null;

    if (project.paymentType === "hourly") {
      const entered = window.prompt(
        "Enter the number of hours worked:"
      );

      if (entered === null) return;

      hours = Number(entered);

      if (
        !Number.isFinite(hours) ||
        hours <= 0 ||
        hours > 744
      ) {
        setError(
          "Please enter valid hours between 1 and 744."
        );
        return;
      }
    }

    setUploading(true);

    try {
      const fileData = await readFile(file);

      if (typeof submitWork !== "function") {
        throw new Error(
          "submitWork is missing from GigNovaContext."
        );
      }

      await submitWork({
        projectId: project.id,
        message:
          `I have submitted ${file.name} ` +
          "for your review. Please check " +
          "the attached work and share feedback.",
        fileName: file.name,
        fileData,
        hours,
      });

      if (typeof onOpenChat === "function") {
        onOpenChat(project);
      }
    } catch (err) {
      setError(
        err.message || "Unable to submit work."
      );
    } finally {
      setUploading(false);
      selectedProjectRef.current = null;
    }
  };

  // =============================
  // SUBMISSION LOOKUP
  // =============================

  const getLatestSubmission = (projectId) =>
    submissions
      .filter((submission) =>
        sameId(submission.projectId, projectId)
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      )[0] || null;

  // =============================
  // DEMO PAYMENT LOOKUP
  // =============================

  const getDemoPayment = (projectId) =>
    demoPayments.find(
      (item) =>
        sameId(item.projectId, projectId) &&
        item.status === "demo_success"
    );

  const getQuote = (projectId) => {
    if (typeof getPaymentQuote !== "function") {
      return null;
    }

    return getPaymentQuote(projectId);
  };

  // =============================
  // PROJECT PROGRESS
  // =============================

  const getProgress = (status) => {
    const index = steps.findIndex(
      (step) => step.key === status
    );

    return index < 0
      ? 0
      : ((index + 1) / steps.length) * 100;
  };

  // =============================
  // DOWNLOAD DEMO RECEIPT
  // =============================

  const downloadDemoReceipt = (
    project,
    transaction
  ) => {
    if (!transaction) {
      setError(
        "Demo payment record not found."
      );
      return;
    }

    const win = window.open(
      "",
      "_blank",
      "width=850,height=700"
    );

    if (!win) {
      setError(
        "Please allow popups to print the receipt."
      );
      return;
    }

    const doc = win.document;

    doc.title =
      "GigNova Demo Payment Receipt";

    const style = doc.createElement("style");

    style.textContent = `
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #263b2e;
      }

      h1 {
        color: #398b58;
        margin-bottom: 5px;
      }

      .subtitle {
        color: #748477;
        margin-bottom: 30px;
      }

      .row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        padding: 14px 0;
        border-bottom: 1px solid #e4eae5;
      }

      .row strong {
        overflow-wrap: anywhere;
        text-align: right;
      }

      .total {
        color: #328451;
        font-size: 22px;
      }

      .notice {
        margin-top: 25px;
        padding: 16px;
        background: #fff3dc;
        border-radius: 10px;
        font-size: 13px;
        line-height: 1.6;
      }
    `;

    doc.head.appendChild(style);

    const heading = doc.createElement("h1");
    heading.textContent = "GigNova";
    doc.body.appendChild(heading);

    const subtitle = doc.createElement("h2");
    subtitle.className = "subtitle";
    subtitle.textContent =
      "Demo Payment Receipt";
    doc.body.appendChild(subtitle);

    const addRow = (
      label,
      value,
      className = ""
    ) => {
      const row = doc.createElement("div");
      row.className = `row ${className}`;

      const left = doc.createElement("span");
      left.textContent = label;

      const right = doc.createElement("strong");
      right.textContent = String(
        value ?? "—"
      );

      row.append(left, right);
      doc.body.appendChild(row);
    };

    addRow("Project", project.title);
    addRow("Project ID", project.id);

    addRow(
      "Client",
      project.clientName || "Client"
    );

    addRow(
      "Freelancer",
      project.freelancerName ||
        "Freelancer"
    );

    addRow(
      "Transaction ID",
      transaction.transactionId
    );

    addRow(
      "API Reference",
      transaction.apiReferenceId
    );

    addRow(
      "Payment Method",
      transaction.method?.toUpperCase()
    );

    addRow(
      "Payment Date",
      formatDateTime(transaction.createdAt)
    );

    addRow(
      "Project Amount",
      receiptMoney(transaction.base, getCurrency(transaction.currency ? transaction : project))
    );

    addRow(
      "Late Fee",
      receiptMoney(transaction.lateFee, getCurrency(transaction.currency ? transaction : project))
    );

    addRow(
      "Total",
      receiptMoney(transaction.amount, getCurrency(transaction.currency ? transaction : project)),
      "total"
    );

    addRow(
      "Status",
      "DEMO PAYMENT SUCCESSFUL"
    );

    const notice = doc.createElement("div");
    notice.className = "notice";

    notice.textContent =
      "Educational demonstration only. " +
      "No real money was transferred. " +
      "This is not a verified bank or " +
      "payment gateway receipt.";

    doc.body.appendChild(notice);

    win.focus();
    win.print();
  };

  // =============================
  // UI
  // =============================

  return (
    <main className="projects-page">
      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.zip,.doc,.docx,.png,.jpg,.jpeg,.txt,.ppt,.pptx"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

      {/* HEADER */}
      <div className="projects-header">
        <p className="projects-eyebrow">
          GIGNOVA WORKSPACE
        </p>

        <h1>My Projects</h1>

        <p>
          Manage your work, submit files
          for review, chat with clients,
          and track demo payments.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="projects-summary">
        <div className="projects-stat">
          <strong>
            {myProjects.length}
          </strong>
          <span>Total Projects</span>
        </div>

        <div className="projects-stat">
          <strong>
            {
              myProjects.filter(
                (p) =>
                  p.status === "in_progress"
              ).length
            }
          </strong>
          <span>In Progress</span>
        </div>

        <div className="projects-stat">
          <strong>
            {
              myProjects.filter(
                (p) =>
                  p.status === "in_review"
              ).length
            }
          </strong>
          <span>In Review</span>
        </div>

        <div className="projects-stat">
          <strong>
            {
              myProjects.filter(
                (p) =>
                  p.status === "completed"
              ).length
            }
          </strong>
          <span>Completed</span>
        </div>
      </div>

      {/* ACTIONABLE SUMMARY */}
      <div className="gn-project-insights" aria-label="Project tracking overview">
        <div className="gn-project-insight"><strong>{activeCount}</strong><span>Active Projects</span></div>
        <div className="gn-project-insight"><strong>{pendingReviewCount}</strong><span>Pending Review</span></div>
        <div className="gn-project-insight"><strong>{overdueCount}</strong><span>Overdue Projects</span></div>
      </div>

      {/* FILTERS */}
      <div className="projects-filters" aria-label="Filter projects">
        <button
          type="button"
          className={
            filter === "all"
              ? "selected"
              : ""
          }
          onClick={() => setFilter("all")}
        >
          All
        </button>

        {[
          { key: "active", label: "Active" },
          { key: "overdue", label: "Overdue" },
          ...steps,
        ].map((step) => (
          <button
            type="button"
            key={step.key}
            className={
              filter === step.key
                ? "selected"
                : ""
            }
            onClick={() =>
              setFilter(step.key)
            }
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* ERROR */}
      {error && (
        <p
          className="projects-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {/* EMPTY STATE */}
      {visibleProjects.length === 0 ? (
        <div className="projects-empty">
          <div className="projects-empty-icon">
            📁
          </div>

          <h3>No projects found</h3>

          <p>
            Accepted proposals and direct
            hires will appear here.
          </p>
        </div>
      ) : (
        <div className="projects-grid">
          {visibleProjects.map((project) => {
            const client =
              isClient(project);

            const freelancer =
              isFreelancer(project);

            const submission =
              getLatestSubmission(project.id);

            const demoPayment =
              getDemoPayment(project.id);

            const quote =
              getQuote(project.id);

            const progress =
              getProgress(project.status);

            const deadlineInfo = getDeadlineInfo(project);
            const nextAction = project.status === "accepted"
              ? freelancer ? "Ready to begin? Start this project." : "Waiting for the freelancer to start."
              : project.status === "in_progress"
              ? freelancer ? "Submit your completed work for client review." : "Work is in progress with the freelancer."
              : project.status === "in_review"
              ? client ? "Review the submission and approve it in Project Chat." : "Waiting for the client to review your submission."
              : project.status === "completed"
              ? demoPayment ? "Work completed and demo payment recorded." : "Work completed. Demo payment is pending."
              : "Check the project status for updates.";

            return (
              <div
                className="project-card"
                key={project.id}
              >
                {/* CARD HEADER */}
                <div className="project-card-top">
                  <span className="project-role">
                    {client
                      ? "Client"
                      : "Freelancer"}
                  </span>

                  <span className="project-status">
                    {String(
                      project.status || ""
                    )
                      .replace(/_/g, " ")
                      .toUpperCase()}
                  </span>
                </div>

                <h3>{project.title}</h3>

                {/* PROJECT DETAILS */}
                <div className="project-meta">
                  <p>
                    <strong>Client:</strong>{" "}
                    {project.clientName ||
                      "Client"}
                  </p>

                  <p>
                    <strong>Freelancer:</strong>{" "}
                    {project.freelancerName ||
                      "Freelancer"}
                  </p>

                  <p>
                    <strong>Budget:</strong>{" "}
                    {formatMoney(
                      project.budget, getCurrency(project)
                    )}
                    {project.paymentType ===
                    "hourly"
                      ? "/hour"
                      : project.paymentType ===
                        "monthly"
                      ? "/month"
                      : ""}
                  </p>

                  <p>
                    <strong>Deadline:</strong>{" "}
                    {formatDate(
                      project.deadline
                    )}
                  </p>

                  <p>
                    <strong>Created:</strong>{" "}
                    {formatDate(
                      project.createdAt
                    )}
                  </p>
                </div>

                {/* DEADLINE TRACKING & NEXT ACTION */}
                <div className="gn-project-tracking">
                  <span className={`gn-deadline-tag gn-deadline-${deadlineInfo.state}`}>
                    📅 {deadlineInfo.label}
                  </span>
                  <p className="gn-project-next-action"><strong>Next step:</strong> {nextAction}</p>
                </div>

                {/* PROGRESS */}
                <div className="project-progress">
                  <div className="project-progress-label">
                    <span>
                      Project Progress
                    </span>

                    <strong>
                      {progress}%
                    </strong>
                  </div>

                  <div className="project-progress-track">
                    <div
                      className="project-progress-fill"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="project-steps">
                    {steps.map(
                      (step, index) => {
                        const currentIndex =
                          steps.findIndex(
                            (s) =>
                              s.key ===
                              project.status
                          );

                        return (
                          <span
                            key={step.key}
                            className={
                              index <=
                              currentIndex
                                ? "done"
                                : ""
                            }
                          >
                            {step.label}
                          </span>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* REVIEW NOTICE */}
                {project.status ===
                  "in_review" && (
                  <p className="project-notice">
                    {client
                      ? "📩 Freelancer submitted work. Open chat to review the file."
                      : "⏳ Work submitted. Waiting for client approval."}
                  </p>
                )}

                {/* SUBMITTED FILE */}
                {submission && (
                  <div className="gn-work-meta">
                    <p>
                      <strong>
                        Latest Submission:
                      </strong>{" "}
                      {submission.status}
                    </p>

                    {submission.fileName && (
                      <p>
                        📎{" "}
                        {submission.fileName}
                      </p>
                    )}
                  </div>
                )}

                {/* COMPLETED */}
                {project.status ===
                  "completed" && (
                  <p className="project-completed">
                    ✓ Work approved by client
                  </p>
                )}

                {/* DEMO PAYMENT */}
                {project.status ===
                  "completed" && (
                  <div className="gn-work-meta">
                    {demoPayment ? (
                      <>
                        <p className="gn-demo-paid-label">
                          ✓ Demo Payment Done
                        </p>

                        <p>
                          <strong>
                            Amount:
                          </strong>{" "}
                          {receiptMoney(
                            demoPayment.amount, getCurrency(demoPayment.currency ? demoPayment : project)
                          )}
                        </p>

                        <p>
                          <strong>
                            Method:
                          </strong>{" "}
                          {demoPayment.method?.toUpperCase()}
                        </p>

                        <p>
                          <strong>
                            Transaction ID:
                          </strong>{" "}
                          {demoPayment.transactionId}
                        </p>

                        <p>
                          <strong>
                            Payment Date:
                          </strong>{" "}
                          {formatDateTime(
                            demoPayment.createdAt
                          )}
                        </p>

                        <button
                          type="button"
                          className="gn-demo-receipt-btn"
                          onClick={() =>
                            downloadDemoReceipt(
                              project,
                              demoPayment
                            )
                          }
                        >
                          🧾 Download Demo Receipt
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="gn-demo-pending-label">
                          ⏳ Demo Payment Pending
                        </p>

                        {quote && (
                          <>
                            <p>
                              <strong>
                                Amount Due:
                              </strong>{" "}
                              {formatMoney(
                                quote.total, getCurrency(project)
                              )}
                            </p>

                            <p>
                              <strong>
                                Payment Deadline:
                              </strong>{" "}
                              {formatDate(
                                quote.dueAt
                              )}
                            </p>

                            {quote.daysLate > 0 && (
                              <p>
                                ⚠ Payment delayed
                                by{" "}
                                {quote.daysLate}{" "}
                                days. Demo late
                                fee:{" "}
                                {formatMoney(
                                  quote.lateFee, getCurrency(project)
                                )}
                              </p>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="project-actions">
                  {freelancer &&
                    project.status ===
                      "accepted" && (
                      <button
                        type="button"
                        className="project-primary-btn"
                        onClick={() =>
                          handleStartProject(
                            project
                          )
                        }
                      >
                        ▶ Start Project
                      </button>
                    )}

                  {freelancer &&
                    project.status ===
                      "in_progress" && (
                      <button
                        type="button"
                        className="project-primary-btn"
                        disabled={uploading}
                        onClick={() =>
                          handleSubmitClick(
                            project
                          )
                        }
                      >
                        {uploading
                          ? "Submitting..."
                          : "📤 Submit for Review"}
                      </button>
                    )}

                  {onOpenChat && (
                    <button
                      type="button"
                      className="project-chat-btn"
                      onClick={() =>
                        onOpenChat(project)
                      }
                    >
                      {client &&
                      project.status ===
                        "in_review"
                        ? "✓ Review in Chat"
                        : "💬 Open Chat"}
                    </button>
                  )}
                </div>

                {/* DATES */}
                <div className="project-dates">
                  {project.startedAt && (
                    <span>
                      Started:{" "}
                      {formatDate(
                        project.startedAt
                      )}
                    </span>
                  )}

                  {project.submittedAt && (
                    <span>
                      Submitted:{" "}
                      {formatDate(
                        project.submittedAt
                      )}
                    </span>
                  )}

                  {project.completedAt && (
                    <span>
                      Completed:{" "}
                      {formatDate(
                        project.completedAt
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Projects;


import React, { useEffect, useRef, useState } from "react";
import { useGigNova } from "./context/GigNovaContext";
import "./Chat.css";

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "ar", name: "Arabic" },
];
const MAX_TRANSLATION_LENGTH = 450;
const MAX_FILE_SIZE = 300 * 1024;
const readStoredMessages = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const readableStatus = (value) =>
  String(value || "pending").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const readFile = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error("Unable to read selected file."));

    reader.readAsDataURL(file);
  });

function Chat({
  user,
  gig,
  proposal,
  projectId,
  onBack,
}) {
  const {
    projects = [],
    submissions = [],
    submitWork,
    approveWork,
    requestChanges,
  } = useGigNova();

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const userId = user?.id ?? user?.email ?? user?.name;

  // Find the project using the exact project ID.
  // Fallback supports older accepted-proposal chats.
  const project = projects.find((p) => {
    if (projectId != null) {
      return sameId(p.id, projectId);
    }

    return (
      proposal?.id != null &&
      sameId(p.proposalId, proposal.id)
    );
  });

  const actualProjectId = project?.id ?? projectId;

  const isClient = project
    ? sameId(project.clientId, userId)
    : gig?.ownerId != null &&
      sameId(gig.ownerId, userId);

  const isFreelancer = project
    ? (
        sameId(project.freelancerId, userId) ||
        sameId(project.freelancerEmail, user?.email)
      )
    : (
        sameId(proposal?.freelancerEmail, user?.email) ||
        sameId(proposal?.freelancerId, userId)
      );

  const canChat =
    Boolean(user) &&
    (isClient || isFreelancer) &&
    (
      Boolean(project) ||
      proposal?.status === "accepted"
    );

  // Keep the same storage key for both users.
  const storageKey = project
    ? `gignovaProjectChat:${project.id}`
    : `gignovaChat:${gig?.id}:${proposal?.id}`;

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [hours, setHours] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [sendMode, setSendMode] = useState("message");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState(
    () => localStorage.getItem("gignova_chat_language") || "hi"
  );
  const [autoTranslate, setAutoTranslate] = useState(
    () => localStorage.getItem("gignova_chat_auto_translate") === "true"
  );
  const [translations, setTranslations] = useState({});
  const [translationLoading, setTranslationLoading] = useState({});
  const [translationErrors, setTranslationErrors] = useState({});
  const [showOriginal, setShowOriginal] = useState({});
  const translationInFlight = useRef(new Set());

  const translationKey = (item) =>
    `${storageKey}:${item.id}:${sourceLanguage}:${targetLanguage}`;

  const translateMessage = async (item) => {
    if (!item.text?.trim()) return;
    const key = translationKey(item);
    if (Object.prototype.hasOwnProperty.call(translations, key)) {
      setShowOriginal((old) => ({ ...old, [key]: false }));
      return;
    }
    if (translationInFlight.current.has(key)) return;
    if (sourceLanguage === targetLanguage) {
      setTranslationErrors((old) => ({ ...old, [key]: "Choose different source and target languages." }));
      return;
    }
    if (item.text.length > MAX_TRANSLATION_LENGTH) {
      setTranslationErrors((old) => ({ ...old, [key]: "Free demo translation supports up to 450 characters per message." }));
      return;
    }
    translationInFlight.current.add(key);
    setTranslationLoading((old) => ({ ...old, [key]: true }));
    setTranslationErrors((old) => ({ ...old, [key]: "" }));
    try {
      const params = new URLSearchParams({
        q: item.text,
        langpair: `${sourceLanguage}|${targetLanguage}`,
      });
      const response = await fetch(`https://api.mymemory.translated.net/get?${params}`);
      if (!response.ok) throw new Error("Translation service unavailable. Please retry later.");
      const data = await response.json();
      if (Number(data.responseStatus) !== 200 || typeof data.responseData?.translatedText !== "string") {
        throw new Error(data.responseDetails || "Translation failed. Try another language pair.");
      }
      setTranslations((old) => ({ ...old, [key]: data.responseData.translatedText }));
      setShowOriginal((old) => ({ ...old, [key]: false }));
    } catch (err) {
      setTranslationErrors((old) => ({ ...old, [key]: err.message || "Translation failed." }));
    } finally {
      translationInFlight.current.delete(key);
      setTranslationLoading((old) => ({ ...old, [key]: false }));
    }
  };

  useEffect(() => {
    if (!autoTranslate || !canChat) return;
    messages.forEach((item) => {
      if (!item.text?.trim()) return; // Auto-translate both sent and received messages
      const key = translationKey(item);
      if (Object.prototype.hasOwnProperty.call(translations, key) || translationErrors[key] || translationInFlight.current.has(key)) return;
      translateMessage(item);
    });
  }, [autoTranslate, messages, sourceLanguage, targetLanguage, canChat, translations, translationErrors, storageKey]);

  const loadMessages = () => setMessages(readStoredMessages(storageKey));

  useEffect(() => {
    loadMessages();

    const handleStorage = (event) => {
      if (event.key === storageKey) {
        loadMessages();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, [storageKey]);

  const projectSubmissions = submissions
    .filter((item) =>
      sameId(item.projectId, actualProjectId)
    )
    .sort(
      (a, b) =>
        new Date(a.submittedAt || a.createdAt || 0) -
        new Date(b.submittedAt || b.createdAt || 0)
    );

  const latestSubmission =
    projectSubmissions[projectSubmissions.length - 1];

  const paymentType =
    project?.paymentType ||
    gig?.paymentType ||
    "fixed";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, projectSubmissions.length]);

  const saveMessage = (newMessage) => {
    const updated = [...readStoredMessages(storageKey), newMessage];
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setMessages(updated);
    } catch {
      throw new Error("Chat storage is full. Try a smaller attachment or remove older browser data.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size === 0) {
      setError("The selected file is empty.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(
        "For this browser demo, select a file under 300 KB."
      );
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleSend = async (event) => {
    event.preventDefault();
    setError("");

    if (!canChat) {
      setError("You cannot access this conversation.");
      return;
    }

    const text = message.trim();

    if (!text && !selectedFile) {
      return;
    }

    setBusy(true);

    try {
      let attachment = null;

      if (selectedFile) {
        const fileData = await readFile(selectedFile);

        attachment = {
          fileName: selectedFile.name,
          fileType: selectedFile.type,
          fileData,
        };
      }

      saveMessage({
        id: createId(),
        senderId: String(userId),
        senderName: user?.name || "User",
        text,
        attachment,
        createdAt: new Date().toISOString(),
      });

      setMessage("");
      setSelectedFile(null);
      setSendMode("message");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err.message || "Unable to send message."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSubmitWork = async () => {
    setError("");

    if (!project || !isFreelancer) {
      setError("Only the project freelancer can submit work.");
      return;
    }

    if (
      project.status !== "in_progress" &&
      project.status !== "changes_requested"
    ) {
      setError("This project is not ready for submission.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file first.");
      fileInputRef.current?.click();
      return;
    }

    if (typeof submitWork !== "function") {
      setError("submitWork is missing from GigNovaContext.");
      return;
    }

    setBusy(true);

    try {
      const fileData = await readFile(selectedFile);

      const workMessage =
        message.trim() ||
        `I have submitted ${selectedFile.name} for review.`;

      const submittedHours = Number(hours);

      if (
        paymentType === "hourly" &&
        (!Number.isFinite(submittedHours) ||
          submittedHours <= 0)
      ) {
        throw new Error(
          "Please enter valid worked hours."
        );
      }

      // The Context stores the submission and
      // updates the project's review status.
      await submitWork({
        projectId: project.id,
        message: workMessage,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData,
        hours:
          paymentType === "hourly"
            ? submittedHours
            : undefined,
      });

      setSelectedFile(null);
      setMessage("");
      setHours("");
      setSendMode("message");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err.message || "Unable to submit work."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async () => {
    setError("");

    if (!isClient || !latestSubmission) {
      return;
    }

    if (typeof approveWork !== "function") {
      setError("approveWork is missing from GigNovaContext.");
      return;
    }

    if (
      !window.confirm(
        "Approve this submission and mark the work as completed?"
      )
    ) {
      return;
    }

    setReviewBusy(true);
    try {
      await approveWork(latestSubmission.id);
      setFeedback("");
    } catch (err) {
      setError(
        err.message || "Unable to approve work."
      );
    } finally {
      setReviewBusy(false);
    }
  };

  const handleRequestChanges = async () => {
    setError("");

    if (!isClient || !latestSubmission) {
      return;
    }

    if (!feedback.trim()) {
      setError(
        "Please write what the freelancer should change."
      );
      return;
    }

    if (typeof requestChanges !== "function") {
      setError(
        "requestChanges is missing from GigNovaContext."
      );
      return;
    }

    setReviewBusy(true);
    try {
      await requestChanges(
        latestSubmission.id,
        feedback.trim()
      );

      saveMessage({
        id: createId(),
        senderId: String(userId),
        senderName: user?.name || "Client",
        text: `Changes requested: ${feedback.trim()}`,
        createdAt: new Date().toISOString(),
      });

      setFeedback("");
    } catch (err) {
      setError(
        err.message || "Unable to request changes."
      );
    } finally {
      setReviewBusy(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("en-IN");
  };

  if (!canChat) {
    return (
      <div className="chat-page">
        <button type="button" onClick={onBack}>
          ← Back
        </button>
        <p>Chat is not available for this account.</p>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* HEADER */}
        <div className="chat-header">
          <button
            type="button"
            className="chat-back"
            onClick={onBack}
          >
            ← Back
          </button>

          <div>
            <h2>
              {project?.title ||
                gig?.title ||
                "Project Chat"}
            </h2>

            <p>
              {isClient
                ? `Freelancer: ${
                    project?.freelancerName ||
                    proposal?.freelancerName ||
                    "Freelancer"
                  }`
                : `Client: ${
                    project?.clientName ||
                    gig?.postedBy ||
                    "Client"
                  }`}
            </p>

            {project && (
              <small>
                Project Status:{" "}
                {String(project.status)
                  .replace(/_/g, " ")
                  .toUpperCase()}
              </small>
            )}
          </div>
        </div>

        {/* Translation is optional; messages go to a third-party service only when enabled or requested. */}
        <div className="gn-translate-toolbar">
          <div className="gn-translate-heading"><strong>🌐 Message Translation</strong><small>Demo translation powered by MyMemory. Text is sent to a third-party service.</small></div>
          <div className="gn-translate-controls">
            <label>From <select value={sourceLanguage} onChange={(e) => setSourceLanguage(e.target.value)}>
              {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select></label>
            <label>To <select value={targetLanguage} onChange={(e) => {
              setTargetLanguage(e.target.value);
              localStorage.setItem("gignova_chat_language", e.target.value);
            }}>
              {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
            </select></label>
            <label className="gn-auto-translate"><input type="checkbox" checked={autoTranslate} onChange={(e) => { setAutoTranslate(e.target.checked); localStorage.setItem("gignova_chat_auto_translate", String(e.target.checked)); }} /> Auto translate all messages</label>
          </div>
        </div>

        {/* PROJECT REVIEW OVERVIEW */}
        {project && (
          <div className="gn-chat-review-overview">
            <div><strong>Project:</strong> {readableStatus(project.status)}</div>
            <div><strong>Submissions:</strong> {projectSubmissions.length}</div>
            <div><strong>Latest review:</strong> {latestSubmission ? readableStatus(latestSubmission.status) : "No work submitted"}</div>
            {project.status === "changes_requested" && isFreelancer && (
              <p>Changes were requested. Review the client's feedback below and submit an updated file.</p>
            )}
            {project.status === "in_review" && isClient && (
              <p>A submission is ready for your review. Download the file before approving or requesting changes.</p>
            )}
          </div>
        )}

        {/* MESSAGES */}
        <div className="chat-messages">
          {messages.length === 0 &&
            projectSubmissions.length === 0 && (
              <div className="chat-empty">
                No messages yet. Start the conversation!
              </div>
            )}

          {messages.map((item) => {
            const mine = sameId(
              item.senderId,
              userId
            );

            const key = translationKey(item);
            const hasTranslation = Object.prototype.hasOwnProperty.call(translations, key);
            const isTranslated = hasTranslation && !showOriginal[key];
            return (
              <div
                key={item.id}
                className={`chat-bubble ${
                  mine ? "mine" : "theirs"
                }`}
              >
                <strong>
                  {mine
                    ? "You"
                    : item.senderName || "User"}
                </strong>

                {item.text && (
                  <div className="gn-message-translation">
                    <p>{isTranslated ? translations[key] : item.text}</p>
                    {isTranslated && <small className="gn-translated-label">Translated · {targetLanguage.toUpperCase()}</small>}
                    <button type="button" className="gn-translate-button"
                      disabled={Boolean(translationLoading[key])}
                      onClick={() => hasTranslation
                        ? setShowOriginal((old) => ({ ...old, [key]: !old[key] }))
                        : translateMessage(item)}>
                      {translationLoading[key] ? "Translating..." : isTranslated ? "Show Original" : hasTranslation ? "Show Translation" : "🌐 Translate"}
                    </button>
                    {translationErrors[key] && <small className="gn-translation-error" role="alert">{translationErrors[key]}</small>}
                  </div>
                )}

                {item.attachment && (
                  <div className="gn-chat-attachment">
                    <p>
                      📎 {item.attachment.fileName}
                    </p>

                    {item.attachment.fileData && (
                      <a
                        href={item.attachment.fileData}
                        download={
                          item.attachment.fileName
                        }
                      >
                        ⬇ Download File
                      </a>
                    )}
                  </div>
                )}

                <small>
                  {formatDate(item.createdAt)}
                </small>
              </div>
            );
          })}

          {/* WORK SUBMISSIONS */}
          {projectSubmissions.map((submission) => {
            const isLatest =
              submission.id === latestSubmission?.id;

            const status =
              submission.status || "pending";

            return (
              <div
                key={submission.id}
                className="gn-work-submission"
                style={{
                  background: "#f3f8ef",
                  border: "1px solid #d8e7d0",
                  borderRadius: 14,
                  padding: 16,
                  margin: "12px 0",
                }}
              >
                <h3>📤 Work Submitted for Review</h3>

                <p>
                  <strong>Freelancer:</strong>{" "}
                  {project?.freelancerName ||
                    "Freelancer"}
                </p>

                {submission.message && (
                  <p>{submission.message}</p>
                )}

                <p>
                  <strong>File:</strong>{" "}
                  {submission.fileName ||
                    "No file attached"}
                </p>

                {submission.fileData && (
                  <a
                    href={submission.fileData}
                    download={
                      submission.fileName ||
                      "submission"
                    }
                  >
                    📥 Download Submitted File
                  </a>
                )}

                {submission.hours != null &&
                  paymentType === "hourly" && (
                    <p>
                      <strong>Worked Hours:</strong>{" "}
                      {submission.hours}
                    </p>
                  )}

                <p>
                  <strong>Status:</strong>{" "}
                  {status.replace(/_/g, " ")}
                </p>

                <small>
                  Submitted:{" "}
                  {formatDate(
                    submission.submittedAt ||
                    submission.createdAt
                  )}
                </small>

                {submission.feedback && (
                  <p>
                    <strong>Client Feedback:</strong>{" "}
                    {submission.feedback}
                  </p>
                )}

                {/* CLIENT REVIEW ACTIONS */}
                {isClient &&
                  isLatest &&
                  (
                    status === "pending" ||
                    status === "in_review"
                  ) && (
                    <div
                      style={{
                        marginTop: 16,
                        display: "grid",
                        gap: 10,
                      }}
                    >
                      <textarea
                        placeholder="Write feedback if changes are needed..."
                        value={feedback}
                        onChange={(e) =>
                          setFeedback(e.target.value)
                        }
                        rows={3}
                        style={{
                          width: "100%",
                          padding: 12,
                          borderRadius: 8,
                          border:
                            "1px solid #d8e7d0",
                        }}
                      />

                      <button
                        type="button"
                        onClick={handleApprove}
                        style={{
                          padding: 12,
                          background: "#28583e",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        ✓ Approve Work
                      </button>

                      <button
                        type="button"
                        onClick={handleRequestChanges}
                        style={{
                          padding: 12,
                          background: "#fff",
                          color: "#28583e",
                          border:
                            "1px solid #28583e",
                          borderRadius: 8,
                          cursor: "pointer",
                        }}
                      >
                        ↻ Request Changes
                      </button>
                    </div>
                  )}

                {status === "approved" && (
                  <p style={{ color: "#267044" }}>
                    ✓ Work Approved — Payment can
                    now be processed.
                  </p>
                )}
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* ERRORS */}
        {error && (
          <p className="chat-error" role="alert">
            {error}
          </p>
        )}

        {/* FILE PREVIEW */}
        {selectedFile && (
          <div
            style={{
              padding: 12,
              background: "#eef6e9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>📎 {selectedFile.name}</span>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);

                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* INPUT AREA */}
        {project && isFreelancer && ["in_progress", "changes_requested"].includes(project.status) && (
          <div className="gn-chat-send-mode" role="group" aria-label="Attachment purpose">
            <button type="button" className={sendMode === "message" ? "selected" : ""} onClick={() => setSendMode("message")}>💬 Chat attachment</button>
            <button type="button" className={sendMode === "work" ? "selected" : ""} onClick={() => setSendMode("work")}>📤 Work submission</button>
          </div>
        )}
        <form
          className="chat-input-area"
          onSubmit={sendMode === "work" ? (event) => { event.preventDefault(); handleSubmitWork(); } : handleSend}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.zip,.doc,.docx,.png,.jpg,.jpeg,.txt"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={busy}
            title="Attach file"
          >
            📎
          </button>

          <input
            type="text"
            placeholder={sendMode === "work" ? "Add a note for the work submission..." : "Type your message..."}
            value={message}
            maxLength={2000}
            onChange={(e) =>
              setMessage(e.target.value)
            }
          />

          <button
            type="submit"
            disabled={
              busy ||
              (sendMode === "work" ? !selectedFile : (!message.trim() && !selectedFile))
            }
          >
            {busy ? "Working..." : sendMode === "work" ? "Submit Work" : "Send"}
          </button>
        </form>

        {/* FREELANCER WORK SUBMISSION */}
        {project &&
          isFreelancer &&
          (
            project.status === "in_progress" ||
            project.status === "changes_requested"
          ) && (
            <div
              style={{
                padding: 16,
                borderTop:
                  "1px solid #e1e9dc",
                background: "#fafcf8",
              }}
            >
              <h3>Submit Work for Client Review</h3>

              <p style={{ fontSize: 13 }}>
                Select “Work submission” above, attach your file, and add a note. Your submission is stored separately from chat messages.
              </p>

              {paymentType === "hourly" && (
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Hours worked"
                  value={hours}
                  onChange={(e) =>
                    setHours(e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: 10,
                    marginBottom: 10,
                  }}
                />
              )}

              <button
                type="button"
                disabled={busy || !selectedFile}
                onClick={handleSubmitWork}
                style={{
                  background: "#28583e",
                  color: "white",
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                📤 Submit for Review
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default Chat;

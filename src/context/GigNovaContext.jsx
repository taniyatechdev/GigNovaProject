
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const GigNovaContext = createContext(null);

const readStorage = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null
      ? fallback
      : JSON.parse(value);
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return fallback;
  }
};

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

const cleanEmail = (value) =>
  String(value ?? "").trim().toLowerCase();

const todayLocal = () => {
  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
};

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const amountOf = (value) => {
  const n =
    typeof value === "number"
      ? value
      : Number(
          String(value ?? "").replace(
            /[^\d.-]/g,
            ""
          )
        );

  return Number.isFinite(n) && n > 0 ? n : 0;
};

const isClientFor = (project, user) =>
  !!user &&
  (
    sameId(project.clientId, user.id) ||
    sameId(project.clientId, user.email) ||
    (
      project.clientEmail &&
      sameId(project.clientEmail, user.email)
    )
  );

const isFreelancerFor = (project, user) =>
  !!user &&
  (
    sameId(project.freelancerId, user.id) ||
    sameId(project.freelancerId, user.email) ||
    sameId(
      project.freelancerEmail,
      user.email
    )
  );

const defaultGigs = [
  {
    id: 1,
    title: "Build a React Website",
    category: "Web Development",
    description:
      "Need a responsive React website for a small business.",
    budget: "₹10,000",
    budgetAmount: 10000,
    paymentType: "fixed",
    skills: "React, JavaScript, CSS",
    experience: "Intermediate",
    deadline: "2026-10-15",
    postedBy: "Rahul",
    status: "open",
  },
  {
    id: 2,
    title: "Design a Logo",
    category: "Graphic Design",
    description:
      "Looking for a creative logo for a new brand.",
    budget: "₹3,000",
    budgetAmount: 3000,
    paymentType: "fixed",
    skills: "Figma, Photoshop, Illustrator",
    experience: "Beginner",
    deadline: "2026-10-10",
    postedBy: "Priya",
    status: "open",
  },
  {
    id: 3,
    title: "Write a Blog",
    category: "Content Writing",
    description:
      "Write an informative blog article about technology.",
    budget: "₹2,000",
    budgetAmount: 2000,
    paymentType: "fixed",
    skills: "Writing, SEO, Research",
    experience: "Intermediate",
    deadline: "2026-10-20",
    postedBy: "Aman",
    status: "open",
  },
];

export function GigNovaProvider({ children }) {
  const [user, setUser] = useState(() =>
    readStorage("gignovaLoggedIn", null)
  );

  const [gigs, setGigs] = useState(() =>
    readStorage("gignovaGigs", defaultGigs)
  );

  const [proposals, setProposals] = useState(() =>
    readStorage("gignovaProposals", [])
  );

  const [projects, setProjects] = useState(() =>
    readStorage("gignovaProjects", [])
  );

  const [reviews, setReviews] = useState(() =>
    readStorage("gignovaReviews", [])
  );

  const [invitations, setInvitations] = useState(
    () => readStorage("gignovaInvitations", [])
  );

  const [payments, setPayments] = useState(() =>
    readStorage("gignovaDemoPayments", [])
  );

  const [submissions, setSubmissions] = useState(
    () => readStorage("gignovaSubmissions", [])
  );

  const [storageError, setStorageError] =
    useState("");

  // Save data to localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(
        "gignovaLoggedIn",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "gignovaGigs",
        JSON.stringify(gigs)
      );

      localStorage.setItem(
        "gignovaProposals",
        JSON.stringify(proposals)
      );

      localStorage.setItem(
        "gignovaProjects",
        JSON.stringify(projects)
      );

      localStorage.setItem(
        "gignovaReviews",
        JSON.stringify(reviews)
      );

      localStorage.setItem(
        "gignovaInvitations",
        JSON.stringify(invitations)
      );

      localStorage.setItem(
        "gignovaDemoPayments",
        JSON.stringify(payments)
      );

      localStorage.setItem(
        "gignovaSubmissions",
        JSON.stringify(submissions)
      );

      setStorageError("");
    } catch (error) {
      console.error(
        "Could not save GigNova data:",
        error
      );

      setStorageError(
        "Your browser could not save changes. Check available storage."
      );
    }
  }, [
    user,
    gigs,
    proposals,
    projects,
    reviews,
    invitations,
    payments,
    submissions,
  ]);

  // AUTH
  const loginUser = useCallback(
    (nextUser) => setUser(nextUser),
    []
  );

  const logoutUser = useCallback(
    () => setUser(null),
    []
  );

  // GIGS
  const addGig = useCallback(
    (newGig) => {
      if (!user) {
        throw new Error(
          "Please log in before posting a gig."
        );
      }

      const gig = {
        ...newGig,
        id: newGig.id ?? createId("gig"),
        ownerId:
          user.id ?? user.email ?? user.name,
        postedBy:
          user.name ??
          user.email ??
          "GigNova user",
        status: "open",
        paymentType:
          newGig.paymentType ?? "fixed",
      };

      setGigs((current) => [gig, ...current]);

      return gig;
    },
    [user]
  );

  const deleteGig = useCallback(
    (gigId) => {
      const gig = gigs.find((x) =>
        sameId(x.id, gigId)
      );

      const ownerId =
        user?.id ?? user?.email ?? user?.name;

      if (
        !gig ||
        !user ||
        !sameId(gig.ownerId, ownerId)
      ) {
        throw new Error(
          "You can only delete your own gigs."
        );
      }

      if (
        proposals.some(
          (p) =>
            sameId(p.gigId, gigId) &&
            p.status === "accepted"
        ) ||
        projects.some((p) =>
          sameId(p.gigId, gigId)
        )
      ) {
        throw new Error(
          "A gig with an accepted proposal or project cannot be deleted."
        );
      }

      setGigs((current) =>
        current.filter(
          (x) => !sameId(x.id, gigId)
        )
      );
    },
    [gigs, proposals, projects, user]
  );

  // PROPOSALS
  const addProposal = useCallback(
    (newProposal) => {
      if (!user) {
        throw new Error(
          "Please log in to submit a proposal."
        );
      }

      const gig = gigs.find((x) =>
        sameId(x.id, newProposal.gigId)
      );

      if (!gig || gig.status !== "open") {
        throw new Error(
          "This gig is no longer accepting proposals."
        );
      }

      const userId =
        user.id ?? user.email ?? user.name;

      if (
        gig.ownerId != null &&
        sameId(gig.ownerId, userId)
      ) {
        throw new Error(
          "You cannot submit a proposal to your own gig."
        );
      }

      if (
        proposals.some(
          (p) =>
            sameId(
              p.gigId,
              newProposal.gigId
            ) &&
            (
              sameId(
                p.freelancerId,
                userId
              ) ||
              sameId(
                p.freelancerEmail,
                user.email
              )
            )
        )
      ) {
        throw new Error(
          "You have already proposed for this gig."
        );
      }

      const bidAmount = Number(newProposal.bidAmount);
      const deliveryDays = Number(newProposal.deliveryDays);
      const coverLetter = String(newProposal.coverLetter ?? "").trim();
      const proposedCurrency = newProposal.currency || newProposal.bidCurrency;
      const currency = proposedCurrency || (
        gig.currency === "USD" || gig.budgetCurrency === "USD" ||
        String(gig.budget || "").includes("$") ? "USD" : "INR"
      );

      if (!["INR", "USD"].includes(currency)) {
        throw new Error("Please select INR or USD for your proposal.");
      }
      if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
        throw new Error("Bid amount must be greater than zero.");
      }
      if (!Number.isInteger(deliveryDays) || deliveryDays < 1 || deliveryDays > 3650) {
        throw new Error("Delivery time must be between 1 and 3650 days.");
      }
      if (coverLetter.length < 20 || coverLetter.length > 3000) {
        throw new Error("Cover letter must be between 20 and 3000 characters.");
      }

      const proposal = {
        ...newProposal,
        bidAmount,
        deliveryDays,
        coverLetter,
        currency,
        bidCurrency: currency,
        id:
          newProposal.id ??
          createId("proposal"),
        freelancerId: userId,
        freelancerName:
          user.name ?? "Freelancer",
        freelancerEmail: user.email ?? "",
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setProposals((current) => [
        proposal,
        ...current,
      ]);

      return proposal;
    },
    [gigs, proposals, user]
  );

  const updateProposalStatus = useCallback(
    (gigId, proposalId, nextStatus) => {
      if (
        !["accepted", "rejected"].includes(
          nextStatus
        )
      ) {
        throw new Error(
          "Invalid proposal status."
        );
      }

      const gig = gigs.find((x) =>
        sameId(x.id, gigId)
      );

      const ownerId =
        user?.id ?? user?.email ?? user?.name;

      if (
        !user ||
        !gig ||
        gig.ownerId == null ||
        !sameId(gig.ownerId, ownerId)
      ) {
        throw new Error(
          "Only the gig owner can manage its proposals."
        );
      }

      const proposal = proposals.find(
        (p) =>
          sameId(p.id, proposalId) &&
          sameId(p.gigId, gigId)
      );

      if (
        !proposal ||
        proposal.status !== "pending" ||
        gig.status !== "open"
      ) {
        throw new Error(
          "This proposal is no longer pending or the gig is closed."
        );
      }

      if (nextStatus === "accepted") {
        setGigs((current) =>
          current.map((x) =>
            sameId(x.id, gigId)
              ? {
                  ...x,
                  status: "accepted",
                  acceptedProposalId:
                    proposalId,
                }
              : x
          )
        );

        setProposals((current) =>
          current.map((x) =>
            !sameId(x.gigId, gigId)
              ? x
              : {
                  ...x,
                  status: sameId(
                    x.id,
                    proposalId
                  )
                    ? "accepted"
                    : "rejected",
                }
          )
        );

        setProjects((current) => {
          if (
            current.some((p) =>
              sameId(p.gigId, gigId)
            )
          ) {
            return current;
          }

          const newProject = {
            id: `project-${gig.id}`,
            gigId: gig.id,
            proposalId: proposal.id,
            title: gig.title,
            clientId: gig.ownerId,
            clientName:
              gig.postedBy || "Client",
            freelancerId:
              proposal.freelancerId ??
              proposal.freelancerEmail,
            freelancerEmail:
              proposal.freelancerEmail || "",
            freelancerName:
              proposal.freelancerName ||
              "Freelancer",
            budget:
              proposal.bidAmount ??
              gig.budget,
            budgetAmount: proposal.bidAmount,
            currency: proposal.currency || proposal.bidCurrency ||
              gig.currency || gig.budgetCurrency ||
              (String(gig.budget || "").includes("$") ? "USD" : "INR"),
            budgetCurrency: proposal.currency || proposal.bidCurrency ||
              gig.currency || gig.budgetCurrency ||
              (String(gig.budget || "").includes("$") ? "USD" : "INR"),
            paymentType:
              gig.paymentType || "fixed",
            deadline:
              gig.deadline || null,
            status: "accepted",
            createdAt:
              new Date().toISOString(),
            startedAt: null,
            submittedAt: null,
            completedAt: null,
          };

          return [newProject, ...current];
        });
      } else {
        setProposals((current) =>
          current.map((x) =>
            sameId(x.id, proposalId) &&
            sameId(x.gigId, gigId)
              ? {
                  ...x,
                  status: "rejected",
                }
              : x
          )
        );
      }
    },
    [gigs, proposals, user]
  );

  // PROJECT STATUS
  const updateProjectStatus = useCallback(
    (projectId, nextStatus) => {
      if (!user) {
        throw new Error(
          "Please log in first."
        );
      }

      const project = projects.find((x) =>
        sameId(x.id, projectId)
      );

      if (!project) {
        throw new Error(
          "Project not found."
        );
      }

      let fields = null;

      if (
        nextStatus === "in_progress" &&
        project.status === "accepted" &&
        isFreelancerFor(project, user)
      ) {
        fields = {
          status: "in_progress",
          startedAt:
            new Date().toISOString(),
        };
      } else if (
        nextStatus === "in_review" &&
        project.status === "in_progress" &&
        isFreelancerFor(project, user)
      ) {
        throw new Error(
          "Submit work and message in project chat first."
        );
      } else if (
        nextStatus === "completed" &&
        project.status === "in_review" &&
        isClientFor(project, user)
      ) {
        throw new Error(
          "Approve the submitted work in project chat."
        );
      }

      if (!fields) {
        throw new Error(
          "This project status change is not allowed."
        );
      }

      setProjects((current) =>
        current.map((x) =>
          sameId(x.id, projectId)
            ? { ...x, ...fields }
            : x
        )
      );
    },
    [projects, user]
  );

  // REVIEWS
  const addReview = useCallback(
    ({ projectId, rating, comment }) => {
      if (!user) {
        throw new Error(
          "Please log in first."
        );
      }

      const project = projects.find((x) =>
        sameId(x.id, projectId)
      );

      if (
        !project ||
        project.status !== "completed" ||
        !isClientFor(project, user)
      ) {
        throw new Error(
          "Only the client can review a completed project."
        );
      }

      if (
        reviews.some((r) =>
          sameId(r.projectId, projectId)
        )
      ) {
        throw new Error(
          "This project has already been reviewed."
        );
      }

      const numericRating = Number(rating);
      const cleanComment = String(
        comment || ""
      ).trim();

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        throw new Error(
          "Please select a valid rating from 1 to 5."
        );
      }

      if (
        cleanComment.length < 10 ||
        cleanComment.length > 1000
      ) {
        throw new Error(
          "Review must be between 10 and 1000 characters."
        );
      }

      const review = {
        id: `review-${project.id}`,
        projectId: project.id,
        freelancerId:
          project.freelancerId,
        freelancerEmail:
          project.freelancerEmail,
        freelancerName:
          project.freelancerName,
        clientId: project.clientId,
        clientName: project.clientName,
        projectTitle: project.title,
        rating: numericRating,
        comment: cleanComment,
        createdAt:
          new Date().toISOString(),
      };

      setReviews((current) => [
        ...current,
        review,
      ]);

      return review;
    },
    [user, projects, reviews]
  );

  const getFreelancerReviews = useCallback(
    (freelancerId, freelancerEmail) =>
      reviews.filter(
        (r) =>
          sameId(
            r.freelancerId,
            freelancerId
          ) ||
          sameId(
            r.freelancerEmail,
            freelancerEmail
          )
      ),
    [reviews]
  );

  const getFreelancerRating = useCallback(
    (freelancerId, freelancerEmail) => {
      const list = reviews.filter(
        (r) =>
          sameId(
            r.freelancerId,
            freelancerId
          ) ||
          sameId(
            r.freelancerEmail,
            freelancerEmail
          )
      );

      if (!list.length) {
        return {
          average: 0,
          total: 0,
        };
      }

      return {
        average: Number(
          (
            list.reduce(
              (sum, r) =>
                sum + Number(r.rating),
              0
            ) / list.length
          ).toFixed(1)
        ),
        total: list.length,
      };
    },
    [reviews]
  );

  // DIRECT HIRE INVITATIONS
  const sendInvitation = useCallback(
    ({
      freelancerEmail,
      freelancerName,
      title,
      description,
      budget,
      deadline,
    }) => {
      if (!user?.email) {
        throw new Error(
          "Please log in to hire a freelancer."
        );
      }

      const email = cleanEmail(
        freelancerEmail
      );

      if (!email) {
        throw new Error(
          "Freelancer email is required."
        );
      }

      if (
        email === cleanEmail(user.email)
      ) {
        throw new Error(
          "You cannot send an invitation to yourself."
        );
      }

      const cleanTitle = String(
        title || ""
      ).trim();

      const cleanDescription = String(
        description || ""
      ).trim();

      const amount = Number(budget);

      if (cleanTitle.length < 5) {
        throw new Error(
          "Project title must contain at least 5 characters."
        );
      }

      if (cleanDescription.length < 20) {
        throw new Error(
          "Description must contain at least 20 characters."
        );
      }

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        throw new Error(
          "Enter a valid project budget."
        );
      }

      if (
        !deadline ||
        !/^\d{4}-\d{2}-\d{2}$/.test(
          deadline
        ) ||
        deadline < todayLocal()
      ) {
        throw new Error(
          "Please select a valid deadline."
        );
      }

      const invitation = {
        id: createId("invite"),
        clientId:
          user.id ??
          user.email ??
          user.name,
        clientEmail:
          cleanEmail(user.email),
        clientName:
          user.name || "Client",
        freelancerEmail: email,
        freelancerName:
          freelancerName ||
          "Freelancer",
        title: cleanTitle,
        description: cleanDescription,
        budget: amount,
        deadline,
        status: "pending",
        createdAt:
          new Date().toISOString(),
      };

      setInvitations((current) => [
        invitation,
        ...current,
      ]);

      return invitation;
    },
    [user]
  );

  const respondToInvitation = useCallback(
    (invitationId, response) => {
      if (!user?.email) {
        throw new Error(
          "Please log in first."
        );
      }

      if (
        !["accepted", "rejected"].includes(
          response
        )
      ) {
        throw new Error(
          "Invalid invitation response."
        );
      }

      const invitation = invitations.find(
        (x) =>
          sameId(x.id, invitationId)
      );

      if (!invitation) {
        throw new Error(
          "Invitation not found."
        );
      }

      if (
        cleanEmail(
          invitation.freelancerEmail
        ) !== cleanEmail(user.email)
      ) {
        throw new Error(
          "Only the invited freelancer can respond."
        );
      }

      if (
        invitation.status !== "pending"
      ) {
        throw new Error(
          "This invitation has already been handled."
        );
      }

      setInvitations((current) =>
        current.map((x) =>
          sameId(x.id, invitationId)
            ? {
                ...x,
                status: response,
                respondedAt:
                  new Date().toISOString(),
              }
            : x
        )
      );

      if (response === "accepted") {
        const projectId =
          `hire-project-${invitation.id}`;

        setProjects((current) => {
          if (
            current.some((p) =>
              sameId(p.id, projectId)
            )
          ) {
            return current;
          }

          const newProject = {
            id: projectId,
            gigId: null,
            proposalId: null,
            invitationId:
              invitation.id,
            source: "direct_hire",
            title: invitation.title,
            description:
              invitation.description,
            deadline:
              invitation.deadline,
            clientId:
              invitation.clientId,
            clientEmail:
              invitation.clientEmail,
            clientName:
              invitation.clientName,
            freelancerId:
              user.id ?? user.email,
            freelancerEmail:
              invitation.freelancerEmail,
            freelancerName:
              invitation.freelancerName,
            budget:
              invitation.budget,
            paymentType:
              invitation.paymentType ||
              "fixed",
            status: "accepted",
            createdAt:
              new Date().toISOString(),
            startedAt: null,
            submittedAt: null,
            completedAt: null,
          };

          return [
            newProject,
            ...current,
          ];
        });
      }

      return {
        ...invitation,
        status: response,
      };
    },
    [user, invitations]
  );

  // WORK SUBMISSION
  const submitWork = useCallback(
    ({
      projectId,
      message,
      fileName = "",
      fileData = "",
      hours = null,
    }) => {
      const project = projects.find(
        (x) =>
          sameId(x.id, projectId)
      );

      if (
        !project ||
        !isFreelancerFor(
          project,
          user
        ) ||
        project.status !==
          "in_progress"
      ) {
        throw new Error(
          "Only the working freelancer can submit this project."
        );
      }

      const text = String(
        message || ""
      ).trim();

      if (text.length < 10) {
        throw new Error(
          "Write at least 10 characters about your work."
        );
      }

      if (
        fileData &&
        fileData.length > 550000
      ) {
        throw new Error(
          "File too large for demo storage. Use a smaller file."
        );
      }

      const kind =
        project.paymentType ||
        "fixed";

      const h =
        hours == null
          ? null
          : Number(hours);

      if (
        kind === "hourly" &&
        (
          !Number.isFinite(h) ||
          h <= 0 ||
          h > 744
        )
      ) {
        throw new Error(
          "Enter valid hours worked (1–744)."
        );
      }

      const item = {
        id:
          createId("submission"),
        projectId:
          project.id,
        message: text,
        fileName,
        fileData,
        hours:
          kind === "hourly"
            ? h
            : null,
        createdAt:
          new Date().toISOString(),
        status: "pending",
      };

      setSubmissions(
        (current) => [
          item,
          ...current,
        ]
      );

      setProjects(
        (current) =>
          current.map((x) =>
            sameId(
              x.id,
              project.id
            )
              ? {
                  ...x,
                  status:
                    "in_review",
                  submittedAt:
                    item.createdAt,
                }
              : x
          )
      );

      return item;
    },
    [projects, user]
  );

  // REVIEW WORK
  const reviewWork = useCallback(
    (
      projectId,
      decision,
      feedback = ""
    ) => {
      const project =
        projects.find(
          (x) =>
            sameId(
              x.id,
              projectId
            )
        );

      if (
        !project ||
        !isClientFor(
          project,
          user
        ) ||
        project.status !==
          "in_review"
      ) {
        throw new Error(
          "Only the client can review submitted work."
        );
      }

      if (
        ![
          "approved",
          "changes",
        ].includes(decision)
      ) {
        throw new Error(
          "Invalid review decision."
        );
      }

      const latest =
        submissions.find(
          (x) =>
            sameId(
              x.projectId,
              project.id
            ) &&
            x.status ===
              "pending"
        );

      if (!latest) {
        throw new Error(
          "No pending work submission found."
        );
      }

      if (
        decision === "changes" &&
        String(feedback)
          .trim().length < 5
      ) {
        throw new Error(
          "Please explain the requested changes."
        );
      }

      const now =
        new Date().toISOString();

      setSubmissions(
        (current) =>
          current.map((x) =>
            sameId(
              x.id,
              latest.id
            )
              ? {
                  ...x,
                  status:
                    decision ===
                    "changes"
                      ? "changes_requested"
                      : "approved",
                  feedback:
                    String(
                      feedback
                    ).trim(),
                  reviewedAt:
                    now,
                }
              : x
          )
      );

      setProjects(
        (current) =>
          current.map((x) =>
            sameId(
              x.id,
              project.id
            )
              ? {
                  ...x,
                  status:
                    decision ===
                    "approved"
                      ? "completed"
                      : "in_progress",
                  ...(decision ===
                  "approved"
                    ? {
                        completedAt:
                          now,
                        approvedAt:
                          now,
                        paymentDueAt:
                          new Date(
                            Date.now() +
                              7 *
                                86400000
                          ).toISOString(),
                      }
                    : {
                        submittedAt:
                          null,
                      }),
                }
              : x
          )
      );
    },
    [
      projects,
      submissions,
      user,
    ]
  );

  // FIX: APPROVE WORK
  const approveWork = useCallback(
    (submissionId) => {
      const submission =
        submissions.find(
          (item) =>
            sameId(
              item.id,
              submissionId
            )
        );

      if (!submission) {
        throw new Error(
          "Submission not found."
        );
      }

      return reviewWork(
        submission.projectId,
        "approved"
      );
    },
    [
      submissions,
      reviewWork,
    ]
  );

  // FIX: REQUEST CHANGES
  const requestChanges = useCallback(
    (
      submissionId,
      feedback
    ) => {
      const submission =
        submissions.find(
          (item) =>
            sameId(
              item.id,
              submissionId
            )
        );

      if (!submission) {
        throw new Error(
          "Submission not found."
        );
      }

      return reviewWork(
        submission.projectId,
        "changes",
        feedback
      );
    },
    [
      submissions,
      reviewWork,
    ]
  );

  // PAYMENT QUOTE
  const getPaymentQuote = useCallback(
    (projectId) => {
      const project =
        projects.find(
          (x) =>
            sameId(
              x.id,
              projectId
            )
        );

      if (!project) {
        return null;
      }

      const latestApproved =
        submissions.find(
          (x) =>
            sameId(
              x.projectId,
              project.id
            ) &&
            x.status ===
              "approved"
        );

      const rate =
        amountOf(
          project.budget
        );

      const base =
        project.paymentType ===
        "hourly"
          ? rate *
            Number(
              latestApproved?.hours ||
                0
            )
          : rate;

      const due =
        project.paymentDueAt
          ? new Date(
              project.paymentDueAt
            )
          : null;

      const daysLate =
        due &&
        Date.now() >
          due.getTime()
          ? Math.floor(
              (
                Date.now() -
                due.getTime()
              ) /
                86400000
            )
          : 0;

      // Demo late fee only.
      const lateFee =
        Math.round(
          Math.min(
            base * 0.05,
            base *
              0.001 *
              daysLate
          ) * 100
        ) / 100;

      return {
        base,
        lateFee,
        currency: project.currency || project.budgetCurrency || "INR",
        total:
          base + lateFee,
        daysLate,
        dueAt:
          project.paymentDueAt ||
          null,
      };
    },
    [
      projects,
      submissions,
    ]
  );

  // DEMO CLIENT PAYMENT
  const payForProject = useCallback(
    (
      projectId,
      method
    ) => {
      if (!user) {
        throw new Error(
          "Please log in first."
        );
      }

      if (
        ![
          "upi",
          "netbanking",
          "card",
        ].includes(method)
      ) {
        throw new Error(
          "Invalid demo payment method."
        );
      }

      const project =
        projects.find(
          (x) =>
            sameId(
              x.id,
              projectId
            )
        );

      if (
        !project ||
        !isClientFor(
          project,
          user
        )
      ) {
        throw new Error(
          "Only the client can record a demo payment."
        );
      }

      if (
        project.status !==
        "completed"
      ) {
        throw new Error(
          "Client must approve submitted work first."
        );
      }

      if (
        payments.some(
          (x) =>
            sameId(
              x.projectId,
              projectId
            )
        )
      ) {
        throw new Error(
          "Demo payment already recorded."
        );
      }

      const quote =
        getPaymentQuote(
          projectId
        );

      if (
        !quote ||
        quote.base <= 0
      ) {
        throw new Error(
          "Invalid payment amount."
        );
      }

      const record = {
        id:
          `demo-payment-${project.id}`,
        projectId:
          project.id,
        amount:
          quote.total,
        currency: quote.currency,
        baseAmount:
          quote.base,
        lateFee:
          quote.lateFee,
        daysLate:
          quote.daysLate,
        status: "paid",
        method,
        paidAt:
          new Date().toISOString(),
        payoutStatus:
          "pending",
        clientId:
          project.clientId,
        freelancerId:
          project.freelancerId,
        freelancerEmail:
          project.freelancerEmail,
      };

      setPayments(
        (current) =>
          current.some(
            (x) =>
              sameId(
                x.projectId,
                projectId
              )
          )
            ? current
            : [
                record,
                ...current,
              ]
      );

      return record;
    },
    [
      user,
      projects,
      payments,
      getPaymentQuote,
    ]
  );

  // DEMO FREELANCER PAYOUT
  const requestDemoPayout =
    useCallback(
      (projectId) => {
        if (!user) {
          throw new Error(
            "Please log in first."
          );
        }

        const project =
          projects.find(
            (x) =>
              sameId(
                x.id,
                projectId
              )
          );

        if (
          !project ||
          !isFreelancerFor(
            project,
            user
          )
        ) {
          throw new Error(
            "Only the assigned freelancer can record this demo payout."
          );
        }

        if (
          project.status !==
          "completed"
        ) {
          throw new Error(
            "Project must be completed first."
          );
        }

        const payment =
          payments.find(
            (x) =>
              sameId(
                x.projectId,
                projectId
              ) &&
              x.status ===
                "paid"
          );

        if (!payment) {
          throw new Error(
            "Client demo payment is not recorded yet."
          );
        }

        if (
          payment.payoutStatus ===
          "paid"
        ) {
          throw new Error(
            "Demo payout already recorded."
          );
        }

        setPayments(
          (current) =>
            current.map(
              (x) =>
                sameId(
                  x.projectId,
                  projectId
                )
                  ? {
                      ...x,
                      payoutStatus:
                        "paid",
                      payoutAt:
                        new Date().toISOString(),
                    }
                  : x
            )
        );
      },
      [
        user,
        projects,
        payments,
      ]
    );

  // NOTIFICATIONS: derived from existing records; read state is account-specific.
  const notificationUserKey = cleanEmail(user?.email) || String(user?.id ?? "");
  const [readByAccount, setReadByAccount] = useState(() =>
    readStorage("gignovaNotificationReadByAccount", {})
  );

  const notifications = useMemo(() => {
    if (!user || !notificationUserKey) return [];
    const items = [];
    const add = (type, id, title, description, date, link) => {
      items.push({ id: `${type}:${id}`, type, title, description,
        createdAt: date || null, link });
    };
    const mine = (id, email) => sameId(id, user.id) ||
      sameId(id, user.email) || (email && sameId(email, user.email));

    proposals.forEach((p) => {
      const gig = gigs.find((g) => sameId(g.id, p.gigId));
      const client = gig && mine(gig.ownerId, gig.ownerEmail);
      const freelancer = mine(p.freelancerId, p.freelancerEmail);
      if (client && !freelancer) add("proposal", p.id,
        "New proposal received", `${p.freelancerName || "A freelancer"} applied to ${p.gigTitle || gig.title || "your gig"}.`,
        p.createdAt || p.submittedAt, "/dashboard");
      if (freelancer && ["accepted", "rejected"].includes(p.status))
        add("proposal-status", `${p.id}:${p.status}`,
          `Proposal ${p.status}`, `Your proposal for ${p.gigTitle || gig?.title || "a gig"} was ${p.status}.`,
          p.updatedAt || p.respondedAt || p.createdAt, "/dashboard");
    });
    invitations.forEach((inv) => {
      if (sameId(inv.freelancerEmail, user.email))
        add("invitation", inv.id, "Project invitation",
          `${inv.clientName || "A client"} invited you to ${inv.title || "a project"}.`,
          inv.createdAt, "/invitations");
      if (mine(inv.clientId, inv.clientEmail) && inv.status !== "pending")
        add("invitation-response", `${inv.id}:${inv.status}`,
          `Invitation ${inv.status}`, `${inv.freelancerName || "Freelancer"} ${inv.status} your invitation.`,
          inv.respondedAt || inv.createdAt, "/invitations");
    });
    projects.forEach((project) => {
      const client = mine(project.clientId, project.clientEmail);
      const freelancer = mine(project.freelancerId, project.freelancerEmail);
      if (!client && !freelancer) return;
      if (freelancer && project.startedAt)
        add("project-start", project.id, "Project started", project.title || "Project started",
          project.startedAt, "/projects");
      if (client && project.submittedAt)
        add("project-submitted", `${project.id}:${project.submittedAt}`,
          "Work submitted for review", project.title || "Review the submitted work",
          project.submittedAt, "/projects");
      if (freelancer && project.completedAt)
        add("project-completed", project.id, "Work approved",
          project.title || "Project completed", project.completedAt, "/projects");
    });
    submissions.forEach((submission) => {
      const project = projects.find((p) => sameId(p.id, submission.projectId));
      if (!project) return;
      if (mine(project.freelancerId, project.freelancerEmail) &&
          submission.status === "changes_requested")
        add("changes", submission.id, "Changes requested",
          submission.feedback || `Client requested changes to ${project.title}.`,
          submission.reviewedAt || submission.createdAt, "/projects");
    });
    payments.forEach((payment) => {
      const project = projects.find((p) => sameId(p.id, payment.projectId));
      if (!project) return;
      if ((mine(project.clientId, project.clientEmail) ||
          mine(project.freelancerId, project.freelancerEmail)) && payment.status === "paid")
        add("payment", payment.id || payment.projectId, "Demo payment recorded",
          `Demo payment for ${project.title || "project"} was recorded.`,
          payment.paidAt, "/payments");
      if (mine(project.freelancerId, project.freelancerEmail) &&
          payment.payoutStatus === "paid")
        add("payout", payment.id || payment.projectId, "Demo payout recorded",
          `Demo payout for ${project.title || "project"} was recorded.`,
          payment.payoutAt || payment.paidAt, "/earnings");
    });
    return items.sort((a, b) =>
      (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0));
  }, [user, notificationUserKey, gigs, proposals, projects, submissions, invitations, payments]);

  const readIds = readByAccount[notificationUserKey] || [];
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;
  const updateRead = useCallback((ids) => {
    if (!notificationUserKey) return;
    setReadByAccount((previous) => {
      const next = { ...previous,
        [notificationUserKey]: Array.from(new Set([...(previous[notificationUserKey] || []), ...ids])) };
      try { localStorage.setItem("gignovaNotificationReadByAccount", JSON.stringify(next)); }
      catch (error) { console.error("Unable to save notification state:", error); }
      return next;
    });
  }, [notificationUserKey]);
  const markNotificationRead = useCallback((id) => updateRead([id]), [updateRead]);
  const markAllNotificationsRead = useCallback(() =>
    updateRead(notifications.map((n) => n.id)), [notifications, updateRead]);

  // CONTEXT VALUES
  const value = {
    user,
    setUser: loginUser,
    logoutUser,

    gigs,
    setGigs,
    addGig,
    deleteGig,

    proposals,
    addProposal,

    acceptProposal: (
      gigId,
      proposalId
    ) =>
      updateProposalStatus(
        gigId,
        proposalId,
        "accepted"
      ),

    rejectProposal: (
      gigId,
      proposalId
    ) =>
      updateProposalStatus(
        gigId,
        proposalId,
        "rejected"
      ),

    projects,
    updateProjectStatus,

    reviews,
    addReview,
    getFreelancerReviews,
    getFreelancerRating,

    invitations,
    sendInvitation,
    respondToInvitation,

    payments,
    payForProject,
    requestDemoPayout,

    submissions,
    submitWork,
    reviewWork,

    // IMPORTANT FIX
    approveWork,
    requestChanges,

    getPaymentQuote,
    storageError,
    notifications,
    unreadCount,
    readNotificationIds: readIds,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return (
    <GigNovaContext.Provider
      value={value}
    >
      {children}
    </GigNovaContext.Provider>
  );
}

export function useGigNova() {
  const context =
    useContext(
      GigNovaContext
    );

  if (!context) {
    throw new Error(
      "useGigNova must be used inside GigNovaProvider."
    );
  }

  return context;
}

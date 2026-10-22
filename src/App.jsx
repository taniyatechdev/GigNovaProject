
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import Navbar from "./Navbar";
import Home from "./Home";
import BrowseGigs from "./BrowseGigs";
import PostGig from "./PostGig";
import About from "./About";
import Contact from "./Contact";
import Login from "./Login";
import Signup from "./signup";
import Dashboard from "./Dashboard";
import Profile from "./MyProfile";
import Projects from "./Projects";
import Reviews from "./Reviews";
import Chat from "./Chat";
import FindFreelancers from "./FindFreelancers";
import Invitations from "./Invitations";
import PaymentCenter from "./PaymentCenter";
import FreelancerEarnings from "./FreelancerEarnings";
import Notifications from "./Notifications";
import ProtectedRoute from "./ProtectedRoute";
import GigDetailsRoute from "./GigDetailsRoute";
import SavedGigs from "./SavedGigs";
import NotFound from "./NotFound";

import { useGigNova } from "./context/GigNovaContext";

const sameId = (a, b) =>
  a != null &&
  b != null &&
  String(a).trim().toLowerCase() ===
    String(b).trim().toLowerCase();

const PAGE_PATHS = {
  home: "/",
  browse: "/browse",
  gigs: "/browse",
  saved: "/saved",
  "saved-gigs": "/saved",
  freelancers: "/freelancers",
  "find-freelancers": "/freelancers",
  invitations: "/invitations",
  notifications: "/notifications",
  payments: "/payments",
  earnings: "/earnings",
  "freelancer-earnings": "/earnings",
  post: "/post",
  about: "/about",
  contact: "/contact",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  profile: "/profile",
  projects: "/projects",
  reviews: "/reviews",
  "project-chat": "/projects",
};

export default function App() {
  const navigate = useNavigate();

  const {
    user,
    setUser,
    logoutUser,
    gigs = [],
    addGig,
    deleteGig,
    proposals = [],
    addProposal,
    acceptProposal,
    rejectProposal,
    projects = [],
    updateProjectStatus,
    reviews = [],
    addReview,
    storageError,
  } = useGigNova();

  const setPage = (page) => {
    if (typeof page !== "string") return;

    navigate(
      PAGE_PATHS[page] ||
        (page.startsWith("/") ? page : "/")
    );
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    navigate("/dashboard");
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const handleAddGig = async (gig) => {
    if (!String(gig?.title || "").trim()) return;
    await addGig(gig);
  };

  const handleViewGig = (gig) => {
    if (gig?.id == null) return;

    navigate(`/gigs/${encodeURIComponent(gig.id)}`, {
      state: { gig },
    });
  };

  const openProjectChat = (project) => {
    if (project?.id == null) return;

    navigate(
      `/project-chat/${encodeURIComponent(project.id)}`
    );
  };

  const protect = (element) => (
    <ProtectedRoute>{element}</ProtectedRoute>
  );

  return (
    <>
      <Navbar
        setPage={setPage}
        user={user}
        logout={handleLogout}
        onLogout={handleLogout}
      />

      {storageError && (
        <div
          role="alert"
          style={{
            padding: "12px 6%",
            background: "#fff3e0",
            color: "#8a4b08",
          }}
        >
          {String(storageError)}
        </div>
      )}

      <Routes>
        {/* PUBLIC PAGES */}

        <Route
          path="/"
          element={
            <Home
              setPage={setPage}
              onViewGig={handleViewGig}
            />
          }
        />

        <Route
          path="/browse"
          element={
            <BrowseGigs
              gigs={gigs.filter(
                (gig) =>
                  !gig.status ||
                  String(gig.status).toLowerCase() === "open"
              )}
              onView={handleViewGig}
              onViewGig={handleViewGig}
            />
          }
        />

        <Route
          path="/gigs/:gigId"
          element={<GigDetailsRoute />}
        />

        <Route
          path="/saved"
          element={<SavedGigs />}
        />

        <Route
          path="/freelancers"
          element={
            <FindFreelancers
              proposals={proposals}
              projects={projects}
              reviews={reviews}
            />
          }
        />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Login
                onNavigate={setPage}
                onLoginSuccess={handleLogin}
              />
            )
          }
        />

        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Signup onNavigate={setPage} />
            )
          }
        />

        <Route
          path="/about"
          element={<About setPage={setPage} />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* PROTECTED PAGES */}

        <Route
          path="/post"
          element={protect(
            <PostGig onAddGig={handleAddGig} />
          )}
        />

        <Route
          path="/dashboard"
          element={protect(
            <Dashboard
              user={user}
              gigs={gigs}
              proposals={proposals}
              projects={projects}
              reviews={reviews}
              onDeleteGig={deleteGig}
              onAcceptProposal={acceptProposal}
              onRejectProposal={rejectProposal}
              onViewGig={handleViewGig}
              setPage={setPage}
              onOpenProjects={() => navigate("/projects")}
              onOpenPayments={() => navigate("/payments")}
            />
          )}
        />

        <Route
          path="/profile"
          element={protect(
            <Profile
              user={user}
              reviews={reviews}
              setPage={setPage}
            />
          )}
        />

        <Route
          path="/projects"
          element={protect(
            <Projects
              user={user}
              projects={projects}
              gigs={gigs}
              proposals={proposals}
              onUpdateStatus={updateProjectStatus}
              onOpenChat={openProjectChat}
            />
          )}
        />

        <Route
          path="/reviews"
          element={protect(
            <Reviews
              user={user}
              projects={projects}
              reviews={reviews}
              onAddReview={addReview}
            />
          )}
        />

        <Route
          path="/invitations"
          element={protect(
            <Invitations setPage={setPage} />
          )}
        />

        <Route
          path="/notifications"
          element={protect(
            <Notifications setPage={setPage} />
          )}
        />

        {/* PAYMENTS AND EARNINGS */}

        <Route
          path="/payments"
          element={protect(
            <PaymentCenter
              user={user}
              projects={projects}
            />
          )}
        />

        <Route
          path="/earnings"
          element={protect(<FreelancerEarnings />)}
        />

        {/* PROJECT CHAT */}

        <Route
          path="/project-chat/:projectId"
          element={protect(
            <ProjectChatRoute
              user={user}
              gigs={gigs}
              proposals={proposals}
              projects={projects}
            />
          )}
        />

        <Route
          path="/project-chat"
          element={<Navigate to="/projects" replace />}
        />

        {/* 404 PAGE - KEEP THIS LAST */}

        <Route
          path="*"
          element={<NotFound />}
        />
        
{/* 404 PAGE - KEEP THIS LAST */}
<Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function ProjectChatRoute({
  user,
  gigs,
  proposals,
  projects,
}) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const project = projects.find((item) =>
    sameId(item.id, projectId)
  );

  if (!project) {
    return (
      <main style={{ padding: "50px 6%" }}>
        <h2>Project not found</h2>

        <button
          type="button"
          onClick={() => navigate("/projects")}
        >
          Back to Projects
        </button>
      </main>
    );
  }

  const gig =
    gigs.find((item) =>
      sameId(
        item.id,
        project.gigId ?? project.gig?.id
      )
    ) ||
    project.gig || {
      id: project.gigId || project.id,
      title:
        project.title ||
        project.projectTitle ||
        "Direct Hire Project",
      clientEmail:
        project.clientEmail ||
        project.client?.email ||
        "",
    };

  const proposal =
    proposals.find(
      (item) =>
        sameId(
          item.id,
          project.proposalId ?? project.proposal?.id
        ) ||
        (sameId(item.gigId, gig.id) &&
          String(item.status || "").toLowerCase() ===
            "accepted")
    ) ||
    project.proposal || {
      id: project.proposalId || project.id,
      gigId: gig.id,
      freelancerEmail:
        project.freelancerEmail ||
        project.freelancer?.email ||
        "",
      status: "accepted",
    };

  return (
    <Chat
      projectId={project.id}
      user={user}
      gig={gig}
      proposal={proposal}
      onBack={() => navigate("/projects")}
    />
  );
}

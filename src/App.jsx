import React, { useState } from "react";

import Navbar from "./Navbar";

import Home from "./Home";
import BrowseGigs from "./BrowseGigs";
import PostGig from "./PostGig";
import GigDetails from "./GigDetails";
import About from "./About";
import Contact from "./Contact";
import Login from "./Login";
import Signup from "./signup";
import Dashboard from "./Dashboard";

function App() {

  // ================= PAGE =================

  const [page, setPage] = useState("home");

  // ================= SELECTED GIG =================

  const [selectedGig, setSelectedGig] = useState(null);

  // ================= LOGGED-IN USER =================

  const [user, setUser] = useState(() => {

    const savedUser = localStorage.getItem("gignovaLoggedIn");

    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (error) {
        console.error("Error loading logged-in user:", error);
        localStorage.removeItem("gignovaLoggedIn");
      }
    }

    return null;
  });


  // ================= GIG DATA =================

  const [gigs, setGigs] = useState(() => {

    const savedGigs = localStorage.getItem("gignovaGigs");

    if (savedGigs) {

      try {
        return JSON.parse(savedGigs);
      } catch (error) {
        console.error("Error loading gigs:", error);
      }

    }

    // Default gigs for first time
    const defaultGigs = [

      {
        id: 1,
        title: "Build a React Website",
        category: "Web Development",
        description:
          "Need a responsive React website for a small business.",
        budget: "₹10,000",
        skills: "React, JavaScript, CSS",
        experience: "Intermediate",
        deadline: "2026-10-15",
        postedBy: "Rahul",
        status: "open"
      },

      {
        id: 2,
        title: "Design a Logo",
        category: "Graphic Design",
        description:
          "Looking for a creative logo for a new brand.",
        budget: "₹3,000",
        skills: "Figma, Photoshop, Illustrator",
        experience: "Beginner",
        deadline: "2026-10-10",
        postedBy: "Priya",
        status: "open"
      },

      {
        id: 3,
        title: "Write a Blog",
        category: "Content Writing",
        description:
          "Write an informative blog article about technology.",
        budget: "₹2,000",
        skills: "Writing, SEO, Research",
        experience: "Intermediate",
        deadline: "2026-10-05",
        postedBy: "Aman",
        status: "open"
      }

    ];

    // Save default gigs
    localStorage.setItem(
      "gignovaGigs",
      JSON.stringify(defaultGigs)
    );

    return defaultGigs;
  });



  const addProposal = (newProposal) => {
  setProposals((oldProposals) => {
    const updatedProposals = [
      ...oldProposals,
      newProposal
    ];

    localStorage.setItem(
      "gignovaProposals",
      JSON.stringify(updatedProposals)
    );

    return updatedProposals;
  });
};

  // ================= ADD GIG =================

  const addGig = (newGig) => {

    const gigWithStatus = {
      ...newGig,
      status: "open"
    };

    setGigs((oldGigs) => {

      const updatedGigs = [
        ...oldGigs,
        gigWithStatus
      ];

      localStorage.setItem(
        "gignovaGigs",
        JSON.stringify(updatedGigs)
      );

      return updatedGigs;
    });

    setPage("browse");
  };


  // ================= DELETE GIG =================

  const deleteGig = (id) => {

    setGigs((oldGigs) => {

      const updatedGigs = oldGigs.filter(
        (gig) => gig.id !== id
      );

      localStorage.setItem(
        "gignovaGigs",
        JSON.stringify(updatedGigs)
      );

      return updatedGigs;
    });

  };


  // ================= ACCEPT PROPOSAL =================

  const acceptProposal = (gigId, proposalId) => {

    setGigs((oldGigs) => {

      const updatedGigs = oldGigs.map((gig) => {

        if (gig.id === gigId) {

          return {
            ...gig,
            status: "accepted",
            acceptedProposalId: proposalId
          };

        }

        return gig;

      });

      localStorage.setItem(
        "gignovaGigs",
        JSON.stringify(updatedGigs)
      );

      return updatedGigs;

    });

    // Update selected gig also
    if (selectedGig && selectedGig.id === gigId) {

      setSelectedGig({
        ...selectedGig,
        status: "accepted",
        acceptedProposalId: proposalId
      });

    }

  };



  const [proposals, setProposals] = useState(() => {
  const savedProposals = localStorage.getItem("gignovaProposals");

  if (savedProposals) {
    try {
      return JSON.parse(savedProposals);
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  }

  return [];
});
  // ================= VIEW GIG =================

  const viewGig = (gig) => {

    setSelectedGig(gig);

    setPage("details");

  };


  // ================= LOGOUT =================

  const logout = () => {

    // Only remove LOGIN SESSION
    // DO NOT remove gigs

    localStorage.removeItem("gignovaLoggedIn");

    setUser(null);

    setPage("home");

  };


  // ================= RENDER =================

  return (

    <div className="app">

      {/* ================= NAVBAR ================= */}

      <Navbar
        setPage={setPage}
        user={user}
        logout={logout}
      />


      {/* ================= HOME ================= */}

      {page === "home" && (
        <Home setPage={setPage} />
      )}


      {/* ================= BROWSE GIGS ================= */}

      {page === "browse" && (

        <BrowseGigs
          gigs={gigs.filter(
            (gig) => gig.status !== "accepted"
          )}
          onView={viewGig}
        />

      )}


      {/* ================= POST GIG ================= */}

      {page === "post" && (

        user ? (

          <PostGig
            onAddGig={addGig}
          />

        ) : (

          <Login
            setPage={setPage}
            setUser={setUser}
          />

        )

      )}


      {/* ================= GIG DETAILS ================= */}

      {page === "details" && selectedGig && (

        <GigDetails
          gig={selectedGig}
          onBack={() => setPage("browse")}
          onAcceptProposal={acceptProposal}
        />

      )}


      {/* ================= ABOUT ================= */}

      {page === "about" && (
        <About setPage={setPage} />
      )}


      {/* ================= CONTACT ================= */}

      {page === "contact" && (
        <Contact />
      )}


      {/* ================= LOGIN ================= */}

      {page === "login" && !user && (

        <Login
          setPage={setPage}
          setUser={setUser}
        />

      )}


      {/* ================= SIGNUP ================= */}

      {page === "signup" && !user && (

        <Signup
          setPage={setPage}
        />

      )}


      {/* ================= DASHBOARD ================= */}

      {page === "dashboard" && user && (

        <Dashboard
          user={user}
          gigs={gigs}
          onDeleteGig={deleteGig}
          onAcceptProposal={acceptProposal}
        />

      )}

    </div>

  );
}

export default App;
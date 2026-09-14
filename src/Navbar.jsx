import React from "react";
import "./Navbar.css";

function Navbar({ setPage, user, logout }) {

  return (
    <nav className="navbar">

      <div
        className="logo"
        onClick={() => setPage("home")}
      >
        GigNova
      </div>

      <div className="nav-links">

        <button onClick={() => setPage("home")}>
          Home
        </button>

        <button onClick={() => setPage("browse")}>
          Browse Gigs
        </button>

        <button onClick={() => setPage("post")}>
          Post a Gig
        </button>

        <button onClick={() => setPage("about")}>
          About
        </button>

        <button onClick={() => setPage("contact")}>
          Contact
        </button>

        {user ? (
          <>
            <button onClick={() => setPage("dashboard")}>
              Dashboard
            </button>

            <button onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setPage("login")}>
              Login
            </button>

            <button onClick={() => setPage("signup")}>
              Sign Up
            </button>
          </>
        )}

      </div>

    </nav>
  );
}

export default Navbar;
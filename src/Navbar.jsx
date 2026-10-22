import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useGigNova } from "./context/GigNovaContext";
import { useTheme } from "./context/ThemeContext";
import "./Navbar.css";

const GROUPS = [
  {
    id: "explore",
    label: "Explore",
    items: [
      { label: "Browse Gigs", page: "browse" },
      { label: "♡ Saved Gigs", page: "saved" },
      {
        label: "🔎 Find Freelancers",
        page: "freelancers",
        auth: true,
      },
    ],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { label: "Post a Gig", page: "post" },
      { label: "My Projects", page: "projects", auth: true },
      {
        label: "💌 My Invitations",
        page: "invitations",
        auth: true,
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    auth: true,
    items: [
      { label: "💰 Payments", page: "payments" },
      { label: "💸 My Earnings", page: "earnings" },
    ],
  },
];

export default function Navbar({
  setPage,
  user,
  logout,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  const rootRef = useRef(null);
  const location = useLocation();

  const { unreadCount = 0 } = useGigNova();

  // Theme Context API
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpenGroup(null);
        setMenuOpen(false);
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        setOpenGroup(null);
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const navigate = (page) => {
    setOpenGroup(null);
    setMenuOpen(false);

    setPage?.(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLogout = () => {
    setOpenGroup(null);
    setMenuOpen(false);

    (logout || onLogout)?.();
  };

  const toggleGroup = (id) => {
    setOpenGroup((current) =>
      current === id ? null : id
    );
  };

  const renderGroup = (group) => {
    if (group.auth && !user) return null;

    const items = group.items.filter(
      (item) => !item.auth || user
    );

    if (!items.length) return null;

    const expanded = openGroup === group.id;

    return (
      <div
        className={`gn-nav-group ${
          expanded ? "gn-group-open" : ""
        }`}
        key={group.id}
      >
        <button
          type="button"
          className="gn-dropdown-trigger"
          aria-expanded={expanded}
          aria-controls={`gn-menu-${group.id}`}
          onClick={() => toggleGroup(group.id)}
        >
          {group.label}

          <span
            className="gn-chevron"
            aria-hidden="true"
          >
            ⌄
          </span>
        </button>

        <div
          id={`gn-menu-${group.id}`}
          className="gn-dropdown-menu"
          hidden={!expanded}
        >
          {items.map((item) => (
            <button
              type="button"
              key={item.page}
              onClick={() => navigate(item.page)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <header className="gn-navbar" ref={rootRef}>
      <div className="gn-navbar-container">

        {/* LOGO */}
        <button
          type="button"
          className="gn-logo"
          onClick={() => navigate("home")}
        >
          <span className="gn-logo-icon">✦</span>

          <span>
            Gig
            <span className="gn-logo-accent">
              Nova
            </span>
          </span>
        </button>

        {/* MOBILE MENU */}
        <button
          type="button"
          className="gn-menu-toggle"
          aria-label={
            menuOpen ? "Close menu" : "Open menu"
          }
          aria-expanded={menuOpen}
          aria-controls="gn-navigation"
          onClick={() => {
            setMenuOpen((value) => !value);
            setOpenGroup(null);
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* NAVIGATION */}
        <nav
          id="gn-navigation"
          className={`gn-nav-links ${
            menuOpen ? "gn-nav-open" : ""
          }`}
          aria-label="Main navigation"
        >
          <button
            type="button"
            onClick={() => navigate("home")}
          >
            Home
          </button>

          {GROUPS.map(renderGroup)}

          {user && (
            <button
              type="button"
              onClick={() => navigate("dashboard")}
            >
              Dashboard
            </button>
          )}

          {/* NOTIFICATIONS */}
          {user && (
            <button
              type="button"
              className="gn-notifications-btn"
              onClick={() => navigate("notifications")}
              aria-label={`Notifications${
                unreadCount > 0
                  ? `, ${unreadCount} unread`
                  : ""
              }`}
              title="Notifications"
            >
              <span aria-hidden="true">🔔</span>

              <span className="gn-notifications-label">
                Notifications
              </span>

              {unreadCount > 0 && (
                <span
                  className="gn-notifications-count"
                  aria-hidden="true"
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate("about")}
          >
            About
          </button>

          <button
            type="button"
            onClick={() => navigate("contact")}
          >
            Contact
          </button>

          {/* LIGHT / DARK MODE */}
          <button
            type="button"
            className="gn-navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            aria-pressed={theme === "dark"}
            title={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            <span
              className="gn-navbar-theme-icon"
              aria-hidden="true"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </span>

            <span className="gn-navbar-theme-label">
              {theme === "light"
                ? "Dark"
                : "Light"}
            </span>
          </button>

          {/* PROFILE / AUTH */}
          {user ? (
            <div
              className={`gn-nav-group ${
                openGroup === "account"
                  ? "gn-group-open"
                  : ""
              }`}
            >
              <button
                type="button"
                className="gn-dropdown-trigger gn-profile-btn"
                aria-expanded={
                  openGroup === "account"
                }
                aria-controls="gn-menu-account"
                onClick={() =>
                  toggleGroup("account")
                }
              >
                Profile

                <span
                  className="gn-chevron"
                  aria-hidden="true"
                >
                  ⌄
                </span>
              </button>

              <div
                id="gn-menu-account"
                className="gn-dropdown-menu gn-dropdown-right"
                hidden={
                  openGroup !== "account"
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("profile")
                  }
                >
                  My Profile
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("reviews")
                  }
                >
                  Ratings & Reviews
                </button>

                <button
                  type="button"
                  className="gn-logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                type="button"
                className="gn-login-btn"
                onClick={() =>
                  navigate("login")
                }
              >
                Sign In
              </button>

              <button
                type="button"
                className="gn-signup-btn"
                onClick={() =>
                  navigate("signup")
                }
              >
                Sign Up
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
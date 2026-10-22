import React from "react";
import { useTheme } from "../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="gn-theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <span className="gn-theme-icon">
        {theme === "light" ? "🌙" : "☀️"}
      </span>

      <span className="gn-theme-label">
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}
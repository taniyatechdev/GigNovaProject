
import React, { useState } from "react";
import { authService } from "./services/authService";
import Toast from "./Toast";

import "./auth.css";
import "./Loginsignup.css";

export default function Login({
  onNavigate,
  onLoginSuccess,
}) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "info",
  });

  // VALIDATE LOGIN FORM
  const validate = () => {
    const nextErrors = {};
    const identifier =
      formData.identifier.trim();

    if (!identifier) {
      nextErrors.identifier =
        "Email or username is required.";
    }

    if (!formData.password) {
      nextErrors.password =
        "Password is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // REDIRECT AFTER SUCCESSFUL LOGIN
  const executeRedirect = (loggedInUser) => {
    if (typeof onLoginSuccess === "function") {
      onLoginSuccess(loggedInUser);
      return;
    }

    if (typeof onNavigate === "function") {
      onNavigate("dashboard");
      return;
    }

    console.error(
      "Login redirect failed: missing navigation callback."
    );
  };

  // HANDLE LOGIN SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      const loggedInUser = await authService.login(
        formData.identifier.trim(),
        formData.password
      );

      if (!loggedInUser) {
        throw new Error(
          "Login failed. Please check your credentials."
        );
      }

      setToast({
        message: `Welcome back, ${
          loggedInUser.name || "User"
        }! Redirecting to Dashboard...`,
        type: "success",
      });

      // App.jsx saves the user and opens Dashboard.
      executeRedirect(loggedInUser);
    } catch (err) {
      console.error("Login error:", err);

      setToast({
        message:
          err.message ||
          "Failed to authenticate. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // GO TO SIGNUP
  const handleNavigateSignup = () => {
    if (typeof onNavigate === "function") {
      onNavigate("signup");
    } else {
      console.error(
        "Signup navigation callback is missing."
      );
    }
  };

  return (
    <div className="auth-page-container">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast({
              message: "",
              type: "info",
            })
          }
        />
      )}

      <div className="auth-split-wrapper">
        {/* LEFT SHOWCASE PANEL */}
        <div className="auth-showcase-panel">
          <div className="auth-showcase-content">
            <span className="auth-tag">
              Platform Portal
            </span>

            <h2>
              Accelerate Your Engineering Workflow
            </h2>

            <p>
              Experience seamless freelance
              collaboration, proposals, and verified
              talent exchange within GigNova.
            </p>

            <div className="auth-showcase-badges">
              <div className="auth-badge-item">
                <strong>99.99%</strong>
                <span>Uptime SLA</span>
              </div>

              <div className="auth-badge-item">
                <strong>Zero-OTP</strong>
                <span>Direct Login</span>
              </div>
            </div>
          </div>

          <div className="auth-badge-item">
            <strong>GigNova Security</strong>
            <span>
              Direct Authenticated Access
            </span>
          </div>
        </div>

        {/* RIGHT LOGIN FORM */}
        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Sign In</h1>

              <p>
                Welcome back! Enter your verified
                credentials to access your console.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="auth-form"
            >
              {/* EMAIL OR USERNAME */}
              <div className="auth-field-group">
                <label htmlFor="identifier">
                  Email or Username
                </label>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    👤
                  </span>

                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="name@company.com or username"
                    className={`auth-input ${
                      errors.identifier
                        ? "auth-input-invalid"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>

                {errors.identifier && (
                  <span className="auth-field-error">
                    {errors.identifier}
                  </span>
                )}
              </div>

              {/* PASSWORD */}
              <div className="auth-field-group">
                <div className="auth-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <button
                    type="button"
                    className="auth-subtle-link"
                    onClick={() =>
                      setToast({
                        message:
                          "Password reset is not configured yet.",
                        type: "info",
                      })
                    }
                  >
                    Forgot Password?
                  </button>
                </div>

                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`auth-input ${
                      errors.password
                        ? "auth-input-invalid"
                        : ""
                    }`}
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {errors.password && (
                  <span className="auth-field-error">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="auth-btn auth-btn-primary auth-btn-full"
                disabled={isLoading}
              >
                {isLoading
                  ? "Signing In..."
                  : "Sign In to Dashboard"}
              </button>
            </form>

            {/* SIGNUP LINK */}
            <div className="auth-footer-prompt">
              Don't have an account yet?{" "}

              <button
                type="button"
                className="auth-link-btn"
                onClick={handleNavigateSignup}
              >
                Create Account with OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

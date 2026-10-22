import React, { useState } from "react";
import { authService } from "./services/authService";
import Toast from "./Toast";
import OtpModal from "./OtpModal";
import "./auth.css";
import "./Loginsignup.css";
export default function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [previewOtp, setPreviewOtp] = useState("");

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(formData.password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const strengthColors = ["#dc2626", "#ea580c", "#d97706", "#355E3B", "#294A2E"];

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required.";
        return "";
      case "email":
        if (!value.trim()) return "Email address is required.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return "Please enter a valid email address.";
        }
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password.";
        if (value !== formData.password) return "Passwords do not match.";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email" && isOtpVerified) {
      setIsOtpVerified(false);
      setOtpSent(false);
      setPreviewOtp("");
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSendOtp = async () => {
    const emailErr = validateField("email", formData.email);
    if (emailErr) {
      setErrors((prev) => ({ ...prev, email: emailErr }));
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await authService.requestSignupOtp(formData.email);
      setOtpSent(true);
      setPreviewOtp(res.previewOtp);
      setIsOtpModalOpen(true);
      setToast({
        message: `OTP Code generated: ${res.previewOtp}`,
        type: "info",
      });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (code) => {
    setIsVerifyingOtp(true);
    try {
      await authService.verifySignupOtp(formData.email, code);
      setIsOtpVerified(true);
      setIsOtpModalOpen(false);
      setToast({
        message: "Email verified successfully! You may now complete sign up.",
        type: "success",
      });
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleNavigateLogin = () => {
    if (typeof onNavigate === "function") {
      onNavigate("login");
    } else {
      window.location.href = "/login";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) nextErrors[key] = err;
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!isOtpVerified) {
      setToast({
        message: "Please click 'Send OTP' and verify your email first.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.completeSignup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setToast({
        message: "Account created successfully! Redirecting to sign in...",
        type: "success",
      });

      setTimeout(() => {
        handleNavigateLogin();
      }, 1000);
    } catch (err) {
      setToast({ message: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "info" })}
        />
      )}

      <OtpModal
        isOpen={isOtpModalOpen}
        email={formData.email}
        previewOtp={previewOtp}
        isVerifying={isVerifyingOtp}
        onVerify={handleVerifyOtp}
        onResend={handleSendOtp}
        onClose={() => setIsOtpModalOpen(false)}
      />

      <div className="auth-split-wrapper">
        <div className="auth-showcase-panel">
          <div className="auth-showcase-content">
            <span className="auth-tag">Instant Onboarding</span>
            <h2>Build the Future With Verified Trust</h2>
            <p>
              Join the GigNova freelancing platform to connect with top-tier clients, share proposals, and accelerate your independent career.
            </p>
            <div className="auth-showcase-stepper">
              <div className={`auth-step-pill ${formData.email ? "active" : ""}`}>
                <span>1</span> Provide Credentials
              </div>
              <div className={`auth-step-pill ${isOtpVerified ? "active" : ""}`}>
                <span>2</span> Verify 6-Digit OTP
              </div>
              <div className={`auth-step-pill ${isOtpVerified ? "active" : ""}`}>
                <span>3</span> Deploy Workspace
              </div>
            </div>
          </div>
          <div className="auth-badge-item">
            <strong>GigNova Platform</strong>
            <span>Verified Talent Network</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Create an Account</h1>
              <p>Sign up in seconds. Email OTP verification is required.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="auth-form">
              <div className="auth-field-group">
                <label htmlFor="name">Full Name</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Taniya Sharma"
                    className={`auth-input ${errors.name ? "auth-input-invalid" : ""}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && <span className="auth-field-error">{errors.name}</span>}
              </div>

              <div className="auth-field-group">
                <label htmlFor="email">Work Email</label>
                <div className="auth-input-action-wrapper">
                  <div className="auth-input-wrapper flex-1">
                    <span className="auth-input-icon">✉️</span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="taniya@example.com"
                      className={`auth-input ${errors.email ? "auth-input-invalid" : ""}`}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    className={`auth-btn ${isOtpVerified ? "auth-btn-success" : "auth-btn-secondary"}`}
                    onClick={isOtpVerified ? () => setIsOtpModalOpen(true) : handleSendOtp}
                    disabled={isSendingOtp || isSubmitting}
                  >
                    {isSendingOtp ? "Sending..." : isOtpVerified ? "Verified ✓" : otpSent ? "Re-enter OTP" : "Send OTP"}
                  </button>
                </div>
                {errors.email && <span className="auth-field-error">{errors.email}</span>}
                {isOtpVerified && <span className="auth-field-success">Email confirmed via 6-digit OTP token.</span>}
              </div>

              <div className="auth-field-group">
                <label htmlFor="password">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    className={`auth-input ${errors.password ? "auth-input-invalid" : ""}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {formData.password && (
                  <div className="auth-password-meter">
                    <div className="auth-meter-track">
                      <div
                        className="auth-meter-fill"
                        style={{
                          width: `${(strengthScore / 4) * 100}%`,
                          backgroundColor: strengthColors[strengthScore] || "#ccc",
                        }}
                      />
                    </div>
                    <span className="auth-meter-label" style={{ color: strengthColors[strengthScore] }}>
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>
                )}
                {errors.password && <span className="auth-field-error">{errors.password}</span>}
              </div>

              <div className="auth-field-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">🛡️</span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    className={`auth-input ${errors.confirmPassword ? "auth-input-invalid" : ""}`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
              </div>

              <button
                type="submit"
                className={`auth-btn auth-btn-primary auth-btn-full ${!isOtpVerified ? "auth-btn-disabled-hint" : ""}`}
                disabled={isSubmitting || !isOtpVerified}
              >
                {isSubmitting ? "Creating Account..." : !isOtpVerified ? "Verify Email With OTP to Enable Signup" : "Complete Account Registration"}
              </button>
            </form>

            <div className="auth-footer-prompt">
              Already registered?{" "}
              <button
                type="button"
                className="auth-link-btn"
                onClick={handleNavigateLogin}
              >
                Sign In Instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
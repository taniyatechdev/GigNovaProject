import React, { useState, useEffect, useRef } from "react";

export default function OtpModal({ isOpen, email, onVerify, onResend, onClose, isVerifying, previewOtp }) {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      setOtpDigits(["", "", "", "", "", ""]);
      setErrorMessage("");
      setCooldown(60);
      return;
    }

    // Auto-focus first input when opened
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);

    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otpDigits];
    updated[index] = value.slice(-1);
    setOtpDigits(updated);
    setErrorMessage("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const chars = pasteData.split("");
      setOtpDigits(chars);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otpDigits.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of the code.");
      return;
    }
    onVerify(code);
  };

  const handleResendClick = () => {
    if (cooldown > 0) return;
    setCooldown(60);
    setOtpDigits(["", "", "", "", "", ""]);
    setErrorMessage("");
    onResend();
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="otp-title">
      <div className="auth-modal-card">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className="auth-modal-header">
          <div className="auth-icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h3 id="otp-title">Verify Your Email</h3>
          <p>
            We have sent a 6-digit verification code to <strong>{email}</strong>.
          </p>
        </div>

        {previewOtp && (
          <div className="auth-otp-preview-banner">
            <span className="auth-otp-preview-label">Demo Simulator OTP:</span>
            <strong className="auth-otp-preview-code">{previewOtp}</strong>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-otp-form">
          <div className="auth-otp-inputs" onPaste={handlePaste}>
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="auth-otp-box"
                aria-label={`Digit ${idx + 1}`}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {errorMessage && <div className="auth-field-error text-center">{errorMessage}</div>}

          <button
            type="submit"
            className="auth-btn auth-btn-primary auth-btn-full"
            disabled={isVerifying || otpDigits.join("").length < 6}
          >
            {isVerifying ? (
              <span className="auth-spinner-container">
                <span className="auth-spinner"></span>
                <span>Verifying...</span>
              </span>
            ) : (
              "Confirm & Proceed"
            )}
          </button>
        </form>

        <div className="auth-modal-footer">
          <p>
            Didn't receive the code?{" "}
            {cooldown > 0 ? (
              <span className="auth-cooldown-text">Resend in {cooldown}s</span>
            ) : (
              <button type="button" className="auth-link-btn" onClick={handleResendClick}>
                Resend Code
              </button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
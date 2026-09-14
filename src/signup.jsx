import React, { useState } from "react";

import "./Loginsignup.css";

function Signup({ setPage }) {

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSignup = (e) => {

    e.preventDefault();

    // Check empty fields
    if (!name.trim() || !email.trim() || !password) {

      setError("Please fill all fields");

      return;

    }

    // Name validation
    if (name.trim().length < 2) {

      setError("Name must be at least 2 characters");

      return;

    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {

      setError("Please enter a valid email address");

      return;

    }

    // Password validation
    if (password.length < 8) {

      setError("Password must be at least 8 characters");

      return;

    }

    // Uppercase validation
    if (!/[A-Z]/.test(password)) {

      setError("Password must contain at least one uppercase letter");

      return;

    }

    // Lowercase validation
    if (!/[a-z]/.test(password)) {

      setError("Password must contain at least one lowercase letter");

      return;

    }

    // Digit validation
    if (!/[0-9]/.test(password)) {

      setError("Password must contain at least one digit");

      return;

    }

    // Special character validation
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]/;'`~+=]/.test(password)) {

      setError("Password must contain at least one special character");

      return;

    }

    // Check if user already exists
    const existingUser = localStorage.getItem("gignovaUser");

    if (existingUser) {

      const user = JSON.parse(existingUser);

      if (
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
      ) {

        setError("Email is already registered");

        return;

      }

    }

    // Create user
    const newUser = {

      name: name.trim(),

      email: email.trim().toLowerCase(),

      password: password

    };

    // Save user
    localStorage.setItem(
      "gignovaUser",
      JSON.stringify(newUser)
    );

    alert("Account created successfully!");

    // Clear fields
    setName("");

    setEmail("");

    setPassword("");

    setError("");

    // Go to login
    setPage("login");

  };

  return (

    <div className="auth-container">

      <div className="auth-box">

        <h2>Create Account</h2>

        <p>Join GigNova and start your journey</p>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (

            <p className="error">
              {error}
            </p>

          )}

          <button type="submit">
            Sign Up
          </button>

        </form>

        <p className="auth-switch">

          Already have an account?{" "}

          <span onClick={() => setPage("login")}>

            Login

          </span>

        </p>

      </div>

    </div>

  );

}

export default Signup;
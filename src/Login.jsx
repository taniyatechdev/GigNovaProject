import React, { useState } from "react";

import "./Loginsignup.css";

function Login({ setPage, setUser }) {

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    // Check empty fields
    if (!email.trim() || !password) {

      setError("Please fill all fields");

      return;

    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {

      setError("Please enter a valid email address");

      return;

    }

    // Password validation
    if (password.length < 6) {

      setError("Password must be at least 6 characters");

      return;

    }

    // Get saved user
    const savedUser = localStorage.getItem("gignovaUser");

    if (!savedUser) {

      setError("No account found. Please sign up first.");

      return;

    }

    const user = JSON.parse(savedUser);

    // Check email
    if (user.email !== email.trim()) {

      setError("Incorrect email or password");

      return;

    }

    // Check password
    if (user.password !== password) {

      setError("Incorrect email or password");

      return;

    }

    // Save login session
    localStorage.setItem(
      "gignovaLoggedIn",
      JSON.stringify(user)
    );

    // Update React state
    setUser(user);

    // Go to dashboard
    setPage("dashboard");

    setError("");

  };

  return (

    <div className="auth-container">

      <div className="auth-box">

        <h2>Welcome Back</h2>

        <p>Login to your GigNova account</p>

        <form onSubmit={handleLogin}>

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
            Login
          </button>

        </form>

        <p className="auth-switch">

          Don't have an account?{" "}

          <span onClick={() => setPage("signup")}>

            Sign Up

          </span>

        </p>

      </div>

    </div>

  );

}

export default Login;
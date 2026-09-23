import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SportReviveLogo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", justifyContent: "center" }}>
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke="#1a1a1a" strokeWidth="2"/>
      <path d="M8 14c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6z" fill="#1a1a1a"/>
      <path d="M14 9v10M9 14h10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    <span style={{ fontFamily: "'Bebas Neue', 'Arial Black', sans-serif", fontSize: "22px", letterSpacing: "2px", color: "#1a1a1a", fontWeight: 700 }}>
      VINISPORT
    </span>
  </div>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("If an account with that email exists, a password reset link has been sent.");
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f9fafb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}>
        <SportReviveLogo />

        <h2 style={{
          fontSize: "24px",
          fontWeight: 700,
          color: "#111827",
          textAlign: "center",
          marginBottom: "8px",
        }}>
          Forgot Password
        </h2>
        <p style={{
          fontSize: "16px",
          color: "#6b7280",
          textAlign: "center",
          marginBottom: "32px",
        }}>
          Enter your email to reset your password
        </p>

        {error && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#dc2626",
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#166534",
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
              onBlur={(e) => (e.target.style.border = "1px solid #d1d5db")}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px",
              background: isLoading ? "#9ca3af" : "#16a34a",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 600,
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              marginTop: "8px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = "#16a34a")}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          Remember your password?{" "}
          <button
            onClick={() => navigate("/signin")}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
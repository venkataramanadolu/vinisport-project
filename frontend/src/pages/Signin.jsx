import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
const GOOGLE_AUTH_URL = `${API_URL}/api/auth/google`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

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

const EyeIcon = ({ show }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
    {!show && <line x1="1" y1="1" x2="23" y2="23"/>}
  </svg>
);

const Field = ({ label, type, name, placeholder, value, onChange, error, showToggle, onToggle }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={(e) => (e.target.style.border = "1px solid #3b82f6")}
        onBlur={(e) => (e.target.style.border = error ? "1px solid #ef4444" : "1px solid #d1d5db")}
        style={{
          width: "100%",
          padding: "12px 16px",
          border: `1px solid ${error ? "#ef4444" : "#d1d5db"}`,
          borderRadius: "8px",
          fontSize: "16px",
          outline: "none",
          transition: "border-color 0.15s",
          paddingRight: showToggle ? "48px" : "16px",
        }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          <EyeIcon show={type === "text"} />
        </button>
      )}
    </div>
    {error && <p style={{ fontSize: "14px", color: "#ef4444", marginTop: "4px" }}>{error}</p>}
  </div>
);

export default function Signin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard", { replace: true });
      } else {
        setErrorMessage(data?.message || "Login failed");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
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
          Welcome back
        </h2>
        <p style={{
          fontSize: "16px",
          color: "#6b7280",
          textAlign: "center",
          marginBottom: "28px",
        }}>
          Sign in to your VINISPORT account
        </p>

        <button
          onClick={() => window.location.href = GOOGLE_AUTH_URL}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "11px",
            border: "1.5px solid #d1d5db",
            borderRadius: "8px",
            background: "#fff",
            fontSize: "14px",
            fontWeight: 500,
            color: "#374151",
            cursor: "pointer",
            marginBottom: "18px",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          <GoogleIcon /> Continue with Google
        </button>

        {errorMessage && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            fontSize: "14px",
            color: "#dc2626",
          }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
          />

          <Field
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            error={errors.password}
            showToggle
            onToggle={() => setShowPassword(!showPassword)}
          />

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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div style={{
          textAlign: "center",
          marginTop: "24px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            Sign up
          </button>
        </div>

        <div style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          <button
            onClick={() => navigate("/forgot-password")}
            style={{
              background: "none",
              border: "none",
              color: "#3b82f6",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
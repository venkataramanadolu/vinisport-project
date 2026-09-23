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

const Field = ({ label, name, type = "text", placeholder, value, onChange, error }) => (
  <div style={{ marginBottom: "16px" }}>
    <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
      {label}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "10px 12px",
        border: error ? "1.5px solid #ef4444" : "1.5px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "14px",
        color: "#111827",
        outline: "none",
        boxSizing: "border-box",
        background: "#fff",
        transition: "border 0.15s",
        cursor: "text",
      }}
      onFocus={e => (e.target.style.border = "1.5px solid #16a34a")}
      onBlur={e => (e.target.style.border = error ? "1.5px solid #ef4444" : "1.5px solid #d1d5db")}
      autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : "name"}
    />
    {error && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{error}</p>}
  </div>
);

export default function Signup() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [form, setForm] = useState({ firstName: "", middleName: "", lastName: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    
    // Check for valid email with proper domain
    const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|aol\.com|protonmail\.com|zoho\.com)$/i;
    if (!form.email.includes("@")) {
      e.email = "Enter a valid email";
    } else if (!emailRegex.test(form.email)) {
      e.email = "Please use Gmail, Yahoo, Outlook, Hotmail, iCloud, AOL, ProtonMail, or Zoho";
    }
    
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleInputChange = useCallback((name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const handleFocus = useCallback((name) => {
    setFocusedField(name);
  }, []);

  const handleBlur = useCallback((name) => {
    setFocusedField(null);
  }, []);

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    
    setIsLoading(true);
    setSuccessMessage("");
    
    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: form.firstName,
          middleName: form.middleName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          confirm: form.confirm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ submit: data.message || "Registration failed" });
        setIsLoading(false);
        return;
      }

      // Success - store token and redirect
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setSuccessMessage("Account created successfully! Redirecting...");
      
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ submit: "An error occurred. Please try again." });
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
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: "24px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      <div style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e5e7eb",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        position: "relative",
        zIndex: 1,
      }}>
        <SportReviveLogo />

        <h2 style={{ textAlign: "center", fontSize: "15px", color: "#6b7280", fontWeight: 400, marginBottom: "28px", marginTop: 0 }}>
          Create your account to get started
        </h2>

        {/* Google button */}
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
            marginBottom: "16px",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
        >
          <GoogleIcon /> Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
          <span style={{ fontSize: "12px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
        </div>

        {/* Toggle email form */}
        {!showEmailForm ? (
          <button
            onClick={() => setShowEmailForm(true)}
            style={{
              width: "100%",
              padding: "12px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "12px",
              letterSpacing: "0.3px",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
            onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
          >
            Sign up with Email
          </button>
        ) : (
          <>
            <button
              onClick={() => setShowEmailForm(false)}
              style={{
                width: "100%",
                padding: "12px",
                background: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: "16px",
              }}
            >
              Hide email sign-up
            </button>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}></p>
                
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
                First Name *
              </label>
              <input
                type="text"
                placeholder="Your first name"
                value={form.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                onFocus={() => handleFocus("firstName")}
                onBlur={() => handleBlur("firstName")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: errors.firstName ? "1.5px solid #ef4444" : focusedField === "firstName" ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  transition: "border 0.15s",
                  cursor: "text",
                }}
                autoComplete="given-name"
              />
              {errors.firstName && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.firstName}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
                Middle Name
              </label>
              <input
                type="text"
                placeholder="Your middle name (optional)"
                value={form.middleName}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
                onFocus={() => handleFocus("middleName")}
                onBlur={() => handleBlur("middleName")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: errors.middleName ? "1.5px solid #ef4444" : focusedField === "middleName" ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  transition: "border 0.15s",
                  cursor: "text",
                }}
                autoComplete="additional-name"
              />
              {errors.middleName && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.middleName}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
                Last Name *
              </label>
              <input
                type="text"
                placeholder="Your last name"
                value={form.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                onFocus={() => handleFocus("lastName")}
                onBlur={() => handleBlur("lastName")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: errors.lastName ? "1.5px solid #ef4444" : focusedField === "lastName" ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  transition: "border 0.15s",
                  cursor: "text",
                }}
                autoComplete="family-name"
              />
              {errors.lastName && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.lastName}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: errors.email ? "1.5px solid #ef4444" : focusedField === "email" ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#111827",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#fff",
                  transition: "border 0.15s",
                  cursor: "text",
                }}
                autoComplete="email"
              />
              {errors.email && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={form.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onFocus={() => handleFocus("password")}
                  onBlur={() => handleBlur("password")}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    border: errors.password ? "1.5px solid #ef4444" : focusedField === "password" ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#fff",
                    transition: "border 0.15s",
                    cursor: "text",
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeIcon show={showPassword} />
                </button>
              </div>
              {errors.password && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.password}</p>}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#374151", marginBottom: "5px" }}>
                Confirm Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={(e) => handleInputChange("confirm", e.target.value)}
                  onFocus={() => handleFocus("confirm")}
                  onBlur={() => handleBlur("confirm")}
                  style={{
                    width: "100%",
                    padding: "10px 40px 10px 12px",
                    border: errors.confirm ? "1.5px solid #ef4444" : focusedField === "confirm" ? "1.5px solid #16a34a" : "1.5px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    color: "#111827",
                    outline: "none",
                    boxSizing: "border-box",
                    background: "#fff",
                    transition: "border 0.15s",
                    cursor: "text",
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeIcon show={showConfirmPassword} />
                </button>
              </div>
              {errors.confirm && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.confirm}</p>}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "12px",
                background: isLoading ? "#9ca3af" : "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: "4px",
                transition: "background 0.15s",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => !isLoading && (e.currentTarget.style.background = "#15803d")}
              onMouseLeave={e => !isLoading && (e.currentTarget.style.background = "#16a34a")}
            >
              {isLoading ? "Creating account..." : "Sign up with Email"}
            </button>

            {successMessage && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                background: "#dcfce7",
                border: "1px solid #22c55e",
                borderRadius: "8px",
                color: "#166534",
                fontSize: "13px",
                textAlign: "center",
              }}>
                {successMessage}
              </div>
            )}

            {errors.submit && (
              <div style={{
                marginTop: "12px",
                padding: "12px",
                background: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "13px",
                textAlign: "center",
              }}>
                {errors.submit}
              </div>
            )}
          </>
        )}

        <div style={{
          textAlign: "center",
          marginTop: "16px",
          fontSize: "14px",
          color: "#6b7280",
        }}>
          Already have an account?{" "}
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

        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px", textAlign: "center" }}>
          <a href="/" style={{ fontSize: "13px", color: "#6b7280", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            ← Back to home
          </a>
        </div>
      </div>

      <p style={{
        position: "fixed", bottom: "16px",
        textAlign: "center", fontSize: "11px", color: "#9ca3af",
        width: "100%", left: 0,
      }}>
        By continuing, you agree to SportRevive's Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

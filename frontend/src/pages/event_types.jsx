import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const eventTypes = [
  {
    id: "standard-doubles-mixer",
    title: "Standard Doubles Mixer",
    accent: "#4F46E5",
    accentHover: "#4338CA",
    accentBg: "rgba(79, 70, 229, 0.04)",
    description:
      "An event where players are paired with different partners and opponents, creating a variety of competitive games within a group.\n\nOne player from each game submits the score in UBR, and all participants are notified at the end of the event to review and validate the results. This format is great for meeting new players and enjoying balanced, dynamic matchups.\n\n*Event owner has flexibility to move players around as needed.",
  },
  {
    id: "doubles-group-play",
    title: "Doubles Group Play",
    accent: "#0891B2",
    accentHover: "#0E7490",
    accentBg: "rgba(8, 145, 178, 0.04)",
    description:
      "An event where participants compete in a series of doubles games within a group. Players have full control over matchups, making it ideal for structured game sessions with friends.\n\nThis format is perfect for playing multiple games against different teams within a set time period, such as an hour or two, while rotating partners and opponents. Doubles Group Play streamlines score entry by allowing one person to manage results for the group, eliminating the need to log each game separately.",
  },
  {
    id: "rotary-doubles-mixer",
    title: "Rotary Doubles Mixer",
    accent: "#EA580C",
    accentHover: "#C2410C",
    accentBg: "rgba(234, 88, 12, 0.04)",
    description:
      "An event where players are grouped by rating and rotate partners and opponents within their group across multiple games. This format ensures balanced matchups while allowing players to compete with and against different participants throughout the event.\n\nOne player from each game submits the score in UBR, and all participants are notified at the end of the event to review and validate the results.\n\n*Event owner has limited flexibility to move players after first game.",
  },
  {
    id: "rotary-singles-mixer",
    title: "Rotary Singles Mixer",
    accent: "#7C3AED",
    accentHover: "#6D28D9",
    accentBg: "rgba(124, 58, 237, 0.04)",
    description:
      "An event where players are grouped by rating and rotate opponents within their group across multiple games. This format ensures balanced matchups while allowing players to compete against different participants throughout the event.\n\nOne player from each game submits the score in UBR, and all participants are notified at the end of the event to review and validate the results.\n\n*Event owner has limited flexibility to move players after first game.",
  },
  {
    id: "fixed-partner-rotary-doubles-mixer",
    title: "Fixed Partner Rotary Doubles Mixer",
    accent: "#059669",
    accentHover: "#047857",
    accentBg: "rgba(5, 150, 105, 0.04)",
    description:
      "An event where two players form a team and then are grouped by combined rating. They rotate playing against teams within their group across multiple games. This format ensures balanced matchups while allowing players to compete against different teams throughout the event.\n\nOne player from each game submits the score in UBR, and all participants are notified at the end of the event to review and validate the results.\n\n*Event owner has limited flexibility to move teams around before the event starts.",
  },
  {
    id: "singles-group-play",
    title: "Singles Group Play",
    accent: "#DB2777",
    accentHover: "#BE185D",
    accentBg: "rgba(219, 39, 119, 0.04)",
    description:
      "An event where participants compete in a series of one-on-one games within a group. Players have full control over matchups, making it ideal for structured game sessions with friends.\n\nThis format is perfect for playing multiple games against different opponents within a set time period, such as an hour or two, while rotating matchups. Singles Group Play streamlines score entry by allowing one person to manage results for the group, eliminating the need to log each game separately.",
  },
];

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="12" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="13" cy="13" r="6" fill="#1a1a1a" />
      <path d="M13 8v10M8 13h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span
      style={{
        fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
        fontSize: "20px",
        letterSpacing: "2px",
        color: "#1a1a1a",
        fontWeight: 700,
      }}
    >
      VINISPORT
    </span>
  </div>
);

export default function EventTypes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async (token) => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.user) {
          throw new Error(data?.message || "Failed to fetch user details");
        }

        setUser(data.user);
      } catch {
        localStorage.removeItem("token");
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
      return;
    }

    fetchCurrentUser(token);
  }, [navigate]);

  const handleSelectEventType = (eventTypeId) => {
    navigate(`/dashboard?view=createLeague&eventType=${eventTypeId}`);
  };

  const openModal = useCallback((eventType) => {
    setSelectedEvent(eventType);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!selectedEvent) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, closeModal]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEvent]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f9fafb",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Styles */}
      <style>{`
        /* ── Event cards (title-only list) ── */
        .event-card {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.04);
          border: 1px solid #E2E8F0;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: box-shadow 0.22s ease, transform 0.18s ease, border-color 0.22s ease;
          padding: 0;
          text-align: left;
          width: 100%;
          font-family: inherit;
        }
        .event-card:hover {
          box-shadow: 0 4px 18px rgba(0,0,0,0.09), 0 8px 32px rgba(0,0,0,0.06);
          transform: translateY(-2px);
        }
        .event-card:focus-visible {
          outline: 2px solid #4F46E5;
          outline-offset: 2px;
        }
        .event-card-inner {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 20px 24px 20px 0;
        }
        .event-card-accent-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          border-radius: 14px 0 0 14px;
        }
        .event-card-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          opacity: 0.7;
          flex-shrink: 0;
          margin-left: 32px;
          margin-right: 14px;
        }
        .event-card-title-text {
          flex: 1;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.3;
          margin: 0;
        }
        .event-card-arrow {
          font-size: 18px;
          opacity: 0.5;
          margin-left: 12px;
          transition: transform 0.18s ease, opacity 0.18s ease;
          flex-shrink: 0;
        }
        .event-card:hover .event-card-arrow {
          transform: translateX(4px);
          opacity: 0.85;
        }
        .event-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }

        /* ── Modal overlay ── */
        .event-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
          box-sizing: border-box;
          animation: et-fade-in 0.18s ease;
        }
        @keyframes et-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Modal box ── */
        .event-modal {
          background: white;
          border-radius: 18px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.10);
          max-width: 560px;
          width: 100%;
          position: relative;
          overflow: hidden;
          animation: et-slide-up 0.22s ease;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        @keyframes et-slide-up {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .event-modal-accent-bar {
          height: 5px;
          width: 100%;
          flex-shrink: 0;
        }
        .event-modal-body {
          padding: 28px 32px 32px 32px;
          overflow-y: auto;
          flex: 1;
        }
        .event-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #6b7280;
          transition: background 0.15s, color 0.15s;
          flex-shrink: 0;
          line-height: 1;
        }
        .event-modal-close:hover {
          background: #e5e7eb;
          color: #111827;
        }
        .event-modal-close:focus-visible {
          outline: 2px solid #4F46E5;
          outline-offset: 2px;
        }
        .event-modal-title {
          font-family: 'Bebas Neue', 'Arial Black', sans-serif;
          font-size: 26px;
          letter-spacing: 1.5px;
          margin: 0 0 20px 0;
          line-height: 1.15;
          padding-right: 40px;
        }
        .event-modal-desc p {
          font-size: 14px;
          color: #475569;
          line-height: 1.7;
          margin: 0 0 12px 0;
        }
        .event-modal-desc p:last-child {
          margin-bottom: 0;
        }
        .event-modal-desc p.italic {
          font-style: italic;
          color: #64748b;
        }
        .event-modal-btn {
          display: block;
          margin-top: 28px;
          padding: 12px 24px;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.2px;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          width: 100%;
        }
        .event-modal-btn:hover {
          transform: translateY(-1px);
        }
        .event-modal-btn:active {
          transform: scale(0.98);
        }
        .event-modal-btn:focus-visible {
          outline: 2px solid rgba(255,255,255,0.7);
          outline-offset: 2px;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .event-page-content {
            padding: 24px 16px !important;
          }
          .event-page-nav {
            padding: 14px 16px !important;
          }
          .event-card-dot {
            margin-left: 20px;
          }
          .event-card-inner {
            padding: 18px 20px 18px 0;
          }
          .event-modal-body {
            padding: 24px 20px 28px 20px;
          }
          .event-modal-title {
            font-size: 22px;
          }
        }
      `}</style>

      {/* Navbar — matches Dashboard nav */}
      <nav
        className="event-page-nav"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 48px",
          borderBottom: "1px solid #f1f5f9",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 10,
        }}
      >
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user && (
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              Welcome, {user.firstName}!
            </span>
          )}
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 16px",
              background: "#111827",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              color: "white",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#374151")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#111827")}
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Content */}
      <div
        className="event-page-content"
        style={{
          flex: 1,
          padding: "40px 48px",
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div className="event-page-header">
          <div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                marginTop: 0,
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}
            >
              Create an Event
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Choose the type of event you want to organize.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "10px 16px",
              background: "#f3f4f6",
              color: "#111827",
              border: "1px solid #e5e7eb",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Event Type Cards — title only */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {eventTypes.map((eventType) => (
            <button
              key={eventType.id}
              type="button"
              className="event-card"
              aria-haspopup="dialog"
              style={{
                background: eventType.accentBg,
                borderColor: "#E2E8F0",
              }}
              onClick={() => openModal(eventType)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = eventType.accent + "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              {/* Left accent bar */}
              <div
                className="event-card-accent-bar"
                style={{ background: eventType.accent }}
              />

              <div className="event-card-inner">
                {/* Accent dot */}
                <div
                  className="event-card-dot"
                  style={{ background: eventType.accent }}
                />

                {/* Title */}
                <h2
                  className="event-card-title-text"
                  style={{ color: eventType.accent }}
                >
                  {eventType.title}
                </h2>

                {/* Arrow */}
                <span
                  className="event-card-arrow"
                  style={{ color: eventType.accent }}
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="event-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="event-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="event-modal">
            {/* Top accent bar */}
            <div
              className="event-modal-accent-bar"
              style={{ background: selectedEvent.accent }}
            />

            {/* Close button */}
            <button
              type="button"
              className="event-modal-close"
              onClick={closeModal}
              aria-label="Close"
            >
              ✕
            </button>

            {/* Body */}
            <div className="event-modal-body">
              <h2
                id="event-modal-title"
                className="event-modal-title"
                style={{ color: selectedEvent.accent }}
              >
                {selectedEvent.title.toUpperCase()}
              </h2>

              <div className="event-modal-desc">
                {selectedEvent.description.split("\n\n").map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={paragraph.startsWith("*") ? "italic" : ""}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <button
                type="button"
                className="event-modal-btn"
                onClick={() => handleSelectEventType(selectedEvent.id)}
                style={{
                  background: selectedEvent.accent,
                  boxShadow: `0 4px 14px ${selectedEvent.accent}40`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = selectedEvent.accentHover;
                  e.currentTarget.style.boxShadow = `0 6px 18px ${selectedEvent.accent}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = selectedEvent.accent;
                  e.currentTarget.style.boxShadow = `0 4px 14px ${selectedEvent.accent}40`;
                }}
              >
                Create New Event →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

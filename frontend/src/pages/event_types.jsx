import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

      {/* Responsive styles */}
      <style>{`
        .event-card {
          display: flex;
          flex-direction: row;
          align-items: center;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 2px 12px rgba(0, 0, 0, 0.04);
          padding: 28px 32px 28px 0;
          transition: box-shadow 0.25s ease, transform 0.2s ease, border-color 0.25s ease;
          border: 1px solid #E2E8F0;
          position: relative;
          overflow: hidden;
        }
        .event-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 8px 32px rgba(0, 0, 0, 0.06);
          transform: translateY(-2px);
        }
        .event-card-title {
          width: 22%;
          min-width: 160px;
          padding-right: 24px;
          padding-left: 32px;
          flex-shrink: 0;
        }
        .event-card-desc {
          flex: 1;
          padding-right: 24px;
          min-width: 0;
        }
        .event-card-action {
          width: 18%;
          min-width: 160px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .event-card-btn {
          padding: 10px 20px;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          letter-spacing: 0.2px;
        }
        .event-card-btn:hover {
          transform: scale(1.03);
        }
        .event-card-btn:active {
          transform: scale(0.98);
        }
        .event-page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 32px;
        }
        @media (max-width: 768px) {
          .event-card {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px 20px 20px 0;
            gap: 16px;
          }
          .event-card-title {
            width: 100%;
            min-width: 0;
            padding-right: 20px;
            padding-left: 28px;
            padding-bottom: 4px;
            border-bottom: 1px solid #f3f4f6;
          }
          .event-card-desc {
            padding-right: 20px;
            padding-left: 28px;
            width: 100%;
            box-sizing: border-box;
          }
          .event-card-action {
            width: 100%;
            min-width: 0;
            justify-content: flex-start;
            padding-left: 28px;
          }
          .event-page-content {
            padding: 24px 16px !important;
          }
          .event-page-nav {
            padding: 14px 16px !important;
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

        {/* Event Type Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {eventTypes.map((eventType) => (
            <div
              key={eventType.id}
              className="event-card"
              style={{
                background: eventType.accentBg,
                borderColor: undefined,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = eventType.accent + "40";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E2E8F0";
              }}
            >
              {/* Left accent bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "5px",
                  background: eventType.accent,
                  borderRadius: "16px 0 0 16px",
                }}
              />

              {/* Section 1: Title */}
              <div className="event-card-title">
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: eventType.accent,
                    marginBottom: "8px",
                    opacity: 0.7,
                  }}
                />
                <h2
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: eventType.accent,
                    margin: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {eventType.title}
                </h2>
              </div>

              {/* Section 2: Description */}
              <div className="event-card-desc">
                {eventType.description.split("\n\n").map((paragraph, idx) => (
                  <p
                    key={idx}
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      lineHeight: 1.6,
                      margin: idx === 0 ? "0 0 8px 0" : "8px 0",
                      fontStyle: paragraph.startsWith("*") ? "italic" : "normal",
                    }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Section 3: Action */}
              <div className="event-card-action">
                <button
                  type="button"
                  className="event-card-btn"
                  onClick={() => handleSelectEventType(eventType.id)}
                  style={{
                    background: eventType.accent,
                    boxShadow: `0 2px 8px ${eventType.accent}30`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = eventType.accentHover;
                    e.currentTarget.style.boxShadow = `0 4px 14px ${eventType.accent}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = eventType.accent;
                    e.currentTarget.style.boxShadow = `0 2px 8px ${eventType.accent}30`;
                  }}
                >
                  Create New Event →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

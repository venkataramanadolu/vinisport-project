import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
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

export default function PlayerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlayerProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_URL}/api/players/profile/${id}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load player profile");
        }

        setPlayer(data.player);
      } catch (err) {
        setError(err.message || "Failed to load player profile");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlayerProfile();
    }
  }, [id]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        color: "#1e293b",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      {/* Header Bar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 40px",
          borderBottom: "1px solid #e2e8f0",
          background: "white",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div onClick={() => navigate("/dashboard")}>
          <Logo />
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "8px 16px",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#334155",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e2e8f0")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f5f9")}
        >
          ← Back
        </button>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: "1000px", margin: "32px auto", padding: "0 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#64748b" }}>
            <div style={{ fontSize: "16px", fontWeight: 500 }}>Loading player profile...</div>
          </div>
        ) : error ? (
          <div
            style={{
              padding: "20px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "12px",
              color: "#991b1b",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        ) : player ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header Profile Card */}
            <div
              style={{
                background: "#0f172a",
                borderRadius: "16px",
                padding: "32px",
                color: "white",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#1e293b",
                    border: "3px solid #16a34a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "white",
                  }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "36px",
                      letterSpacing: "1px",
                      margin: 0,
                      lineHeight: 1.1,
                    }}
                  >
                    {player.name}
                  </h1>
                  <div style={{ fontSize: "14px", color: "#94a3b8", marginTop: "4px" }}>
                    🏢 {player.club} · 📍 {player.city || "Hyderabad"}, {player.country || "India"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#22c55e", fontWeight: 600, marginTop: "6px" }}>
                    🏸 Primary Sport: {player.interestedSport || "Badminton"}
                  </div>
                </div>
              </div>

              {/* Quick Stat Pill */}
              <div
                style={{
                  background: "#1e293b",
                  borderRadius: "12px",
                  padding: "16px 24px",
                  textAlign: "center",
                  minWidth: "140px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Rating
                </div>
                <div style={{ fontSize: "36px", fontWeight: 800, color: "#f59e0b", fontFamily: "'Bebas Neue', sans-serif" }}>
                  {player.rating}
                </div>
                <div style={{ fontSize: "11px", color: "#22c55e" }}>Official UBR Rating</div>
              </div>
            </div>

            {/* Performance Stats Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Games Played
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", marginTop: "4px" }}>
                  {player.gamesPlayed}
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Wins
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a", marginTop: "4px" }}>
                  {player.wins}
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Losses
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#ef4444", marginTop: "4px" }}>
                  {player.losses}
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
                  Win Percentage
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#3b82f6", marginTop: "4px" }}>
                  {player.winRate}%
                </div>
              </div>
            </div>

            {/* Additional Info & Joined Leagues */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "24px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "22px",
                    letterSpacing: "0.5px",
                    margin: "0 0 16px 0",
                    color: "#0f172a",
                  }}
                >
                  Registered Leagues & Tournaments
                </h3>

                {player.leagues && player.leagues.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {player.leagues.map((l) => (
                      <div
                        key={l.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px 16px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>{l.leagueName}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>
                            Sport: {l.sport} · Format: {l.type}
                          </div>
                        </div>
                        <span
                          style={{
                            padding: "4px 10px",
                            background: "#dcfce7",
                            color: "#15803d",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 600,
                          }}
                        >
                          Active Participant
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    Currently registered in standard practice leagues.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

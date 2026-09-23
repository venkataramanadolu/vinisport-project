import React, { useEffect, useState } from "react";
import { SPORTS_CONFIG } from "../config/sports";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export default function SportStatsSection({ token }) {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSportStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/dashboard/sport-stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setSports(data.sports || []);
        } else {
          setError(data.message || "Failed to load sport statistics");
        }
      } catch (err) {
        console.error("Sport stats fetch error:", err);
        setError("Error connecting to server to load sport statistics");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSportStats();
    }
  }, [token]);

  const getSportIcon = (sportName) => {
    const normalized = sportName.toLowerCase();
    const config = SPORTS_CONFIG.find(s => s.name.toLowerCase() === normalized || s.slug === normalized);
    return config ? config.icon : "🏅";
  };

  const getSportDisplayName = (sportName) => {
    return sportName
      .split("-")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
        <div style={{ fontSize: "14px" }}>Loading sport-wise stats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: "center",
        padding: "32px",
        background: "#fef2f2",
        borderRadius: "12px",
        border: "1px solid #fecaca",
        marginTop: "32px"
      }}>
        <div style={{ fontSize: "14px", color: "#dc2626" }}>
          {error}
        </div>
      </div>
    );
  }

  if (sports.length === 0) {
    return null; // Don't show anything if user has no enrolled sports
  }

  return (
    <div style={{ marginTop: "32px" }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: 700,
        color: "#111827",
        marginBottom: "20px",
        fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
        letterSpacing: "0.5px"
      }}>
        Sport-Wise Statistics
      </h2>
      
      <div style={{
        display: "grid",
        gap: "24px",
      }}>
        {sports.map((stat, idx) => (
          <div key={idx} style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            padding: "24px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #f1f5f9"
            }}>
              <div style={{
                background: "#f3f4f6",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px"
              }}>
                {getSportIcon(stat.sport)}
              </div>
              <h3 style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#1f2937",
                margin: 0,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}>
                {getSportDisplayName(stat.sport)} STATS
              </h3>
            </div>

            {/* League and Club Badges */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "24px"
            }}>
              {/* Leagues */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563", marginTop: "3px" }}>League:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
                  {(!stat.leagues || stat.leagues.length === 0) ? (
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#6b7280",
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb"
                    }}>No League</span>
                  ) : (
                    stat.leagues.map((l, i) => (
                      <span key={i} style={{
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#0369a1",
                        background: "#f0f9ff",
                        border: "1px solid #bae6fd",
                        wordBreak: "break-word"
                      }}>{l.name}</span>
                    ))
                  )}
                </div>
              </div>

              {/* Clubs */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                flexWrap: "wrap"
              }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#4b5563", marginTop: "3px" }}>Club:</span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", flex: 1 }}>
                  {(!stat.clubs || stat.clubs.length === 0) ? (
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#6b7280",
                      background: "#f3f4f6",
                      border: "1px solid #e5e7eb"
                    }}>No Club</span>
                  ) : (
                    stat.clubs.map((c, i) => (
                      <span key={i} style={{
                        padding: "4px 12px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#86198f",
                        background: "#fdf4ff",
                        border: "1px solid #f5d0fe",
                        wordBreak: "break-word"
                      }}>{c.name}</span>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
            }}>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>GAMES PLAYED</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#2563eb" }}>{stat.gamesPlayed}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>WINS</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#16a34a" }}>{stat.wins}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>LOSSES</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#ef4444" }}>{stat.losses}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>WIN RATE</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#f59e0b" }}>{stat.winRate}%</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>CURRENT RATING</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#8b5cf6" }}>{stat.rating}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginBottom: "4px" }}>LEAGUES JOINED</div>
                <div style={{ fontSize: "24px", fontWeight: 800, color: "#0ea5e9" }}>{stat.leaguesJoined}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

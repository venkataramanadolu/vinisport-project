import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SPORTS_CONFIG, getSportBySlug } from "../config/sports";

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

export default function Leaderboard() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSport, setSelectedSport] = useState("badminton");
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);

  const [players, setPlayers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 25;

  const activeSportConfig = getSportBySlug(selectedSport) || SPORTS_CONFIG[0];

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data?.success && data?.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch user context for leaderboard highlight");
      }
    };
    fetchUser();
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("sport", selectedSport);
      params.append("sortBy", "rating");
      params.append("sortOrder", "desc");
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());

      const response = await fetch(`${API_URL}/api/players?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      setPlayers(data.players || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      setError(err.message || "Unable to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedSport, currentPage]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const getRankMedal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return <span style={{ opacity: 0.6 }}>#{rank}</span>;
  };

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

      {/* Header Navigation Bar */}
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
          zIndex: 50,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div onClick={() => navigate("/dashboard")} style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Logo />
          <div style={{
            height: "24px",
            width: "1px",
            background: "#e2e8f0"
          }}></div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#64748b", cursor: "pointer" }} onClick={(e) => {
            e.stopPropagation();
            navigate("/dashboard");
          }}>
            ← Back to Dashboard
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSportsDropdown(!showSportsDropdown)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: "#0f172a",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#0f172a")}
            >
              <span>{activeSportConfig?.icon || "🏆"}</span>
              <span>{activeSportConfig?.name || "Sport"}</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>▼</span>
            </button>

            {showSportsDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "44px",
                  right: 0,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
                  padding: "8px 0",
                  minWidth: "180px",
                  zIndex: 100,
                }}
              >
                {SPORTS_CONFIG.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSport(s.slug);
                      setCurrentPage(1);
                      setShowSportsDropdown(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      background: selectedSport === s.slug ? "#f1f5f9" : "transparent",
                      border: "none",
                      color: selectedSport === s.slug ? "#2563eb" : "#334155",
                      fontSize: "14px",
                      fontWeight: selectedSport === s.slug ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedSport !== s.slug) e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (selectedSport !== s.slug) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "24px" }}>
          <div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "42px",
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {activeSportConfig?.name} Leaderboard
            </h1>
            <p style={{ color: "#64748b", margin: "8px 0 0 0", fontSize: "16px" }}>
              Top players ranked by their current rating.
            </p>
          </div>
          <div style={{ color: "#64748b", fontSize: "14px", fontWeight: 500 }}>
            Showing {totalCount > 0 ? (currentPage - 1) * limit + 1 : 0} - {Math.min(currentPage * limit, totalCount)} of {totalCount} players
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "24px", marginBottom: "16px" }}>⏳</div>
              <p>Loading leaderboard...</p>
            </div>
          ) : error ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>⚠️</div>
              <p style={{ color: "#ef4444", fontWeight: 600, marginBottom: "16px" }}>{error}</p>
              <button
                onClick={fetchLeaderboard}
                style={{
                  padding: "8px 16px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Try Again
              </button>
            </div>
          ) : players.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>📭</div>
              <p>No players found for this sport.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", whiteSpace: "nowrap" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Rank</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Player</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Rating</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>Matches</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", textAlign: "center" }}>W / L</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Win Rate</th>
                    <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Club</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => {
                    const rank = (currentPage - 1) * limit + index + 1;
                    const isCurrentUser = currentUser && currentUser._id === player._id;
                    const totalGames = player.gamesPlayed || 0;
                    const wins = player.wins || 0;
                    const losses = player.losses || 0;
                    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

                    return (
                      <tr
                        key={player._id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: isCurrentUser ? "#fffbeb" : "white",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrentUser) e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrentUser) e.currentTarget.style.background = "white";
                        }}
                      >
                        <td style={{ padding: "16px 24px", fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                          {getRankMedal(rank)}
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <Link
                            to={`/players/profile/${player._id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "#e2e8f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                color: "#64748b",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              {player.profilePhoto ? (
                                <img src={player.profilePhoto} alt={player.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                (player.fullName || "U")[0].toUpperCase()
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                                {player.fullName || "Unknown Player"}
                                {isCurrentUser && (
                                  <span style={{ fontSize: "11px", background: "#fef08a", color: "#854d0e", padding: "2px 6px", borderRadius: "4px", fontWeight: 700 }}>YOU</span>
                                )}
                              </div>
                              {player.city && (
                                <div style={{ fontSize: "13px", color: "#64748b" }}>
                                  {player.city}{player.state ? `, ${player.state}` : ""}
                                </div>
                              )}
                            </div>
                          </Link>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "99px", fontWeight: 700, fontSize: "14px" }}>
                            {player.rating || 0}
                          </span>
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "center", fontWeight: 600, color: "#334155" }}>
                          {totalGames}
                        </td>
                        <td style={{ padding: "16px 24px", textAlign: "center", fontSize: "14px", color: "#64748b" }}>
                          <span style={{ color: "#16a34a", fontWeight: 600 }}>{wins}</span> / <span style={{ color: "#ef4444", fontWeight: 600 }}>{losses}</span>
                        </td>
                        <td style={{ padding: "16px 24px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ fontWeight: 600, color: "#334155", width: "40px" }}>
                              {winRate}%
                            </div>
                            <div style={{ height: "6px", width: "60px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${winRate}%`, background: winRate >= 50 ? "#16a34a" : "#f59e0b", borderRadius: "3px" }}></div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "16px 24px", color: "#475569", fontSize: "14px" }}>
                          {player.club || <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "32px" }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "8px 16px",
                background: currentPage === 1 ? "#f1f5f9" : "white",
                color: currentPage === 1 ? "#94a3b8" : "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              Page <span style={{ color: "#0f172a", fontWeight: 700 }}>{currentPage}</span> of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "8px 16px",
                background: currentPage === totalPages ? "#f1f5f9" : "white",
                color: currentPage === totalPages ? "#94a3b8" : "#0f172a",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: 600,
                transition: "all 0.15s",
              }}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

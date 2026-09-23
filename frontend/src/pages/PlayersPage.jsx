import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { SPORTS_CONFIG, getSportBySlug, getTypeCodeForSport } from "../config/sports";

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

export default function PlayersPage() {
  const { sport: urlSport } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active sport from URL params (defaults to badminton)
  const currentSportSlug = urlSport || "badminton";
  const activeSport = getSportBySlug(currentSportSlug);

  // States
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'club' | 'league'
  const [selectedClub, setSelectedClub] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("rating"); // 'rating' | 'gamesPlayed' | 'name'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);

  // Data states
  const [players, setPlayers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dropdown options
  const [clubsList, setClubsList] = useState([]);
  const [leaguesList, setLeaguesList] = useState([]);
  const [showSportsDropdown, setShowSportsDropdown] = useState(false);

  // Fetch Clubs and Leagues for current sport & selected league
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const clubParams = new URLSearchParams();
        clubParams.append("sport", currentSportSlug);
        if (selectedLeague && selectedLeague !== "all") {
          clubParams.append("league", selectedLeague);
        }

        const [clubsRes, leaguesRes] = await Promise.all([
          fetch(`${API_URL}/api/players/clubs?${clubParams.toString()}`),
          fetch(`${API_URL}/api/players/leagues?sport=${currentSportSlug}`),
        ]);

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          if (clubsData.clubs) setClubsList(clubsData.clubs);
        }

        if (leaguesRes.ok) {
          const leaguesData = await leaguesRes.json();
          if (leaguesData.leagues) setLeaguesList(leaguesData.leagues);
        }
      } catch (err) {
        console.error("Error loading filter dropdown options:", err);
      }
    };

    fetchFilterOptions();
  }, [currentSportSlug, selectedLeague]);

  // Main fetch function for player records
  const fetchPlayersData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.append("sport", currentSportSlug);
      params.append("page", currentPage.toString());
      params.append("limit", "25");
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const trimmedSearch = searchQuery.trim();
      if (trimmedSearch) {
        params.append("search", trimmedSearch);
      }

      if (activeTab === "club" && selectedClub !== "all") {
        params.append("club", selectedClub);
      }

      if (activeTab === "league" && selectedLeague !== "all") {
        params.append("league", selectedLeague);
      }

      const response = await fetch(`${API_URL}/api/players?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch players data");
      }

      setPlayers(data.players || []);
      setTotalCount(data.count || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Failed to load players");
    } finally {
      setLoading(false);
    }
  }, [currentSportSlug, activeTab, selectedClub, selectedLeague, searchQuery, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchPlayersData();
  }, [fetchPlayersData]);

  // Tab switcher handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    if (tab === "all") {
      setSelectedClub("all");
      setSelectedLeague("all");
    }
  };

  // Sort handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
    setCurrentPage(1);
  };

  // Render sort arrows
  const getSortIcon = (field) => {
    if (sortBy !== field) return " ↕";
    return sortOrder === "asc" ? " ↑" : " ↓";
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
        <div onClick={() => navigate("/dashboard")}>
          <Logo />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {/* Header Navigation Item with Dropdown */}
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
              <span>Sports</span>
              <span style={{ fontSize: "11px", opacity: 0.8 }}>▼</span>
            </button>

            {/* Centralized Sports Configuration Dropdown */}
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
                      setShowSportsDropdown(false);
                      setCurrentPage(1);
                      navigate(`/players/${s.slug}`);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      background: s.slug === currentSportSlug ? "#f1f5f9" : "transparent",
                      color: s.slug === currentSportSlug ? "#16a34a" : "#334155",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: s.slug === currentSportSlug ? 700 : 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      s.slug === currentSportSlug ? "#f1f5f9" : "transparent")
                    }
                  >
                    <span>{s.icon}</span>
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "8px 16px",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Dashboard
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div style={{ maxWidth: "1140px", margin: "32px auto", padding: "0 24px" }}>

        {/* Breadcrumb & Title Section */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500, marginBottom: "4px" }}>
            Players &gt; <span style={{ color: "#16a34a", fontWeight: 600 }}>{activeSport.name}</span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                fontSize: "36px",
                letterSpacing: "1px",
                margin: 0,
                color: "#0f172a",
                lineHeight: 1.1,
              }}
            >
              {activeSport.icon} {activeSport.name} Players{" "}
              <span style={{ fontSize: "24px", color: "#64748b", fontWeight: 600 }}>
                ({totalCount})
              </span>
            </h1>
          </div>
        </div>

        {/* Filter Bar Card */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "20px 24px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            marginBottom: "24px",
          }}
        >
          {/* Tabs and Sub-filters Row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: "inline-flex",
                background: "#f1f5f9",
                padding: "4px",
                borderRadius: "10px",
              }}
            >
              {[
                { id: "all", label: "All Players" },
                { id: "club", label: "By Club" },
                { id: "league", label: "By League" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    style={{
                      padding: "8px 18px",
                      border: "none",
                      borderRadius: "8px",
                      background: isActive ? "white" : "transparent",
                      color: isActive ? "#0f172a" : "#64748b",
                      fontSize: "14px",
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Contextual Sub-selectors */}
            {activeTab === "club" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Select Club:</span>
                <select
                  value={selectedClub}
                  onChange={(e) => {
                    setSelectedClub(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "14px",
                    background: "white",
                    fontWeight: 500,
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="all">All Clubs</option>
                  {clubsList.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === "league" && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Select League:</span>
                  <select
                    value={selectedLeague}
                    onChange={(e) => {
                      setSelectedLeague(e.target.value);
                      setSelectedClub("all");
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      background: "white",
                      fontWeight: 500,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="all">All Leagues</option>
                    {leaguesList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.leagueName} ({l.playerCount} players)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLeague !== "all" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#475569" }}>Filter Club:</span>
                    <select
                      value={selectedClub}
                      onChange={(e) => {
                        setSelectedClub(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid #16a34a",
                        fontSize: "14px",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        fontWeight: 600,
                        cursor: "pointer",
                        outline: "none",
                      }}
                    >
                      <option value="all">All Clubs in League</option>
                      {clubsList.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Search Players by Name, Email, or Club Name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "100%",
                padding: "12px 16px 12px 40px",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
              onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
            />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Players Data Table */}
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
            <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>
              <div style={{ fontSize: "16px", fontWeight: 500 }}>Loading players directory...</div>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#ef4444" }}>{error}</div>
          ) : players.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "#64748b" }}>
              <div style={{ fontSize: "18px", fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>
                No registered players found
              </div>
              <div style={{ fontSize: "14px" }}>Try adjusting your search query or filter options.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      color: "#475569",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <th style={{ padding: "14px 20px" }}>#</th>
                    <th
                      onClick={() => handleSort("name")}
                      style={{ padding: "14px 20px", cursor: "pointer", userSelect: "none" }}
                    >
                      Player Name{getSortIcon("name")}
                    </th>
                    <th style={{ padding: "14px 20px" }}>Type</th>
                    <th
                      onClick={() => handleSort("gamesPlayed")}
                      style={{ padding: "14px 20px", cursor: "pointer", userSelect: "none" }}
                    >
                      <div className=" flex align-items-center">Games Played<span style={{ marginLeft: "4px" }}>{getSortIcon("gamesPlayed")}</span></div>
                    </th>
                    <th style={{ padding: "14px 20px" }}>Wins</th>
                    <th style={{ padding: "14px 20px" }}>Losses</th>
                    <th style={{ padding: "14px 20px" }}>Club</th>
                    <th style={{ padding: "14px 20px" }}>League</th>
                    <th
                      onClick={() => handleSort("rating")}
                      style={{ padding: "14px 20px", cursor: "pointer", userSelect: "none", width: 'auto' }}
                    >
                      Rating{getSortIcon("rating")}
                    </th>
                    {/* <th style={{ padding: "14px 20px" }}>Join Date</th> */}
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                    >
                      <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 700, color: "#94a3b8" }}>
                        {p.rank}
                      </td>

                      {/* Name with link to profile */}
                      <td style={{ padding: "16px 20px" }}>
                        <div
                          onClick={() => navigate(`/players/profile/${p.id}`)}
                          style={{
                            fontWeight: 700,
                            color: "#1e293b",
                            fontSize: "15px",
                            cursor: "pointer",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#16a34a")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "#1e293b")}
                        >
                          {p.name}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{p.email}</div>
                      </td>
                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#475569", fontWeight: 600 }}>
                        {p.typeCode || p.type || getTypeCodeForSport(p.interestedSport || p.sport) || (activeSport && activeSport.code) || "N/A"}
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 600, color: "#334155" }}>
                        {p.gamesPlayed}
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 700, color: "#16a34a" }}>
                        {p.wins}
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "14px", fontWeight: 700, color: "#ef4444" }}>
                        {p.losses}
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "14px", color: "#475569" }}>
                        {p.club}
                      </td>

                      <td style={{ padding: "16px 20px", fontSize: "13px", color: "#64748b" }}>
                        {p.league}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            background: "#fef3c7",
                            color: "#b45309",
                            borderRadius: "12px",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          {p.rating}
                        </span>
                      </td>

                      {/* <td style={{ padding: "16px 20px", fontSize: "13px", color: "#94a3b8" }}>
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A"}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && players.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #e2e8f0",
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              <div>
                Showing <strong>{(currentPage - 1) * 25 + 1}</strong> to{" "}
                <strong>{Math.min(currentPage * 25, totalCount)}</strong> of <strong>{totalCount}</strong> players
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: currentPage === 1 ? "#f1f5f9" : "white",
                    color: currentPage === 1 ? "#94a3b8" : "#334155",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Previous
                </button>

                <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    background: currentPage >= totalPages ? "#f1f5f9" : "white",
                    color: currentPage >= totalPages ? "#94a3b8" : "#334155",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

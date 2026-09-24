import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Country, State } from "country-state-city";
import { SPORTS_CONFIG } from "../config/sports";
import SportStatsSection from "../components/SportStatsSection";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <circle cx="13" cy="13" r="12" stroke="#1a1a1a" strokeWidth="2" />
      <circle cx="13" cy="13" r="6" fill="#1a1a1a" />
      <path d="M13 8v10M8 13h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span style={{
      fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
      fontSize: "20px",
      letterSpacing: "2px",
      color: "#1a1a1a",
      fontWeight: 700,
    }}>VINISPORT</span>
  </div>
);

const SPORT_SKILLS_CONFIG = {
  volleyball: [
    { key: "serving", label: "Serving" },
    { key: "passing", label: "Passing" },
    { key: "setting", label: "Setting" },
    { key: "spiking", label: "Spiking" },
    { key: "blocking", label: "Blocking" },
    { key: "receiving", label: "Receiving" },
    { key: "attacking", label: "Attacking" },
    { key: "defense", label: "Defense" },
    { key: "footwork", label: "Footwork" },
    { key: "courtAwareness", label: "Court Awareness" },
  ],
  cricket: [
    { key: "batting", label: "Batting" },
    { key: "bowling", label: "Bowling" },
    { key: "fielding", label: "Fielding" },
    { key: "catching", label: "Catching" },
    { key: "throwing", label: "Throwing" },
    { key: "runningBetweenWickets", label: "Running Between Wickets" },
    { key: "battingTechnique", label: "Batting Technique" },
    { key: "bowlingAccuracy", label: "Bowling Accuracy" },
    { key: "gameAwareness", label: "Game Awareness" },
    { key: "fitness", label: "Fitness" },
  ],
  tennis: [
    { key: "forehand", label: "Forehand" },
    { key: "backhand", label: "Backhand" },
    { key: "serve", label: "Serve" },
    { key: "returnOfServe", label: "Return of Serve" },
    { key: "volley", label: "Volley" },
    { key: "smash", label: "Smash" },
    { key: "dropShot", label: "Drop Shot" },
    { key: "lob", label: "Lob" },
    { key: "footwork", label: "Footwork" },
    { key: "courtAwareness", label: "Court Awareness" },
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPlayersDropdown, setShowPlayersDropdown] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [leagueDetails, setLeagueDetails] = useState({
    leagueName: "",
    sport: "badminton",
    type: "single",
    numberOfCourts: "1",
    matchDurationMinutes: "",
    maximumTeams: "",
    registrationStartDate: "",
    registrationEndDate: "",
    tournamentStartDate: "",
    tournamentEndDate: "",
    entryFee: "",
  });
  const [leagues, setLeagues] = useState([]);
  const [leagueError, setLeagueError] = useState("");
  const [joiningLeagueId, setJoiningLeagueId] = useState("");
  const [selectedEventType, setSelectedEventType] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");
  const [dashboardStats, setDashboardStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [sportsSkills, setSportsSkills] = useState({});
  const [selectedSports, setSelectedSports] = useState([]);
  const [skillsUpdateSuccess, setSkillsUpdateSuccess] = useState("");
  const [skillsUpdateError, setSkillsUpdateError] = useState("");
  const [profileDetails, setProfileDetails] = useState({
    fullName: "",
    gender: "",
    dob: "",
    age: "",
    mobileNumber: "",
    city: "",
    state: "",
    country: "",
    interestedSport: "",
    experience: "",
    socialMediaLinks: "",
    profilePhoto: null,
    profilePhotoPreview: "",
  });
  const options = [

    "This event is public and anyone can sign up through UBR",
    "Players must register with organizer directly",
    "Automatically open checkin 30 minutes before event starts",
    "Players that sign up/check in when event is at capacity are placed on the waiting list",
    "All games in this event will be unrated",
    "Fully mixed mixer (matchups ignore ratings, anyone can be paired with anyone)",

  ]
  const countryOptions = Country.getAllCountries();
  const stateOptions = profileDetails.country
    ? State.getStatesOfCountry(profileDetails.country)
    : [];

  const toTitleCase = (value) => String(value || "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const mapUserToProfileDetails = (incomingUser) => {
    const matchedCountry = countryOptions.find((country) => country.name === incomingUser?.country);

    return {
      fullName: incomingUser?.fullName || `${incomingUser?.firstName || ""} ${incomingUser?.lastName || ""}`.trim(),
      gender: incomingUser?.gender || "",
      dob: incomingUser?.dob ? new Date(incomingUser.dob).toISOString().slice(0, 10) : "",
      age: incomingUser?.age ? String(incomingUser.age) : "",
      mobileNumber: incomingUser?.mobileNumber || "",
      city: incomingUser?.city || "",
      state: incomingUser?.state || "",
      country: incomingUser?.countryCode || matchedCountry?.isoCode || "",
      interestedSport: incomingUser?.interestedSport || "",
      experience: incomingUser?.experience || "",
      socialMediaLinks: incomingUser?.socialMediaLinks || "",
      profilePhoto: null,
      profilePhotoPreview: incomingUser?.profilePhoto || "",
    };
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const view = urlParams.get("view");
    const eventType = urlParams.get("eventType");
    if (
      view === "profile"
      || view === "matches"
      || view === "members"
      || view === "createLeague"
      || view === "leagues"
      || view === "team"
      || view === "statistics"
    ) {
      setActiveSection(view);
      if (view === "createLeague" && eventType) {
        setSelectedEventType(eventType);
      }
      return;
    }

    setActiveSection("dashboard");
  }, [location.search]);

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
        setSportsSkills(data.user.sportsSkills || {});
        setSelectedSports(Object.keys(data.user.sportsSkills || {}));
        setProfileDetails((prev) => ({
          ...prev,
          ...mapUserToProfileDetails(data.user),
        }));
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem("token");
    if (!token) {
      setTimeout(() => {
        const retryToken = localStorage.getItem("token");
        if (!retryToken) {
          setLoading(false);
          navigate("/signin");
          return;
        }
        fetchCurrentUser(retryToken);
      }, 100);
      return;
    }

    fetchCurrentUser(token);
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError("");

        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/api/auth/dashboard/stats`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !data?.stats) {
          throw new Error(data?.message || "Failed to fetch statistics");
        }

        setDashboardStats(data.stats);
      } catch (error) {
        setStatsError(error.message || "Unable to load your statistics.");
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      if (activeSection !== "members") return;

      try {
        setMembersLoading(true);
        setMembersError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setMembersError("Session expired. Please sign in again.");
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !Array.isArray(data?.users)) {
          throw new Error(data?.message || "Failed to fetch registered users");
        }

        setRegisteredUsers(data.users);
      } catch (error) {
        setMembersError(error.message || "Unable to load members.");
      } finally {
        setMembersLoading(false);
      }
    };

    fetchRegisteredUsers();
  }, [activeSection]);

  useEffect(() => {
    const fetchLeagues = async () => {
      if (activeSection !== "leagues") return;

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLeagueError("Session expired. Please sign in again.");
          return;
        }

        const response = await fetch(`${API_URL}/api/auth/leagues`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data?.success || !Array.isArray(data?.leagues)) {
          throw new Error(data?.message || "Failed to fetch leagues");
        }

        setLeagues(data.leagues);
        setLeagueError("");
      } catch (error) {
        setLeagueError(error.message || "Unable to load leagues.");
      }
    };

    fetchLeagues();
  }, [activeSection]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleOpenProfile = () => {
    navigate("/dashboard?view=profile");
    setShowProfileMenu(false);
  };

  const handleSectionNavigation = (section) => {
    if (section === "leaderboard") {
      navigate("/leaderboard");
      return;
    }

    if (section === "dashboard") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard?view=${section}`);
    }

    setActiveSection(section);
    setShowProfileMenu(false);
  };

  const handleSaveLeague = async () => {
    const trimmedName = leagueDetails.leagueName.trim();
    if (!trimmedName) {
      setLeagueError("Please enter a league name.");
      return;
    }

    // Validate tournament capacity fields
    const parsedCourts = Number(leagueDetails.numberOfCourts);
    if (!Number.isInteger(parsedCourts) || parsedCourts < 1 || parsedCourts > 4) {
      setLeagueError("Number of courts must be between 1 and 4.");
      return;
    }

    const parsedDuration = Number(leagueDetails.matchDurationMinutes);
    if (!leagueDetails.matchDurationMinutes || !Number.isInteger(parsedDuration) || parsedDuration < 5 || parsedDuration > 180) {
      setLeagueError("Match duration must be a whole number between 5 and 180 minutes.");
      return;
    }

    const parsedMaxTeams = Number(leagueDetails.maximumTeams);
    if (!leagueDetails.maximumTeams || !Number.isInteger(parsedMaxTeams) || parsedMaxTeams < 2 || parsedMaxTeams > 500) {
      setLeagueError("Maximum teams must be a whole number between 2 and 500.");
      return;
    }

    if (!leagueDetails.registrationStartDate) {
      setLeagueError("Please enter registration start date.");
      return;
    }
    if (!leagueDetails.registrationEndDate) {
      setLeagueError("Please enter registration end date.");
      return;
    }
    if (!leagueDetails.tournamentStartDate) {
      setLeagueError("Please enter tournament start date.");
      return;
    }
    if (!leagueDetails.tournamentEndDate) {
      setLeagueError("Please enter tournament end date.");
      return;
    }
    if (!leagueDetails.entryFee) {
      setLeagueError("Please enter entry fee.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLeagueError("Session expired. Please sign in again.");
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/leagues`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          leagueName: trimmedName,
          sport: leagueDetails.sport,
          type: leagueDetails.type,
          numberOfCourts: parsedCourts,
          matchDurationMinutes: parsedDuration,
          maximumTeams: parsedMaxTeams,
          registrationStartDate: leagueDetails.registrationStartDate,
          registrationEndDate: leagueDetails.registrationEndDate,
          tournamentStartDate: leagueDetails.tournamentStartDate,
          tournamentEndDate: leagueDetails.tournamentEndDate,
          entryFee: leagueDetails.entryFee,
          eventType: selectedEventType || "",
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success || !data?.league) {
        throw new Error(data?.message || "Failed to create league");
      }

      setLeagues((prev) => [data.league, ...prev]);
      setLeagueDetails({
        leagueName: "",
        sport: "badminton",
        type: "single",
        numberOfCourts: "1",
        matchDurationMinutes: "",
        maximumTeams: "",
        registrationStartDate: "",
        registrationEndDate: "",
        tournamentStartDate: "",
        tournamentEndDate: "",
        entryFee: "",
      });
      setLeagueError("");
      handleSectionNavigation("leagues");
    } catch (error) {
      setLeagueError(error.message || "Unable to create league.");
    }
  };

  const handleJoinLeague = async (leagueId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLeagueError("Session expired. Please sign in again.");
        return;
      }

      setJoiningLeagueId(String(leagueId));
      const response = await fetch(`${API_URL}/api/auth/leagues/${leagueId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok || !data?.success || !data?.league) {
        throw new Error(data?.message || "Failed to join league");
      }

      setLeagues((prev) => prev.map((league) => (
        String(league.id) === String(leagueId)
          ? { ...league, ...data.league }
          : league
      )));
      setLeagueError("");
    } catch (error) {
      setLeagueError(error.message || "Unable to join league.");
    } finally {
      setJoiningLeagueId("");
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age >= 0 ? String(age) : "";
  };

  const handleProfileDetailsChange = (field, value) => {
    setProfileDetails((prev) => {
      if (field === "dob") {
        return {
          ...prev,
          dob: value,
          age: calculateAge(value),
        };
      }

      if (field === "country") {
        return {
          ...prev,
          country: value,
          state: "",
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      setProfileDetails((prev) => ({
        ...prev,
        profilePhoto: file,
        profilePhotoPreview: imageData,
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    const requiredFields = [
      profileDetails.fullName,
      profileDetails.gender,
      profileDetails.dob,
      profileDetails.age,
      profileDetails.city,
      profileDetails.state,
      profileDetails.country,
      profileDetails.interestedSport,
      profileDetails.experience,
    ];

    if (requiredFields.some((value) => !String(value).trim())) {
      setUpdateSuccess("");
      setUpdateError("Please fill all mandatory fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUpdateSuccess("");
        setUpdateError("Session expired. Please sign in again.");
        navigate("/signin");
        return;
      }

      const selectedCountry = countryOptions.find((country) => country.isoCode === profileDetails.country);

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.email,
          fullName: profileDetails.fullName,
          gender: profileDetails.gender,
          dob: profileDetails.dob,
          age: Number(profileDetails.age),
          mobileNumber: profileDetails.mobileNumber,
          city: profileDetails.city,
          state: profileDetails.state,
          country: selectedCountry?.name || "",
          countryCode: profileDetails.country,
          interestedSport: profileDetails.interestedSport,
          experience: profileDetails.experience,
          socialMediaLinks: profileDetails.socialMediaLinks,
          profilePhoto: profileDetails.profilePhotoPreview,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success || !data?.user) {
        throw new Error(data?.message || "Failed to update profile details");
      }

      setUser(data.user);
      setProfileDetails((prev) => ({
        ...prev,
        ...mapUserToProfileDetails(data.user),
      }));

      setUpdateError("");
      setUpdateSuccess("Profile details updated successfully.");

      setTimeout(() => {
        setShowUpdateForm(false);
      }, 1000);

      setTimeout(() => {
        setUpdateSuccess("");
      }, 2500);
    } catch (error) {
      setUpdateSuccess("");
      setUpdateError(error.message || "Unable to update profile details.");
    }
  };

  const handleSkillChange = (sport, field, value) => {
    setSportsSkills(prev => ({
      ...prev,
      [sport]: {
        ...(prev[sport] || {}),
        [field]: value
      }
    }));
  };

  const handleSportToggle = (sport) => {
    setSelectedSports(prev => {
      if (prev.includes(sport)) {
        return prev.filter(s => s !== sport);
      } else {
        return [...prev, sport];
      }
    });
  };

  const handleSkillsUpdateSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setSkillsUpdateError("Session expired. Please sign in again.");
        return;
      }
      
      // Basic validation for Badminton skills
      if (selectedSports.includes("badminton")) {
        const bd = sportsSkills.badminton || {};
        if (!bd.playingHand) {
          setSkillsUpdateError("Please select a Playing Hand for Badminton.");
          setSkillsUpdateSuccess("");
          return;
        }
      }

      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          isSkillUpdate: true,
          sportsSkills: sportsSkills
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || "Failed to update skills");
      }

      setSportsSkills(data.user.sportsSkills || {});
      setSkillsUpdateError("");
      setSkillsUpdateSuccess("Skills successfully saved!");
      
      setTimeout(() => setSkillsUpdateSuccess(""), 3000);
    } catch (error) {
      setSkillsUpdateSuccess("");
      setSkillsUpdateError("Unable to save your badminton skills. Please try again.");
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f9fafb",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: "flex",
      flexDirection: "column",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Navbar */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 48px",
        borderBottom: "1px solid #f1f5f9",
        position: "sticky", top: 0, background: "white", zIndex: 10,
      }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{
            fontSize: "14px",
            color: "#6b7280",
          }}>
            Welcome, {user?.firstName}!
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {[
              { label: "Home", section: "dashboard" },
              { label: "Matches", section: "matches" },
              { label: "Members", section: "members" },
            ].map((item) => {
              const isActive = activeSection === item.section;

              return (
                <button
                  key={item.section}
                  onClick={() => handleSectionNavigation(item.section)}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "#e5e7eb";
                      e.currentTarget.style.color = "#111827";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#4b5563";
                    }
                  }}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    borderRadius: "8px",
                    background: isActive ? "#111827" : "transparent",
                    color: isActive ? "white" : "#4b5563",
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 500,
                    cursor: "pointer",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Players Header Navigation Item */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setShowPlayersDropdown(!showPlayersDropdown);
                  setShowProfileMenu(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e5e7eb";
                  e.currentTarget.style.color = "#111827";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#4b5563";
                }}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "8px",
                  background: "transparent",
                  color: "#4b5563",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <span>Sports</span>
                <span style={{ fontSize: "10px" }}>▼</span>
              </button>

              {showPlayersDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    left: 0,
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
                    padding: "6px 0",
                    minWidth: "180px",
                    zIndex: 100,
                  }}
                >
                  {SPORTS_CONFIG.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => {
                        setShowPlayersDropdown(false);
                        navigate(`/players/${sport.slug}`);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        background: "transparent",
                        border: "none",
                        color: "#374151",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <span>{sport.icon}</span>
                      <span>{sport.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={handleProfileClick}
              style={{
                padding: "8px 16px", background: "#111827",
                border: "none", borderRadius: "6px",
                fontSize: "14px", fontWeight: 500, color: "white",
                cursor: "pointer", transition: "background 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#374151")}
              onMouseLeave={e => (e.currentTarget.style.background = "#111827")}
            >
              Profile
            </button>

            {showProfileMenu && (
              <div style={{
                position: "absolute",
                top: "44px",
                right: 0,
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
                minWidth: "180px",
                padding: "8px",
                zIndex: 20,
              }}>
                <button
                  onClick={handleOpenProfile}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    fontSize: "13px",
                    color: "#111827",
                    fontWeight: 600,
                    padding: "8px 10px",
                    borderBottom: "1px solid #f3f4f6",
                    marginBottom: "6px",
                    borderTop: "none",
                    borderLeft: "none",
                    borderRight: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  My Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#ef4444",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content with Sidebar */}
      <div style={{
        display: "flex",
        flex: 1,
      }}>
        {/* Left Sidebar */}
        <aside style={{
          width: "140px",
          background: "white",
          borderRight: "1px solid #e5e7eb",
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <h3 style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#9ca3af",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            marginBottom: "8px",
            paddingLeft: "4px",
          }}>
            Actions
          </h3>

          <button style={{
            background: activeSection === "leaderboard" ? "#3b82f6" : "#f3f4f6",
            color: activeSection === "leaderboard" ? "white" : "#111827",
            border: "none",
            borderRadius: "8px",
            padding: "10px 8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
            onClick={() => handleSectionNavigation("leaderboard")}
            onMouseEnter={e => {
              if (activeSection !== "leaderboard") {
                e.currentTarget.style.background = "#e5e7eb";
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== "leaderboard") {
                e.currentTarget.style.background = "#f3f4f6";
              }
            }}>
            <span style={{ fontSize: "16px" }}>🏆</span>
            <span>Leaderboard</span>
          </button>

          <button style={{
            background: activeSection === "leagues" ? "#0ea5e9" : "#f3f4f6",
            color: activeSection === "leagues" ? "white" : "#111827",
            border: "none",
            borderRadius: "8px",
            padding: "10px 8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
            onClick={() => handleSectionNavigation("leagues")}
            onMouseEnter={e => {
              if (activeSection !== "leagues") {
                e.currentTarget.style.background = "#e5e7eb";
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== "leagues") {
                e.currentTarget.style.background = "#f3f4f6";
              }
            }}>
            <span style={{ fontSize: "16px" }}>🏸</span>
            <span>Leagues</span>
          </button>

          <button style={{
            background: activeSection === "team" ? "#8b5cf6" : "#f3f4f6",
            color: activeSection === "team" ? "white" : "#111827",
            border: "none",
            borderRadius: "8px",
            padding: "10px 8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
            onClick={() => handleSectionNavigation("team")}
            onMouseEnter={e => {
              if (activeSection !== "team") {
                e.currentTarget.style.background = "#e5e7eb";
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== "team") {
                e.currentTarget.style.background = "#f3f4f6";
              }
            }}>
            <span style={{ fontSize: "16px" }}>👥</span>
            <span>Team</span>
          </button>

          <button style={{
            background: activeSection === "statistics" ? "#f59e0b" : "#f3f4f6",
            color: activeSection === "statistics" ? "white" : "#111827",
            border: "none",
            borderRadius: "8px",
            padding: "10px 8px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
          }}
            onClick={() => handleSectionNavigation("statistics")}
            onMouseEnter={e => {
              if (activeSection !== "statistics") {
                e.currentTarget.style.background = "#e5e7eb";
              }
            }}
            onMouseLeave={e => {
              if (activeSection !== "statistics") {
                e.currentTarget.style.background = "#f3f4f6";
              }
            }}>
            <span style={{ fontSize: "16px" }}>📊</span>
            <span>Statistics</span>
          </button>
        </aside>

        {/* Main Content */}
        <div style={{
          flex: 1,
          padding: "40px 48px",
          maxWidth: "1400px",
          width: "100%",
        }}>
          {activeSection === "profile" ? (
            <>
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                My Profile
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "28px",
              }}>
                Manage your personal information and account details
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "20px",
              }}>
                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "#f8fafc",
                }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
                    First Name
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                    {user?.firstName}
                  </div>
                </div>

                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "#f8fafc",
                }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
                    Last Name
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                    {user?.lastName}
                  </div>
                </div>

                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "20px",
                  background: "#f8fafc",
                }}>
                  <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "6px" }}>
                    Email Address
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                    {user?.email}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "24px" }}>
                {updateSuccess && (
                  <p style={{ marginBottom: "10px", color: "#15803d", fontSize: "13px", fontWeight: 500 }}>
                    {updateSuccess}
                  </p>
                )}

                <button
                  onClick={() => {
                    setShowUpdateForm((prev) => !prev);
                    setUpdateError("");
                    if (!showUpdateForm) {
                      setProfileDetails((prev) => ({
                        ...prev,
                        fullName: prev.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
                      }));
                    }
                  }}
                  style={{
                    padding: "10px 18px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "white",
                    background: "#16a34a",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#15803d")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#16a34a")}
                >
                  {showUpdateForm ? "Hide Update Form" : "Update"}
                </button>
              </div>

              {showUpdateForm && (
                <form
                  onSubmit={handleUpdateSubmit}
                  style={{
                    marginTop: "20px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    padding: "22px",
                  }}>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "16px",
                  }}>
                    Update Profile Details
                  </h3>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px",
                  }}>
                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileDetails.fullName}
                        onChange={(e) => handleProfileDetailsChange("fullName", e.target.value)}
                        placeholder="Enter full name"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Gender
                      </label>
                      <select
                        value={profileDetails.gender}
                        onChange={(e) => handleProfileDetailsChange("gender", e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "white",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={profileDetails.dob}
                        onChange={(e) => handleProfileDetailsChange("dob", e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Age (Auto-calculated)
                      </label>
                      <input
                        type="text"
                        value={profileDetails.age}
                        readOnly
                        placeholder="Calculated from DOB"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "#f3f4f6",
                          color: "#4b5563",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Mobile Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={profileDetails.mobileNumber}
                        onChange={(e) => handleProfileDetailsChange("mobileNumber", e.target.value)}
                        placeholder="Enter mobile number"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Country
                      </label>
                      <select
                        value={profileDetails.country}
                        onChange={(e) => handleProfileDetailsChange("country", e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "white",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Select country</option>
                        {countryOptions.map((country) => (
                          <option key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        State
                      </label>
                      <select
                        value={profileDetails.state}
                        onChange={(e) => handleProfileDetailsChange("state", e.target.value)}
                        disabled={!profileDetails.country}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: profileDetails.country ? "white" : "#f3f4f6",
                          color: profileDetails.country ? "#111827" : "#6b7280",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">{profileDetails.country ? "Select state" : "Select country first"}</option>
                        {stateOptions.map((state) => (
                          <option key={state.isoCode} value={state.name}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        City
                      </label>
                      <input
                        type="text"
                        value={profileDetails.city}
                        onChange={(e) => handleProfileDetailsChange("city", e.target.value)}
                        placeholder="Enter city"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Interested Sport
                      </label>
                      <select
                        value={profileDetails.interestedSport}
                        onChange={(e) => handleProfileDetailsChange("interestedSport", e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "white",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      >
                        <option value="">Select sport</option>
                        <option value="Cricket">Cricket</option>
                        <option value="Batminton">Batminton</option>
                        <option value="Football">Football</option>
                        <option value="Volley Ball">Volley Ball</option>
                        <option value="Basket Ball">Basket Ball</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Experience
                      </label>
                      <input
                        type="text"
                        value={profileDetails.experience}
                        onChange={(e) => handleProfileDetailsChange("experience", e.target.value)}
                        placeholder="Enter your experience"
                        required
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Social Media Links (Optional)
                      </label>
                      <input
                        type="text"
                        value={profileDetails.socialMediaLinks}
                        onChange={(e) => handleProfileDetailsChange("socialMediaLinks", e.target.value)}
                        placeholder="Paste profile link(s)"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", fontSize: "13px", color: "#374151", marginBottom: "6px" }}>
                        Profile Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{
                          width: "100%",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      />

                      {profileDetails.profilePhotoPreview && (
                        <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <img
                            src={profileDetails.profilePhotoPreview}
                            alt="Profile preview"
                            style={{
                              width: "64px",
                              height: "64px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              border: "1px solid #e5e7eb",
                            }}
                          />
                          <span style={{ fontSize: "13px", color: "#4b5563" }}>
                            {profileDetails.profilePhoto?.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {updateError && (
                    <p style={{ marginTop: "14px", color: "#dc2626", fontSize: "13px", fontWeight: 500 }}>
                      {updateError}
                    </p>
                  )}

                  <div style={{ marginTop: "16px" }}>
                    <button
                      type="submit"
                      style={{
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "white",
                        background: "#2563eb",
                        cursor: "pointer",
                      }}
                    >
                      Save Details
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* SPORTS SKILLS SECTION */}
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h2 style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                Sport-Specific Skills
              </h2>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "28px",
              }}>
                Select your sports and update your skill levels
              </p>

              {/* SPORT SELECTOR */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Selected Sports
                </label>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {["badminton", "volleyball", "cricket", "tennis"].map(sport => (
                    <button
                      key={sport}
                      onClick={() => handleSportToggle(sport)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: `1px solid ${selectedSports.includes(sport) ? "#3b82f6" : "#d1d5db"}`,
                        background: selectedSports.includes(sport) ? "#eff6ff" : "white",
                        color: selectedSports.includes(sport) ? "#1d4ed8" : "#4b5563",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s"
                      }}
                    >
                      {selectedSports.includes(sport) ? "✓" : "+"} {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* BADMINTON SKILLS */}
              {selectedSports.includes("badminton") && (
                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  background: "#f8fafc",
                  padding: "24px",
                  marginTop: "24px",
                }}>
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "20px",
                    textTransform: "uppercase"
                  }}>
                    Badminton Skills
                  </h3>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}>
                    {/* Playing Hand */}
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                        Playing Hand
                      </label>
                      <select
                        value={sportsSkills.badminton?.playingHand || ""}
                        onChange={(e) => handleSkillChange("badminton", "playingHand", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "white",
                          outline: "none",
                        }}
                      >
                        <option value="">Select Hand</option>
                        <option value="Right Hand">Right Hand</option>
                        <option value="Left Hand">Left Hand</option>
                      </select>
                    </div>

                    {/* Other Skills */}
                    {[
                      { key: "smash", label: "Smash" },
                      { key: "serve", label: "Serve" },
                      { key: "dropShot", label: "Drop Shot" },
                      { key: "clear", label: "Clear" },
                      { key: "drive", label: "Drive" },
                      { key: "netPlay", label: "Net Play" },
                      { key: "defense", label: "Defense" },
                      { key: "footwork", label: "Footwork" },
                      { key: "forehand", label: "Forehand" },
                      { key: "backhand", label: "Backhand" },
                    ].map(skill => (
                      <div key={skill.key}>
                        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                          {skill.label}
                        </label>
                        <select
                          value={sportsSkills.badminton?.[skill.key] || ""}
                          onChange={(e) => handleSkillChange("badminton", skill.key, e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "14px",
                            background: "white",
                            outline: "none",
                          }}
                        >
                          <option value="">Select Level</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OTHER SPORTS SKILLS */}
              {["volleyball", "cricket", "tennis"].map(sport => {
                if (!selectedSports.includes(sport)) return null;
                return (
                  <div key={sport} style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    background: "#f8fafc",
                    padding: "24px",
                    marginTop: "24px",
                  }}>
                    <h3 style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#111827",
                      marginBottom: "20px",
                      textTransform: "uppercase"
                    }}>
                      {sport} Skills
                    </h3>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                    }}>
                      {SPORT_SKILLS_CONFIG[sport].map(skill => (
                        <div key={skill.key}>
                          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                            {skill.label}
                          </label>
                          <select
                            value={sportsSkills[sport]?.[skill.key] || ""}
                            onChange={(e) => handleSkillChange(sport, skill.key, e.target.value)}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              fontSize: "14px",
                              background: "white",
                              outline: "none",
                            }}
                          >
                            <option value="">Select Level</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* SAVE BUTTON SECTION */}
              {selectedSports.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  {skillsUpdateError && (
                    <p style={{ marginBottom: "16px", color: "#dc2626", fontSize: "13px", fontWeight: 500 }}>
                      {skillsUpdateError}
                    </p>
                  )}
                  {skillsUpdateSuccess && (
                    <p style={{ marginBottom: "16px", color: "#15803d", fontSize: "13px", fontWeight: 500 }}>
                      {skillsUpdateSuccess}
                    </p>
                  )}
                  <button
                    onClick={handleSkillsUpdateSubmit}
                    style={{
                      padding: "10px 18px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "white",
                      background: "#0369a1",
                      cursor: "pointer",
                    }}
                  >
                    Save Skills
                  </button>
                </div>
              )}

            </div>
            </>
          ) : activeSection === "matches" ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                Matches
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "24px",
              }}>
                View ongoing, scheduled, and finished matches.
              </p>

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px",
              }}>
                <section style={{
                  border: "1px solid #dbeafe",
                  borderRadius: "14px",
                  background: "#eff6ff",
                  padding: "18px",
                }}>
                  <h2 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1d4ed8",
                    marginBottom: "12px",
                  }}>
                    Ongoing Matches
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { title: "Team Alpha vs Team Beta", meta: "Set 2 in progress • Court A" },
                      { title: "Team Gamma vs Team Delta", meta: "3rd set • 18-16" },
                    ].map((match) => (
                      <div key={match.title} style={{ background: "white", borderRadius: "10px", padding: "14px", border: "1px solid #dbeafe" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{match.title}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{match.meta}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section style={{
                  border: "1px solid #fde68a",
                  borderRadius: "14px",
                  background: "#fffbeb",
                  padding: "18px",
                }}>
                  <h2 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#b45309",
                    marginBottom: "12px",
                  }}>
                    Scheduled Matches
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { title: "Team Epsilon vs Team Zeta", meta: "Tomorrow • 3:00 PM" },
                      { title: "Team Orion vs Team Nova", meta: "Friday • 6:30 PM" },
                    ].map((match) => (
                      <div key={match.title} style={{ background: "white", borderRadius: "10px", padding: "14px", border: "1px solid #fde68a" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{match.title}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{match.meta}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section style={{
                  border: "1px solid #dcfce7",
                  borderRadius: "14px",
                  background: "#f0fdf4",
                  padding: "18px",
                }}>
                  <h2 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#15803d",
                    marginBottom: "12px",
                  }}>
                    Finished Matches
                  </h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { title: "Team Phoenix vs Team Hawk", meta: "Won 21-15, 21-18" },
                      { title: "Team Strikers vs Team Raiders", meta: "Lost 17-21, 19-21" },
                    ].map((match) => (
                      <div key={match.title} style={{ background: "white", borderRadius: "10px", padding: "14px", border: "1px solid #dcfce7" }}>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{match.title}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{match.meta}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : activeSection === "members" ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                Members
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "24px",
              }}>
                Registered users and their leaderboard rank.
              </p>

              {membersLoading ? (
                <p style={{ fontSize: "14px", color: "#6b7280" }}>Loading members...</p>
              ) : membersError ? (
                <p style={{ fontSize: "14px", color: "#dc2626" }}>{membersError}</p>
              ) : (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  maxWidth: "400px",
                }}>
                  {registeredUsers.length === 0 ? (
                    <div style={{ color: "#6b7280", fontSize: "14px" }}>No registered users found.</div>
                  ) : (
                    registeredUsers.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          padding: "16px",
                          background: "#f8fafc",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "8px",
                          textAlign: "left",
                        }}
                      >
                        <div style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
                          {member.name || "Unnamed User"}
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#6b7280" }}>
                          #{member.rank}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : activeSection === "createLeague" ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}>
                <div>
                  <h1 style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#111827",
                    marginBottom: "8px",
                    fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  }}>
                    Create League{selectedEventType ? ` — ${toTitleCase(selectedEventType)}` : ""}
                  </h1>
                  <p style={{
                    fontSize: "16px",
                    color: "#6b7280",
                    marginBottom: 0,
                  }}>
                    Set the sport and match format for your new league.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSectionNavigation("dashboard")}
                  style={{
                    padding: "10px 16px",
                    background: "#f3f4f6",
                    color: "#111827",
                    border: "1px solid #e5e7eb",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Back to Dashboard
                </button>
              </div>
              {/* start */}
              <div className="border-t border-b border-gray-300 mb-3">
                {options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 px-1 py-2 cursor-pointer
                 hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="
                        appearance-none
                        w-[14px] h-[14px] shrink-0
                        rounded-full
                        border-2 border-gray-300
                        cursor-pointer
                        checked:border-blue-600
                        checked:bg-[radial-gradient(circle,_#2563eb_0_3px,_transparent_3.5px)]
                      "
                    />
                    <span className="text-sm text-gray-700 leading-5">
                      {option}
                    </span>
                  </label>
                ))}
              </div>
              {/* end */}
              <form style={{ display: "grid", gap: "18px", maxWidth: "560px" }}>
                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="leagueName" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    League Name
                  </label>
                  <input
                    id="leagueName"
                    type="text"
                    value={leagueDetails.leagueName}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, leagueName: e.target.value }))}
                    placeholder="Enter league name"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="sport" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Select Sport
                  </label>
                  <select
                    id="sport"
                    value={leagueDetails.sport}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, sport: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                    }}
                  >
                    <option value="badminton">Badminton</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="cricket">Cricket</option>
                    <option value="tennis">Tennis</option>
                    <option value="pickleball">Pickleball</option>
                    <option value="table-tennis">Table Tennis</option>
                  </select>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="type" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Type
                  </label>
                  <select
                    id="type"
                    value={leagueDetails.type}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, type: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                    }}
                  >
                    <option value="single">Single</option>
                    <option value="doubles">Doubles</option>
                  </select>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="numberOfCourts" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Number of Courts
                  </label>
                  <select
                    id="numberOfCourts"
                    value={leagueDetails.numberOfCourts}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, numberOfCourts: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                      background: "white",
                    }}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="matchDurationMinutes" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Estimated Match Duration (Minutes)
                  </label>
                  <input
                    id="matchDurationMinutes"
                    type="number"
                    min="5"
                    max="180"
                    step="1"
                    value={leagueDetails.matchDurationMinutes}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, matchDurationMinutes: e.target.value }))}
                    placeholder="e.g., 20"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="maximumTeams" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Maximum Teams
                  </label>
                  <input
                    id="maximumTeams"
                    type="number"
                    min="2"
                    max="500"
                    step="1"
                    value={leagueDetails.maximumTeams}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, maximumTeams: e.target.value }))}
                    placeholder="e.g., 48"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="registrationStartDate" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Registration Start Date
                  </label>
                  <input
                    id="registrationStartDate"
                    type="date"
                    value={leagueDetails.registrationStartDate}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, registrationStartDate: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="registrationEndDate" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Registration End Date
                  </label>
                  <input
                    id="registrationEndDate"
                    type="date"
                    value={leagueDetails.registrationEndDate}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, registrationEndDate: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="tournamentStartDate" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Tournament Start Date
                  </label>
                  <input
                    id="tournamentStartDate"
                    type="date"
                    value={leagueDetails.tournamentStartDate}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, tournamentStartDate: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="tournamentEndDate" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Tournament End Date
                  </label>
                  <input
                    id="tournamentEndDate"
                    type="date"
                    value={leagueDetails.tournamentEndDate}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, tournamentEndDate: e.target.value }))}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  <label htmlFor="entryFee" style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>
                    Entry Fee (Type "free" or enter amount)
                  </label>
                  <input
                    id="entryFee"
                    type="text"
                    value={leagueDetails.entryFee}
                    onChange={(e) => setLeagueDetails((prev) => ({ ...prev, entryFee: e.target.value }))}
                    placeholder="e.g., free or 500"
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d1d5db",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => handleSectionNavigation("dashboard")}
                    style={{
                      padding: "12px 18px",
                      background: "#e5e7eb",
                      color: "#111827",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: "12px 18px",
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
                    onClick={handleSaveLeague}
                  >
                    Save League
                  </button>
                </div>
                {leagueError && (
                  <div style={{ fontSize: "13px", color: "#dc2626", fontWeight: 600 }}>
                    {leagueError}
                  </div>
                )}
              </form>
            </div>
          ) : activeSection === "leagues" ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                Leagues
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "24px",
              }}>
                All leagues created from the Create League page appear here.
              </p>

              {leagues.length === 0 ? (
                <div style={{
                  padding: "18px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  background: "#f8fafc",
                  color: "#6b7280",
                  fontSize: "14px",
                }}>
                  No leagues saved yet.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px", maxWidth: "620px" }}>
                  {leagues.map((league) => (
                    <div
                      key={league.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "16px",
                        background: "#f8fafc",
                        display: "grid",
                        gap: "6px",
                      }}
                    >
                      <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>
                        {league.leagueName}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                        Sport: {toTitleCase(league.sport)}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                        Type: {toTitleCase(league.type)}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                        Created by: {league.createdByUsername || "Unknown User"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: 600 }}>
                        Email: {league.createdByEmail || "N/A"}
                      </div>

                      {/* Tournament Capacity Info */}
                      <div style={{
                        marginTop: "8px",
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "10px",
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "8px",
                      }}>
                        <div style={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "10px",
                        }}>
                          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, marginBottom: "2px" }}>Maximum Teams</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{league.maximumTeams || "N/A"}</div>
                        </div>
                        <div style={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "10px",
                        }}>
                          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, marginBottom: "2px" }}>Confirmed Teams</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: league.remainingSlots === 0 ? "#dc2626" : "#16a34a" }}>
                            {league.confirmedCount ?? 0} / {league.maximumTeams || "N/A"}
                          </div>
                        </div>
                        <div style={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "10px",
                        }}>
                          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, marginBottom: "2px" }}>Remaining Slots</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: league.remainingSlots === 0 ? "#dc2626" : "#2563eb" }}>
                            {league.remainingSlots ?? 0}
                          </div>
                        </div>
                        <div style={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "10px",
                        }}>
                          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, marginBottom: "2px" }}>Courts</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{league.numberOfCourts || 1}</div>
                        </div>
                        <div style={{
                          background: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "10px",
                        }}>
                          <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: 600, marginBottom: "2px" }}>Match Duration</div>
                          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{league.matchDurationMinutes || 0} min</div>
                        </div>
                      </div>

                      {/* Confirmed Teams */}
                      <div style={{
                        marginTop: "8px",
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "10px",
                        display: "grid",
                        gap: "6px",
                      }}>
                        <div style={{ fontSize: "12px", color: "#374151", fontWeight: 700 }}>
                          Confirmed Teams ({league.confirmedCount ?? 0})
                        </div>
                        {Array.isArray(league.joinedUsers) && league.joinedUsers.length > 0 ? (
                          league.joinedUsers.map((member, index) => (
                            <div
                              key={`${league.id}-confirmed-${member.userId || member.email || index}`}
                              style={{
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                display: "grid",
                                gap: "2px",
                              }}
                            >
                              <div style={{ fontSize: "12px", color: "#111827", fontWeight: 700 }}>
                                {member.username || "Unknown User"}
                              </div>
                              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
                                {member.email || "N/A"}
                              </div>
                              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>
                                Joined: {member.joinedAt ? new Date(member.joinedAt).toLocaleString() : "N/A"}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600 }}>
                            No teams confirmed yet.
                          </div>
                        )}
                      </div>

                      {/* Waiting List — only shown when there are waiting teams */}
                      {Array.isArray(league.waitingList) && league.waitingList.length > 0 && (
                        <div style={{
                          marginTop: "8px",
                          borderTop: "1px solid #fde68a",
                          paddingTop: "10px",
                          display: "grid",
                          gap: "6px",
                        }}>
                          <div style={{ fontSize: "12px", color: "#b45309", fontWeight: 700 }}>
                            Waiting List ({league.waitingCount ?? league.waitingList.length} Teams)
                          </div>
                          {league.waitingList.map((member, index) => (
                            <div
                              key={`${league.id}-waiting-${member.userId || member.email || index}`}
                              style={{
                                background: "#fffbeb",
                                border: "1px solid #fde68a",
                                borderRadius: "8px",
                                padding: "8px 10px",
                                display: "grid",
                                gap: "2px",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "12px", color: "#92400e", fontWeight: 700 }}>
                                  {index + 1}.
                                </span>
                                <span style={{ fontSize: "12px", color: "#111827", fontWeight: 700 }}>
                                  {member.username || "Unknown User"}
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
                                {member.email || "N/A"}
                              </div>
                              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600 }}>
                                Joined: {member.joinedAt ? new Date(member.joinedAt).toLocaleString() : "N/A"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Join / Waiting Button */}
                      <div style={{ marginTop: "6px" }}>
                        <button
                          type="button"
                          disabled={Boolean(league.hasJoined) || Boolean(league.isWaiting) || joiningLeagueId === String(league.id)}
                          onClick={() => handleJoinLeague(league.id)}
                          style={{
                            padding: "8px 14px",
                            background: league.hasJoined
                              ? "#e5e7eb"
                              : league.isWaiting
                                ? "#fef3c7"
                                : "#0ea5e9",
                            color: league.hasJoined
                              ? "#6b7280"
                              : league.isWaiting
                                ? "#92400e"
                                : "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: (league.hasJoined || league.isWaiting) ? "not-allowed" : "pointer",
                          }}
                        >
                          {joiningLeagueId === String(league.id)
                            ? "Joining..."
                            : league.hasJoined
                              ? "Joined"
                              : league.isWaiting
                                ? "On Waiting List"
                                : league.remainingSlots === 0
                                  ? "Join Waiting List"
                                  : "Join"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeSection === "team" ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                Manage Team
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "0",
              }}>
                Team management workspace is now active from the quick action button.
              </p>
            </div>
          ) : activeSection === "statistics" ? (
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "40px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              marginBottom: "32px",
            }}>
              <h1 style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "8px",
                fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
              }}>
                Statistics
              </h1>
              <p style={{
                fontSize: "16px",
                color: "#6b7280",
                marginBottom: "24px",
              }}>
                {dashboardStats?.interestedSport
                  ? `Your ${dashboardStats.interestedSport} performance metrics`
                  : "Review your performance metrics and match analytics."}
              </p>

              {statsLoading ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
                  <div style={{ fontSize: "14px" }}>Loading your statistics...</div>
                </div>
              ) : statsError ? (
                <div style={{
                  textAlign: "center",
                  padding: "32px",
                  background: "#fef2f2",
                  borderRadius: "12px",
                  border: "1px solid #fecaca",
                }}>
                  <div style={{ fontSize: "14px", color: "#dc2626", marginBottom: "8px" }}>
                    Unable to load your statistics.
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      padding: "6px 16px",
                      background: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}>
                    {[
                      { label: "Games Played", value: String(dashboardStats?.gamesPlayed ?? 0), color: "#2563eb" },
                      { label: "Wins", value: String(dashboardStats?.wins ?? 0), color: "#16a34a" },
                      { label: "Losses", value: String(dashboardStats?.losses ?? 0), color: "#ef4444" },
                      { label: "Win Rate", value: `${dashboardStats?.winRate ?? 0}%`, color: "#f59e0b" },
                      { label: "Current Rating", value: String(dashboardStats?.rating ?? 1200), color: "#8b5cf6" },
                      { label: "Leagues Joined", value: String(dashboardStats?.leaguesJoined ?? 0), color: "#0ea5e9" },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "14px",
                        background: "#f8fafc",
                        padding: "18px",
                      }}>
                        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                          {stat.label}
                        </div>
                        <div style={{ fontSize: "30px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "18px",
                  }}>
                    <div style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "20px",
                      background: "#ffffff",
                    }}>
                      <h2 style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: "14px",
                      }}>
                        Overview
                      </h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {[
                          { label: "Sport", detail: dashboardStats?.interestedSport || "Not set" },
                          { label: "Club", detail: dashboardStats?.club || "Standalone / Unaffiliated" },
                          { label: "Rating", detail: String(dashboardStats?.rating ?? 1200) },
                          { label: "Total Matches", detail: String(dashboardStats?.gamesPlayed ?? 0) },
                        ].map((item) => (
                          <div key={item.label} style={{
                            border: "1px solid #f3f4f6",
                            borderRadius: "10px",
                            padding: "14px",
                            background: "#f9fafb",
                          }}>
                            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "4px" }}>{item.label}</div>
                            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{item.detail}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "14px",
                      padding: "20px",
                      background: "#ffffff",
                    }}>
                      <h2 style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#111827",
                        marginBottom: "14px",
                      }}>
                        Win/Loss Breakdown
                      </h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(() => {
                          const gp = dashboardStats?.gamesPlayed ?? 0;
                          const w = dashboardStats?.wins ?? 0;
                          const l = dashboardStats?.losses ?? 0;
                          const winPct = gp > 0 ? Math.round((w / gp) * 100) : 0;
                          const lossPct = gp > 0 ? Math.round((l / gp) * 100) : 0;
                          return [
                            { label: "Wins", value: winPct, color: "#16a34a" },
                            { label: "Losses", value: lossPct, color: "#ef4444" },
                          ].map((item) => (
                            <div key={item.label}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>{item.label}</span>
                                <span style={{ fontSize: "13px", color: "#6b7280" }}>{item.value}%</span>
                              </div>
                              <div style={{ background: "#e5e7eb", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
                                <div style={{ width: `${item.value}%`, height: "100%", borderRadius: "999px", background: item.color, transition: "width 0.5s ease" }} />
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <div style={{
                background: "white",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                marginBottom: "32px",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "16px",
                  marginBottom: "8px",
                  flexWrap: "wrap",
                }}>
                  <h1 style={{
                    fontSize: "32px",
                    fontWeight: 700,
                    color: "#111827",
                    margin: 0,
                    fontFamily: "'Bebas Neue', 'Arial Black', sans-serif",
                  }}>
                    Welcome{dashboardStats?.displayName ? `, ${dashboardStats.displayName}` : " to VINISPORT"}
                  </h1>
                  <button
                    type="button"
                    onClick={() => navigate("/event-types")}
                    style={{
                      padding: "8px 14px",
                      background: "#16a34a",
                      color: "white",
                      border: "none",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#15803d")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#16a34a")}
                  >
                    Create League
                  </button>
                </div>
                <p style={{
                  fontSize: "16px",
                  color: "#6b7280",
                  marginBottom: "32px",
                }}>
                  Here's your VINISPORT activity
                </p>

                {statsLoading ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
                    <div style={{ fontSize: "14px" }}>Loading your stats...</div>
                  </div>
                ) : statsError ? (
                  <div style={{
                    textAlign: "center",
                    padding: "32px",
                    background: "#fef2f2",
                    borderRadius: "12px",
                    border: "1px solid #fecaca",
                  }}>
                    <div style={{ fontSize: "14px", color: "#dc2626", marginBottom: "8px" }}>
                      Unable to load your statistics.
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      style={{
                        padding: "6px 16px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "20px",
                  }}>
                    {[
                      { label: "Games Played", value: String(dashboardStats?.gamesPlayed ?? 0), color: "#2563eb", icon: "🎮" },
                      { label: "Wins", value: String(dashboardStats?.wins ?? 0), color: "#16a34a", icon: "🏆" },
                      { label: "Losses", value: String(dashboardStats?.losses ?? 0), color: "#ef4444", icon: "📉" },
                      { label: "Win Rate", value: `${dashboardStats?.winRate ?? 0}%`, color: "#f59e0b", icon: "📊" },
                      { label: "Current Rating", value: String(dashboardStats?.rating ?? 1200), color: "#8b5cf6", icon: "⭐" },
                      { label: "Leagues Joined", value: String(dashboardStats?.leaguesJoined ?? 0), color: "#0ea5e9", icon: "🏸" },
                    ].map((stat) => (
                      <div key={stat.label} style={{
                        background: "#f8fafc",
                        borderRadius: "14px",
                        padding: "20px",
                        border: "1px solid #e5e7eb",
                        transition: "box-shadow 0.2s, transform 0.2s",
                        cursor: "default",
                      }}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                          e.currentTarget.style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                          <span style={{ fontSize: "18px" }}>{stat.icon}</span>
                          <span style={{ fontSize: "13px", color: "#6b7280", fontWeight: 500 }}>{stat.label}</span>
                        </div>
                        <div style={{ fontSize: "28px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <SportStatsSection token={localStorage.getItem("token")} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
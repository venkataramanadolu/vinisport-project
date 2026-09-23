const express = require("express");
const router = express.Router();
const User = require("../models/User");
const League = require("../models/League");
const Club = require("../models/Club");

// Centralized Sport Type Codes Mapping
const SPORT_TYPE_CODES = {
  badminton: "BD",
  volleyball: "VB",
  cricket: "CR",
  "table-tennis": "TT",
  tabletennis: "TT",
  football: "FB",
  basketball: "BB",
};

const getTypeCodeForSport = (sport) => {
  if (!sport) return "N/A";
  const str = String(sport).toLowerCase().trim();
  if (SPORT_TYPE_CODES[str]) return SPORT_TYPE_CODES[str];
  const slugified = str.replace(/[\s_]+/g, "-");
  if (SPORT_TYPE_CODES[slugified]) return SPORT_TYPE_CODES[slugified];
  const alphaNumericOnly = str.replace(/[^a-z0-9]/g, "");
  if (SPORT_TYPE_CODES[alphaNumericOnly]) return SPORT_TYPE_CODES[alphaNumericOnly];
  return "N/A";
};

// Helper function to format player display name
const getPlayerName = (user) => {
  if (!user) return "Unknown Player";
  if (user.fullName && user.fullName.trim()) return user.fullName.trim();
  const composed = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return composed || user.email || "Unknown Player";
};

// @route   GET /api/players/clubs
// @desc    Get all unique clubs for filter dropdown (sport-wise and league-wise)
// @access  Public / Optional Auth
router.get("/clubs", async (req, res) => {
  try {
    const { sport, league } = req.query;
    let clubQuery = {};

    if (sport && sport !== "all") {
      const sportPattern = sport.replace(/-/g, "[ -]?");
      clubQuery.sport = new RegExp(`^${sportPattern}$`, "i");
    }

    if (league && league !== "all") {
      if (league.match(/^[0-9a-fA-F]{24}$/)) {
        clubQuery.leagueId = league;
      } else {
        const decodedLeague = decodeURIComponent(league).trim();
        let targetLeagueQuery = {
          $or: [{ _id: league }, { leagueName: new RegExp(decodedLeague, "i") }],
        };
        if (sport && sport !== "all") {
          targetLeagueQuery.sport = new RegExp(`^${sport.replace(/-/g, "[ -]?")}$`, "i");
        }
        const targetLeague = await League.findOne(targetLeagueQuery);
        if (targetLeague) {
          clubQuery.leagueId = targetLeague._id;
        } else {
          clubQuery.leagueName = new RegExp(decodedLeague, "i");
        }
      }
    }

    let clubsFromDb = await Club.find(clubQuery).select("clubName").sort({ clubName: 1 });
    let validClubs = clubsFromDb.map((c) => c.clubName).filter(Boolean);

    // Fallback if no specific Club docs matched
    if (validClubs.length === 0) {
      let userQuery = {};
      if (sport && sport !== "all") {
        userQuery.interestedSport = new RegExp(`^${sport.replace(/-/g, "[ -]?")}$`, "i");
      }
      if (league && league !== "all") {
        if (league.match(/^[0-9a-fA-F]{24}$/)) {
          userQuery.leagueId = league;
        } else {
          userQuery.leagueName = new RegExp(decodeURIComponent(league).trim(), "i");
        }
      }
      const distinctUserClubs = await User.distinct("club", userQuery);
      validClubs = distinctUserClubs.filter((c) => Boolean(c) && String(c).trim().length > 0);
    }

    res.status(200).json({
      success: true,
      clubs: validClubs.length > 0 ? validClubs : ["Standalone / Unaffiliated"],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch clubs",
    });
  }
});

// @route   GET /api/players/leagues
// @desc    Get all leagues for filter dropdown (sport-wise)
// @access  Public / Optional Auth
router.get("/leagues", async (req, res) => {
  try {
    const { sport } = req.query;
    let query = {};

    if (sport && sport !== "all" && sport !== "other-sports") {
      const sportPattern = sport.replace(/-/g, "[ -]?");
      query.sport = new RegExp(`^${sportPattern}$`, "i");
    }

    const leagues = await League.find(query)
      .select("leagueName sport joinedUsers")
      .sort({ createdAt: -1 });

    const formattedLeagues = leagues.map((l) => ({
      id: l._id,
      leagueName: l.leagueName,
      sport: l.sport,
      playerCount: Array.isArray(l.joinedUsers) ? l.joinedUsers.length : 0,
    }));

    res.status(200).json({
      success: true,
      leagues: formattedLeagues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch leagues",
    });
  }
});

// Main Player Query Logic Function
const fetchPlayersHandler = async (req, res, overrideParams = {}) => {
  try {
    const sportParam = overrideParams.sport || req.params.sport || req.query.sport || "all";
    const clubParam = overrideParams.clubId || req.params.clubId || req.query.club || "";
    const leagueParam = overrideParams.leagueId || req.params.leagueId || req.query.league || "";

    const searchRaw = (req.query.search || "").trim();
    const sortBy = (req.query.sortBy || "rating").trim();
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 25);

    let mongoQuery = {};

    // 1. Sport Filter with Strict Isolation
    if (sportParam && sportParam !== "all") {
      const normalizedSport = sportParam.toLowerCase().trim();
      const sportPattern = normalizedSport.replace(/-/g, "[ -]?");
      const sportRegex = new RegExp(`^${sportPattern}$`, "i");
      const knownSports = ["badminton", "volleyball", "cricket", "football", "basketball", "table-tennis"];

      if (normalizedSport === "other-sports") {
        mongoQuery.interestedSport = {
          $not: new RegExp(knownSports.join("|"), "i"),
        };
      } else {
        const matchingLeagues = await League.find({
          sport: sportRegex,
        }).select("_id createdByUserId joinedUsers");

        const userIdsInSportLeagues = new Set();
        const sportLeagueIds = matchingLeagues.map((l) => l._id);

        matchingLeagues.forEach((l) => {
          if (l.createdByUserId) userIdsInSportLeagues.add(String(l.createdByUserId));
          if (Array.isArray(l.joinedUsers)) {
            l.joinedUsers.forEach((m) => {
              if (m.userId) userIdsInSportLeagues.add(String(m.userId));
            });
          }
        });

        const matchingClubs = await Club.find({ sport: sportRegex }).select("_id clubName");
        const sportClubIds = matchingClubs.map((c) => c._id);
        const sportClubNames = matchingClubs.map((c) => c.clubName);

        const otherKnownSports = knownSports.filter(
          (s) => s !== normalizedSport && s.replace(/-/g, "") !== normalizedSport.replace(/-/g, "")
        );
        const conflictingSportsRegex = new RegExp(`^(${otherKnownSports.map((s) => s.replace(/-/g, "[ -]?")).join("|")})$`, "i");

        const sportConditions = [{ interestedSport: sportRegex }];
        const userAssociationConditions = [];

        if (userIdsInSportLeagues.size > 0) {
          userAssociationConditions.push({ _id: { $in: Array.from(userIdsInSportLeagues) } });
        }
        if (sportLeagueIds.length > 0) {
          userAssociationConditions.push({ leagueId: { $in: sportLeagueIds } });
        }
        if (sportClubIds.length > 0) {
          userAssociationConditions.push({ clubId: { $in: sportClubIds } });
        }
        if (sportClubNames.length > 0) {
          userAssociationConditions.push({ club: { $in: sportClubNames } });
        }

        if (userAssociationConditions.length > 0) {
          sportConditions.push({
            interestedSport: { $not: conflictingSportsRegex },
            $or: userAssociationConditions,
          });
        }

        mongoQuery.$or = sportConditions;
      }
    }

    // 2. Club Filter
    if (clubParam) {
      const decodedClub = decodeURIComponent(clubParam).trim();
      if (decodedClub && decodedClub !== "all") {
        const clubRegex = new RegExp(decodedClub, "i");
        mongoQuery.club = clubRegex;
      }
    }

    // 3. League Filter
    if (leagueParam && leagueParam !== "all") {
      let targetLeague = null;
      if (leagueParam.match(/^[0-9a-fA-F]{24}$/)) {
        targetLeague = await League.findById(leagueParam);
      } else {
        const decodedLeague = decodeURIComponent(leagueParam).trim();
        targetLeague = await League.findOne({ leagueName: new RegExp(decodedLeague, "i") });
      }

      if (targetLeague) {
        const participantIds = new Set();
        if (targetLeague.createdByUserId) participantIds.add(String(targetLeague.createdByUserId));
        if (Array.isArray(targetLeague.joinedUsers)) {
          targetLeague.joinedUsers.forEach((u) => {
            if (u.userId) participantIds.add(String(u.userId));
          });
        }
        mongoQuery.$and = mongoQuery.$and || [];
        mongoQuery.$and.push({
          $or: [
            { leagueId: targetLeague._id },
            { leagueName: targetLeague.leagueName },
            { _id: { $in: Array.from(participantIds) } },
          ],
        });
      }
    }

    // 4. Dynamic Search Filter (Player Name, Email, Club Name, AND League Name)
    if (searchRaw) {
      const searchRegex = new RegExp(searchRaw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      // Find matching leagues by search regex
      const searchLeagueQuery = {
        $or: [{ leagueName: searchRegex }, { sport: searchRegex }],
      };
      if (sportParam && sportParam !== "all" && sportParam !== "other-sports") {
        const sportPattern = sportParam.toLowerCase().trim().replace(/-/g, "[ -]?");
        searchLeagueQuery.sport = new RegExp(`^${sportPattern}$`, "i");
      }

      const matchingLeaguesForSearch = await League.find(searchLeagueQuery).select("_id leagueName joinedUsers");

      const searchLeagueIds = matchingLeaguesForSearch.map((l) => l._id);
      const searchUserIdsFromLeagues = new Set();
      matchingLeaguesForSearch.forEach((l) => {
        if (Array.isArray(l.joinedUsers)) {
          l.joinedUsers.forEach((u) => {
            if (u.userId) searchUserIdsFromLeagues.add(String(u.userId));
          });
        }
      });

      const searchOr = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { club: searchRegex },
        { leagueName: searchRegex },
      ];

      if (searchLeagueIds.length > 0) {
        searchOr.push({ leagueId: { $in: searchLeagueIds } });
      }

      if (searchUserIdsFromLeagues.size > 0) {
        searchOr.push({ _id: { $in: Array.from(searchUserIdsFromLeagues) } });
      }

      if (mongoQuery.$or) {
        mongoQuery = {
          $and: [{ $or: mongoQuery.$or }, { $or: searchOr }],
        };
      } else {
        mongoQuery.$or = searchOr;
      }
    }

    // Total Count
    const totalCount = await User.countDocuments(mongoQuery);

    // Sorting Map
    let sortConfig = {};
    if (sortBy === "name") {
      sortConfig = { firstName: sortOrder, lastName: sortOrder };
    } else if (sortBy === "gamesPlayed") {
      sortConfig = { gamesPlayed: sortOrder, rating: -1 };
    } else {
      sortConfig = { rating: sortOrder, createdAt: -1 };
    }

    // Fetch Paginated Users
    const skip = (page - 1) * limit;
    const users = await User.find(mongoQuery)
      .select("firstName middleName lastName fullName email city state country interestedSport club clubId leagueId leagueName rating gamesPlayed wins losses createdAt profilePhoto")
      .sort(sortConfig)
      .skip(skip)
      .limit(limit);

    // Get leagues specifically for active sport context to populate primary league column
    const userIds = users.map((u) => u._id);
    let userLeaguesQuery = {
      $or: [
        { createdByUserId: { $in: userIds } },
        { "joinedUsers.userId": { $in: userIds } },
      ],
    };
    if (sportParam && sportParam !== "all" && sportParam !== "other-sports") {
      const sportPattern = sportParam.toLowerCase().trim().replace(/-/g, "[ -]?");
      userLeaguesQuery.sport = new RegExp(`^${sportPattern}$`, "i");
    }

    const userLeagues = await League.find(userLeaguesQuery).select("leagueName sport createdByUserId joinedUsers");

    const leagueMap = {};
    userLeagues.forEach((l) => {
      if (l.createdByUserId) {
        const idStr = String(l.createdByUserId);
        if (!leagueMap[idStr]) leagueMap[idStr] = l.leagueName;
      }
      if (Array.isArray(l.joinedUsers)) {
        l.joinedUsers.forEach((m) => {
          if (m.userId) {
            const mIdStr = String(m.userId);
            if (!leagueMap[mIdStr]) leagueMap[mIdStr] = l.leagueName;
          }
        });
      }
    });

    // Also get valid clubs for active sport context to prevent displaying cross-sport clubs
    let validSportClubNamesSet = new Set();
    if (sportParam && sportParam !== "all" && sportParam !== "other-sports") {
      const sportPattern = sportParam.toLowerCase().trim().replace(/-/g, "[ -]?");
      const validSportClubs = await Club.find({
        sport: new RegExp(`^${sportPattern}$`, "i"),
      }).select("clubName");
      validSportClubNamesSet = new Set(validSportClubs.map((c) => c.clubName));
    }

    const formattedPlayers = users.map((u, idx) => {
      const uIdStr = String(u._id);
      const name = getPlayerName(u);
      
      const calcRating = u.rating || 1200;
      const calcGames = u.gamesPlayed || 0;
      const calcWins = u.wins || 0;
      const calcLosses = u.losses || 0;

      let clubName = u.club || "Standalone / Unaffiliated";
      if (
        validSportClubNamesSet.size > 0 &&
        clubName !== "Standalone / Unaffiliated" &&
        !validSportClubNamesSet.has(clubName)
      ) {
        clubName = "Standalone / Unaffiliated";
      }

      const leagueName = leagueMap[uIdStr] || (u.leagueName && (!sportParam || sportParam === "all" || u.leagueName.toLowerCase().includes(sportParam.toLowerCase())) ? u.leagueName : "Standalone League");
      const playerSport = u.interestedSport || (sportParam !== "all" ? sportParam : "");
      const typeCode = getTypeCodeForSport(playerSport);

      return {
        id: u._id,
        rank: skip + idx + 1,
        name,
        email: u.email,
        rating: calcRating,
        gamesPlayed: calcGames,
        wins: calcWins,
        losses: calcLosses,
        club: clubName,
        league: leagueName,
        interestedSport: playerSport,
        type: typeCode,
        typeCode: typeCode,
        city: u.city || "",
        state: u.state || "",
        country: u.country || "",
        profilePhoto: u.profilePhoto || "",
        createdAt: u.createdAt,
      };
    });

    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.status(200).json({
      success: true,
      sport: sportParam,
      count: totalCount,
      page,
      limit,
      totalPages,
      players: formattedPlayers,
    });
  } catch (error) {
    console.error("Fetch players error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch players data",
    });
  }
};

// Routes
// GET /api/players
router.get("/", (req, res) => fetchPlayersHandler(req, res));

// GET /api/players/profile/:id
router.get("/profile/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Player profile not found",
      });
    }

    const leaguesJoined = await League.find({
      $or: [
        { _id: user.leagueId },
        { createdByUserId: user._id },
        { "joinedUsers.userId": user._id },
      ],
    }).select("leagueName sport type tournamentStartDate tournamentEndDate");

    const rating = user.rating || 1200;
    const gamesPlayed = user.gamesPlayed || 0;
    const wins = user.wins || 0;
    const losses = user.losses || 0;
    const club = user.club || "Standalone / Unaffiliated";

    res.status(200).json({
      success: true,
      player: {
        id: user._id,
        name: getPlayerName(user),
        email: user.email,
        city: user.city || "Hyderabad",
        state: user.state || "Telangana",
        country: user.country || "India",
        interestedSport: user.interestedSport || "Badminton",
        typeCode: getTypeCodeForSport(user.interestedSport || "Badminton"),
        experience: user.experience || "Intermediate",
        rating,
        gamesPlayed,
        wins,
        losses,
        winRate: gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0,
        club,
        profilePhoto: user.profilePhoto || "",
        socialMediaLinks: user.socialMediaLinks || "",
        createdAt: user.createdAt,
        leagues: leaguesJoined.map((l) => ({
          id: l._id,
          leagueName: l.leagueName,
          sport: l.sport,
          type: l.type,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch player profile",
    });
  }
});

// GET /api/players/:sport
router.get("/:sport", (req, res) => fetchPlayersHandler(req, res));

// GET /api/players/:sport/club/:clubId
router.get("/:sport/club/:clubId", (req, res) =>
  fetchPlayersHandler(req, res, { clubId: req.params.clubId })
);

// GET /api/players/:sport/league/:leagueId
router.get("/:sport/league/:leagueId", (req, res) =>
  fetchPlayersHandler(req, res, { leagueId: req.params.leagueId })
);

module.exports = router;

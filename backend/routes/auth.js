const express = require("express");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const League = require("../models/League");
const Club = require("../models/Club");
const { protect } = require("../middleware/auth");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const getDisplayUsername = (user) => {
  if (!user) return "Unknown User";

  const fullName = String(user.fullName || "").trim();
  if (fullName) return fullName;

  const composedName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return composedName || "Unknown User";
};

const mapLeagueForUser = (league, currentUserId) => {
  const userId = String(currentUserId || "");
  const isCreator = String(league.createdByUserId) === userId;
  const hasJoinedFromMembers = Array.isArray(league.joinedUsers)
    && league.joinedUsers.some((member) => String(member.userId) === userId);
  const isOnWaitingList = Array.isArray(league.waitingList)
    && league.waitingList.some((member) => String(member.userId) === userId);
  const joinedUsers = Array.isArray(league.joinedUsers)
    ? league.joinedUsers.map((member) => ({
      userId: member.userId,
      username: member.username,
      email: member.email,
      joinedAt: member.joinedAt,
    }))
    : [];
  const waitingList = Array.isArray(league.waitingList)
    ? league.waitingList.map((member) => ({
      userId: member.userId,
      username: member.username,
      email: member.email,
      joinedAt: member.joinedAt,
      status: member.status || "WAITING",
    }))
    : [];

  const maximumTeams = league.maximumTeams || 0;
  const confirmedCount = joinedUsers.length;
  const waitingCount = waitingList.length;
  const remainingSlots = Math.max(0, maximumTeams - confirmedCount);

  return {
    id: league._id,
    leagueName: league.leagueName,
    sport: league.sport,
    type: league.type,
    numberOfCourts: league.numberOfCourts || 1,
    matchDurationMinutes: league.matchDurationMinutes || 0,
    maximumTeams,
    registrationStartDate: league.registrationStartDate,
    registrationEndDate: league.registrationEndDate,
    tournamentStartDate: league.tournamentStartDate,
    tournamentEndDate: league.tournamentEndDate,
    entryFee: league.entryFee,
    eventType: league.eventType || "",
    createdByUsername: league.createdByUsername,
    createdByEmail: league.createdByEmail,
    joinedCount: confirmedCount,
    joinedUsers,
    confirmedCount,
    waitingList,
    waitingCount,
    remainingSlots,
    hasJoined: isCreator || hasJoinedFromMembers,
    isWaiting: isOnWaitingList,
    createdAt: league.createdAt,
  };
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post("/signup", async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, confirm } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required",
      });
    }

    if (password !== confirm) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create new user
    const user = await User.create({
      firstName,
      middleName: middleName || "",
      lastName,
      email: email.toLowerCase(),
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during signup",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not registered",
      });
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred during login",
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.status(200).json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // In a real application, you would:
    // 1. Generate a reset token
    // 2. Save it to the user model with expiration
    // 3. Send an email with the reset link
    // For now, we'll just return success

    res.status(200).json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      firstName: req.user.firstName,
      middleName: req.user.middleName || "",
      lastName: req.user.lastName,
      email: req.user.email,
      fullName: req.user.fullName || "",
      gender: req.user.gender || "",
      dob: req.user.dob,
      age: req.user.age,
      mobileNumber: req.user.mobileNumber || "",
      city: req.user.city || "",
      state: req.user.state || "",
      country: req.user.country || "",
      countryCode: req.user.countryCode || "",
      interestedSport: req.user.interestedSport || "",
      experience: req.user.experience || "",
      socialMediaLinks: req.user.socialMediaLinks || "",
      profilePhoto: req.user.profilePhoto || "",
      sportsSkills: req.user.sportsSkills || {},
      createdAt: req.user.createdAt,
    },
  });
});

// @route   GET /api/auth/users
// @desc    Get all registered users with leaderboard ranks
// @access  Private
router.get("/users", protect, async (req, res) => {
  try {
    const users = await User.find({})
      .select("firstName middleName lastName fullName createdAt")
      .sort({ createdAt: -1 });

    const rankedUsers = users.map((user, index) => ({
      id: user._id,
      name: user.fullName || [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      users: rankedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch registered users",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current logged in user profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const {
      email,
      fullName,
      gender,
      dob,
      age,
      mobileNumber,
      city,
      state,
      country,
      countryCode,
      interestedSport,
      experience,
      socialMediaLinks,
      profilePhoto,
      sportsSkills,
      isSkillUpdate,
    } = req.body;

    const loggedInEmail = (req.user.email || "").toLowerCase();
    const providedEmail = (email || "").toLowerCase();

    if (!providedEmail || providedEmail !== loggedInEmail) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized profile update attempt",
      });
    }

    if (!isSkillUpdate) {
      const requiredFields = [fullName, gender, dob, age, city, state, country, interestedSport, experience];
      if (requiredFields.some((value) => !String(value ?? "").trim())) {
        return res.status(400).json({
          success: false,
          message: "Please fill all mandatory fields.",
        });
      }
    }

    const updateData = {
      fullName: String(fullName || "").trim(),
      gender: String(gender || "").trim(),
      dob: dob ? new Date(dob) : req.user.dob,

      age: Number(age),
      mobileNumber: String(mobileNumber || "").trim(),
      city: String(city || "").trim(),
      state: String(state || "").trim(),
      country: String(country || "").trim(),
      countryCode: String(countryCode || "").trim(),
      interestedSport: String(interestedSport || "").trim(),
      experience: String(experience || "").trim(),
      socialMediaLinks: String(socialMediaLinks || "").trim(),
      ...(String(profilePhoto || "").trim() ? { profilePhoto: String(profilePhoto).trim() } : {}),
    };

    const updatedUser = await User.findOneAndUpdate(
      { email: loggedInEmail },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        middleName: updatedUser.middleName || "",
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        fullName: updatedUser.fullName || "",
        gender: updatedUser.gender || "",
        dob: updatedUser.dob,
        age: updatedUser.age,
        mobileNumber: updatedUser.mobileNumber || "",
        city: updatedUser.city || "",
        state: updatedUser.state || "",
        country: updatedUser.country || "",
        countryCode: updatedUser.countryCode || "",
        interestedSport: updatedUser.interestedSport || "",
        experience: updatedUser.experience || "",
        socialMediaLinks: updatedUser.socialMediaLinks || "",
        profilePhoto: updatedUser.profilePhoto || "",
        sportsSkills: updatedUser.sportsSkills || {},
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating profile",
    });
  }
});

// @route   POST /api/auth/leagues
// @desc    Create a league for the current user
// @access  Private
router.post("/leagues", protect, async (req, res) => {
  try {
    const { leagueName, sport, type, numberOfCourts, matchDurationMinutes, maximumTeams, registrationStartDate, registrationEndDate, tournamentStartDate, tournamentEndDate, entryFee, eventType } = req.body;

    const trimmedLeagueName = String(leagueName || "").trim();
    const normalizedSport = String(sport || "").trim().toLowerCase();
    const normalizedType = String(type || "").trim().toLowerCase();

    if (!trimmedLeagueName || !normalizedSport || !normalizedType) {
      return res.status(400).json({
        success: false,
        message: "League name, sport, and type are required",
      });
    }

    if (!["single", "doubles"].includes(normalizedType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be either single or doubles",
      });
    }

    // Validate tournament capacity fields
    const parsedCourts = Number(numberOfCourts);
    const parsedDuration = Number(matchDurationMinutes);
    const parsedMaxTeams = Number(maximumTeams);

    if (!Number.isInteger(parsedCourts) || parsedCourts < 1 || parsedCourts > 4) {
      return res.status(400).json({
        success: false,
        message: "Number of courts must be between 1 and 4",
      });
    }

    if (!Number.isInteger(parsedDuration) || parsedDuration < 5 || parsedDuration > 180) {
      return res.status(400).json({
        success: false,
        message: "Match duration must be between 5 and 180 minutes",
      });
    }

    if (!Number.isInteger(parsedMaxTeams) || parsedMaxTeams < 2 || parsedMaxTeams > 500) {
      return res.status(400).json({
        success: false,
        message: "Maximum teams must be between 2 and 500",
      });
    }

    if (!registrationStartDate || !registrationEndDate || !tournamentStartDate || !tournamentEndDate || !entryFee) {
      return res.status(400).json({
        success: false,
        message: "All date fields and entry fee are required",
      });
    }

    const regStartDate = new Date(registrationStartDate);
    const regEndDate = new Date(registrationEndDate);
    const tourStartDate = new Date(tournamentStartDate);
    const tourEndDate = new Date(tournamentEndDate);

    if (regStartDate >= regEndDate) {
      return res.status(400).json({
        success: false,
        message: "Registration start date must be before end date",
      });
    }

    if (tourStartDate >= tourEndDate) {
      return res.status(400).json({
        success: false,
        message: "Tournament start date must be before end date",
      });
    }

    const createdLeague = await League.create({
      leagueName: trimmedLeagueName,
      sport: normalizedSport,
      type: normalizedType,
      numberOfCourts: parsedCourts,
      matchDurationMinutes: parsedDuration,
      maximumTeams: parsedMaxTeams,
      registrationStartDate: regStartDate,
      registrationEndDate: regEndDate,
      tournamentStartDate: tourStartDate,
      tournamentEndDate: tourEndDate,
      entryFee: String(entryFee || "").trim(),
      eventType: String(eventType || "").trim(),
      createdByUserId: req.user._id,
      createdByUsername: getDisplayUsername(req.user),
      createdByEmail: String(req.user.email || "").toLowerCase(),
      joinedUsers: [
        {
          userId: req.user._id,
          username: getDisplayUsername(req.user),
          email: String(req.user.email || "").toLowerCase(),
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "League created successfully",
      league: mapLeagueForUser(createdLeague, req.user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create league",
    });
  }
});

// @route   GET /api/auth/leagues
// @desc    Get all leagues
// @access  Private
router.get("/leagues", protect, async (req, res) => {
  try {
    const leagues = await League.find({})
      .sort({ createdAt: -1 });

    const formattedLeagues = leagues.map((league) => mapLeagueForUser(league, req.user._id));

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

// @route   POST /api/auth/leagues/:leagueId/join
// @desc    Join a league
// @access  Private
router.post("/leagues/:leagueId/join", protect, async (req, res) => {
  try {
    const { leagueId } = req.params;
    const league = await League.findById(leagueId);

    if (!league) {
      return res.status(404).json({
        success: false,
        message: "League not found",
      });
    }

    const userIdStr = String(req.user._id);
    const isCreator = String(league.createdByUserId) === userIdStr;
    const alreadyJoined = Array.isArray(league.joinedUsers)
      && league.joinedUsers.some((member) => String(member.userId) === userIdStr);
    const alreadyOnWaitingList = Array.isArray(league.waitingList)
      && league.waitingList.some((member) => String(member.userId) === userIdStr);

    if (isCreator || alreadyJoined) {
      return res.status(200).json({
        success: true,
        message: "Already joined this league",
        league: mapLeagueForUser(league, req.user._id),
      });
    }

    if (alreadyOnWaitingList) {
      return res.status(200).json({
        success: true,
        message: "Already on the waiting list for this league",
        league: mapLeagueForUser(league, req.user._id),
      });
    }

    const confirmedCount = Array.isArray(league.joinedUsers) ? league.joinedUsers.length : 0;
    const maxTeams = league.maximumTeams || 0;

    if (maxTeams > 0 && confirmedCount >= maxTeams) {
      // League is full — add to waiting list
      const waitingMember = {
        userId: req.user._id,
        username: getDisplayUsername(req.user),
        email: String(req.user.email || "").toLowerCase(),
        status: "WAITING",
      };

      await League.updateOne(
        { _id: league._id },
        { $push: { waitingList: waitingMember } }
      );

      league.waitingList.push(waitingMember);

      return res.status(200).json({
        success: true,
        message: "League is full. You have been added to the waiting list.",
        league: mapLeagueForUser(league, req.user._id),
      });
    }

    // Slots available — add as confirmed participant
    const confirmedMember = {
      userId: req.user._id,
      username: getDisplayUsername(req.user),
      email: String(req.user.email || "").toLowerCase(),
    };

    await League.updateOne(
      { _id: league._id },
      { $push: { joinedUsers: confirmedMember } }
    );

    league.joinedUsers.push(confirmedMember);

    res.status(200).json({
      success: true,
      message: "Joined league successfully",
      league: mapLeagueForUser(league, req.user._id),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to join league",
    });
  }
});

// @route   GET /api/auth/dashboard/stats
// @desc    Get authenticated user's personal dashboard statistics
// @access  Private
router.get("/dashboard/stats", protect, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    // Read stats directly from the user document
    const gamesPlayed = user.gamesPlayed || 0;
    const wins = user.wins || 0;
    const losses = user.losses || 0;
    const rating = user.rating || 1200;
    const winRate = gamesPlayed > 0
      ? Math.round((wins / gamesPlayed) * 1000) / 10
      : 0;

    // Count leagues the user has joined or created
    const leaguesJoined = await League.countDocuments({
      $or: [
        { createdByUserId: userId },
        { "joinedUsers.userId": userId },
      ],
    });

    // Build display name
    const displayName = getDisplayUsername(user);

    res.status(200).json({
      success: true,
      stats: {
        displayName,
        gamesPlayed,
        wins,
        losses,
        winRate,
        rating,
        leaguesJoined,
        club: user.club || "Standalone / Unaffiliated",
        interestedSport: user.interestedSport || "",
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard statistics",
    });
  }
});

// @route   GET /api/auth/dashboard/sport-stats
// @desc    Get authenticated user's sport-wise statistics
// @access  Private
router.get("/dashboard/sport-stats", protect, async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;

    // 1. Determine all enrolled sports from Leagues
    const leagues = await League.find({
      $or: [
        { createdByUserId: userId },
        { "joinedUsers.userId": userId }
      ]
    }).select("sport leagueName _id");

    const leagueSports = leagues.map(l => (l.sport || "").toLowerCase().trim()).filter(Boolean);
    
    // 2. Add interestedSport if it exists
    const primarySport = (user.interestedSport || "").toLowerCase().trim();
    const enrolledSet = new Set(leagueSports);
    if (primarySport && primarySport !== "all") {
      enrolledSet.add(primarySport);
    }
    
    // 3. Fetch user club if exists
    let userClub = null;
    if (user.clubId) {
      userClub = await Club.findById(user.clubId);
    } else if (user.club && user.club !== "Standalone / Unaffiliated") {
      userClub = await Club.findOne({ clubName: user.club });
    }
    
    // 4. Construct sport-wise stats
    const sportsStats = Array.from(enrolledSet).map(sportName => {
      // Get leagues for this sport
      const sportLeagues = leagues
        .filter(l => (l.sport || "").toLowerCase().trim() === sportName)
        .map(l => ({ id: l._id, name: l.leagueName }));
        
      // Get clubs for this sport
      let sportClubs = [];
      if (userClub && (userClub.sport || "").toLowerCase().trim() === sportName) {
         sportClubs.push({ id: userClub._id, name: userClub.clubName });
      }
      
      if (Array.isArray(user.joinedClubs)) {
        user.joinedClubs.forEach(club => {
          if ((club.sport || "").toLowerCase().trim() === sportName) {
            if (!sportClubs.find(c => String(c.id) === String(club.clubId))) {
              sportClubs.push({ id: club.clubId, name: club.clubName });
            }
          }
        });
      }
      
      const sportLeaguesCount = sportLeagues.length;
      
      // Global stats only apply to the primary sport to avoid merging/duplication
      const isPrimary = (sportName === primarySport);
      const gamesPlayed = isPrimary ? (user.gamesPlayed || 0) : 0;
      const wins = isPrimary ? (user.wins || 0) : 0;
      const losses = isPrimary ? (user.losses || 0) : 0;
      const rating = user.rating || 1200; // Rating is globally explicitly defined
      
      const winRate = gamesPlayed > 0 
        ? Math.round((wins / gamesPlayed) * 1000) / 10 
        : 0;

      return {
        sport: sportName,
        leagues: sportLeagues,
        clubs: sportClubs,
        gamesPlayed,
        wins,
        losses,
        winRate,
        rating,
        leaguesJoined: sportLeaguesCount
      };
    });

    res.status(200).json({
      success: true,
      sports: sportsStats
    });
  } catch (error) {
    console.error("Sport stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sport-wise statistics"
    });
  }
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/signup` }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = generateToken(req.user._id);

      // Redirect to frontend with token
      res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
    } catch (error) {
      console.error('Google auth callback error:', error);
      res.redirect(`${FRONTEND_URL}/signup?error=auth_failed`);
    }
  }
);

module.exports = router;

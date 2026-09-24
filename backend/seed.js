const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const League = require("./models/League");
const Club = require("./models/Club");

const demoData = [
  // BADMINTON
  {
    sport: "badminton",
    sportDisplay: "Badminton",
    leagues: [
      {
        code: "PSB",
        leagueName: "Potti Sreeramulu Badminton League",
        clubs: ["PSB Smashers", "PSB Racqueteers", "PSB Eagles"],
      },
      {
        code: "BRB",
        leagueName: "Dr. B.R. Ambedkar Badminton League",
        clubs: ["BRB Strikers", "BRB Shuttlers", "BRB Aces"],
      },
      {
        code: "ASR",
        leagueName: "Alluri Sitarama Raju Badminton League",
        clubs: ["ASR Thunder", "ASR Falcons", "ASR Champions"],
      },
    ],
  },
  // CRICKET
  {
    sport: "cricket",
    sportDisplay: "Cricket",
    leagues: [
      {
        code: "MGC",
        leagueName: "Mahatma Gandhi Cricket League",
        clubs: ["MGC Warriors", "MGC Titans", "MGC Challengers"],
      },
      {
        code: "SCC",
        leagueName: "Subhash Chandra Bose Cricket League",
        clubs: ["SCC Tigers", "SCC Superstars", "SCC Riders"],
      },
      {
        code: "BSC",
        leagueName: "Bhagat Singh Cricket League",
        clubs: ["BSC Lions", "BSC Panthers", "BSC Kings"],
      },
    ],
  },
  // VOLLEYBALL
  {
    sport: "volleyball",
    sportDisplay: "Volleyball",
    leagues: [
      {
        code: "NTV",
        leagueName: "NTR Volleyball League",
        clubs: ["NTV Spikers", "NTV Blasters", "NTV Blockers"],
      },
      {
        code: "AKV",
        leagueName: "Abdul Kalam Volleyball League",
        clubs: ["AKV Serves", "AKV Smashers", "AKV Defenders"],
      },
      {
        code: "SVL",
        leagueName: "Sarvepalli Volleyball League",
        clubs: ["SVL Warriors", "SVL Giants", "SVL Heroes"],
      },
    ],
  },
];

async function seedData() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
    console.log("Starting VINISPORT Idempotent Demo Seeder...");

    // Fix existing leagues that might be missing newly required fields
    await League.updateMany(
      { $or: [ { maximumTeams: { $exists: false } }, { maximumTeams: null } ] },
      { $set: { maximumTeams: 30 } }
    );
    await League.updateMany(
      { $or: [ { matchDurationMinutes: { $exists: false } }, { matchDurationMinutes: null } ] },
      { $set: { matchDurationMinutes: 45 } }
    );

    // 1. Get or Create Admin System User
    let admin = await User.findOne({ email: "vinisportadmin@gmail.com" });
    if (!admin) {
      admin = await User.create({
        firstName: "VINISPORT",
        lastName: "Admin",
        fullName: "VINISPORT Official Admin",
        email: "vinisportadmin@gmail.com",
        password: "admin@123",
        interestedSport: "all",
      });
      console.log("Created system admin user.");
    }

    let createdLeaguesCount = 0;
    let createdClubsCount = 0;
    let createdPlayersCount = 0;

    const defaultPlayerPassword = "player123";

    // 2. Iterate through demo data structure
    for (const group of demoData) {
      const sportKey = group.sport;
      const sportName = group.sportDisplay;

      for (const leagueDef of group.leagues) {
        const code = leagueDef.code;
        const leagueName = leagueDef.leagueName;

        // Check if League already exists
        let league = await League.findOne({ leagueName });
        
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + 90);
        
        if (!league) {
          league = await League.create({
            leagueName,
            sport: sportKey,
            type: "single",
            numberOfCourts: 2,
            matchDurationMinutes: 45,
            maximumTeams: 30,
            registrationStartDate: startDate,
            registrationEndDate: endDate,
            tournamentStartDate: startDate,
            tournamentEndDate: endDate,
            entryFee: "Free",
            createdByUserId: admin._id,
            createdByUsername: admin.fullName || "VINISPORT Admin",
            createdByEmail: admin.email,
            joinedUsers: [],
          });
          createdLeaguesCount++;
        }

        // Create Clubs for this League
        const createdClubDocs = [];
        for (const clubName of leagueDef.clubs) {
          let club = await Club.findOne({ clubName });
          if (!club) {
            club = await Club.create({
              clubName,
              sport: sportKey,
              leagueId: league._id,
              leagueName: league.leagueName,
            });
            createdClubsCount++;
          }
          createdClubDocs.push(club);
        }

        // Create 10 Players for this League
        for (let i = 1; i <= 10; i++) {
          const playerName = `${code} Player ${i}`;
          const email = `${code.toLowerCase()}player${i}@gmail.com`;
          const assignedClub = createdClubDocs[(i - 1) % createdClubDocs.length];

          let player = await User.findOne({ email });
          if (!player) {
            const games = 10 + (i * 3);
            const wins = Math.floor(games * (0.5 + (i % 4) * 0.1));
            const losses = Math.max(0, games - wins);
            const rating = 1200 + (i * 25);

            player = await User.create({
              firstName: `${code} Player`,
              lastName: `${i}`,
              fullName: playerName,
              email,
              password: defaultPlayerPassword,
              interestedSport: sportName,
              club: assignedClub ? assignedClub.clubName : "Standalone / Unaffiliated",
              clubId: assignedClub ? assignedClub._id : null,
              leagueId: league._id,
              leagueName: league.leagueName,
              rating,
              gamesPlayed: games,
              wins,
              losses,
              city: "Hyderabad",
              state: "Telangana",
              country: "India",
            });
            createdPlayersCount++;
          }

          // Ensure player is in league joinedUsers list
          const alreadyJoined = Array.isArray(league.joinedUsers) &&
            league.joinedUsers.some((m) => String(m.userId) === String(player._id));

          if (!alreadyJoined) {
            league.joinedUsers.push({
              userId: player._id,
              username: player.fullName || player.email,
              email: player.email,
              joinedAt: new Date(),
            });
            await league.save();
          }
        }
      }
    }

    // 3. Create All Sport Demo User
    const demoEmail = "allsport@gmail.com";
    let demoUser = await User.findOne({ email: demoEmail });
    if (!demoUser) {
      demoUser = await User.create({
        firstName: "All Sport",
        lastName: "Player",
        fullName: "All Sport Player",
        email: demoEmail,
        password: defaultPlayerPassword,
        interestedSport: "all",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        joinedClubs: [],
      });
      console.log("Created All Sport Demo User.");
    }

    // 4. Enroll Demo User in ALL leagues and 1 valid club per league
    const allLeagues = await League.find({});
    for (const league of allLeagues) {
      // Find one valid club for this league
      const club = await Club.findOne({ leagueId: league._id });

      // Enroll in League if not joined
      const alreadyJoinedLeague = Array.isArray(league.joinedUsers) &&
        league.joinedUsers.some((m) => String(m.userId) === String(demoUser._id));

      if (!alreadyJoinedLeague) {
        league.joinedUsers.push({
          userId: demoUser._id,
          username: demoUser.fullName || demoUser.email,
          email: demoUser.email,
          joinedAt: new Date(),
        });
        await league.save();
      }

      // Assign to Club if found and not assigned
      if (club) {
        if (!demoUser.joinedClubs) demoUser.joinedClubs = [];
        const alreadyJoinedClub = demoUser.joinedClubs.some(
          (c) => String(c.clubId) === String(club._id)
        );

        if (!alreadyJoinedClub) {
          demoUser.joinedClubs.push({
            clubId: club._id,
            clubName: club.clubName,
            sport: club.sport,
            joinedAt: new Date(),
          });
          
          // For legacy compatibility
          if (!demoUser.clubId || demoUser.club === "Standalone / Unaffiliated") {
            demoUser.clubId = club._id;
            demoUser.club = club.clubName;
          }
        }
      }
    }
    
    // Save demo user to persist joinedClubs changes
    await demoUser.save();
    console.log("Processed all leagues and clubs for demo user.");

    console.log(`Seeding complete. Created ${createdLeaguesCount} new leagues, ${createdClubsCount} new clubs, ${createdPlayersCount} new players.`);
    return { success: true, createdLeaguesCount, createdClubsCount, createdPlayersCount };
  } catch (err) {
    console.error("Seeding error:", err);
    return { success: false, error: err.message };
  }
}

if (require.main === module) {
  seedData().then(() => mongoose.disconnect());
}

module.exports = seedData;

const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const League = require("./models/League");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: "allsport@gmail.com" });
  const userId = user._id;

  const leagues = await League.find({
    $or: [
      { createdByUserId: userId },
      { "joinedUsers.userId": userId }
    ]
  }).select("sport leagueName _id");

  const leagueSports = leagues.map(l => (l.sport || "").toLowerCase().trim()).filter(Boolean);
  const primarySport = (user.interestedSport || "").toLowerCase().trim();
  const enrolledSet = new Set(leagueSports);
  if (primarySport && primarySport !== "all") {
    enrolledSet.add(primarySport);
  }

  console.log("League Sports Array:", leagueSports);
  console.log("Primary Sport:", primarySport);
  console.log("Enrolled Set Array:", Array.from(enrolledSet));

  const sportsStats = Array.from(enrolledSet).map(sportName => {
      const stats = (user.sportStats && user.sportStats[sportName]) ? user.sportStats[sportName] : null;
      return { sport: sportName, stats };
  });

  console.log("sportsStats output:", JSON.stringify(sportsStats, null, 2));

  process.exit(0);
}

check();

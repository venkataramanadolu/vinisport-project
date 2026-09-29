const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function seedAllsportStats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const email = "allsport@gmail.com";
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User allsport@gmail.com not found. Please run seed.js first.");
      process.exit(1);
    }

    user.sportStats = {
      badminton: { gamesPlayed: 20, wins: 14, losses: 6, rating: 1560 },
      volleyball: { gamesPlayed: 16, wins: 10, losses: 6, rating: 1480 },
      cricket: { gamesPlayed: 18, wins: 12, losses: 6, rating: 1510 },
      tennis: { gamesPlayed: 15, wins: 9, losses: 6, rating: 1430 }
    };

    // Calculate globals safely so we maintain consistency
    let totalGames = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let totalRating = 0;
    
    for (const sport in user.sportStats) {
      totalGames += user.sportStats[sport].gamesPlayed;
      totalWins += user.sportStats[sport].wins;
      totalLosses += user.sportStats[sport].losses;
      totalRating += user.sportStats[sport].rating;
    }
    
    user.gamesPlayed = totalGames;
    user.wins = totalWins;
    user.losses = totalLosses;
    user.rating = Math.round(totalRating / 4);

    await user.save();
    console.log("Successfully seeded sport-specific stats for allsport@gmail.com.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding stats:", error);
    process.exit(1);
  }
}

seedAllsportStats();

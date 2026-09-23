const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    clubName: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
    },
    sport: {
      type: String,
      required: [true, "Sport is required"],
      lowercase: true,
      trim: true,
    },
    leagueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "League",
      default: null,
    },
    leagueName: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    collection: "clubs",
    timestamps: true,
  }
);

module.exports = mongoose.model("Club", clubSchema);

const mongoose = require("mongoose");

const leagueSchema = new mongoose.Schema(
  {
    leagueName: {
      type: String,
      required: [true, "League name is required"],
      trim: true,
    },
    sport: {
      type: String,
      required: [true, "Sport is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["single", "doubles"],
      lowercase: true,
      trim: true,
    },
    numberOfCourts: {
      type: Number,
      default: 1,
      min: [1, "Minimum 1 court is required"],
      max: [4, "Maximum 4 courts are allowed"],
    },
    matchDurationMinutes: {
      type: Number,
      required: [true, "Match duration is required"],
      min: [5, "Minimum match duration is 5 minutes"],
      max: [180, "Maximum match duration is 180 minutes"],
    },
    maximumTeams: {
      type: Number,
      required: [true, "Maximum teams is required"],
      min: [2, "Minimum 2 teams are required"],
      max: [500, "Maximum 500 teams are allowed"],
    },
    registrationStartDate: {
      type: Date,
      required: [true, "Registration start date is required"],
    },
    registrationEndDate: {
      type: Date,
      required: [true, "Registration end date is required"],
    },
    tournamentStartDate: {
      type: Date,
      required: [true, "Tournament start date is required"],
    },
    tournamentEndDate: {
      type: Date,
      required: [true, "Tournament end date is required"],
    },
    entryFee: {
      type: String,
      required: [true, "Entry fee is required"],
      trim: true,
    },
    eventType: {
      type: String,
      trim: true,
      default: "",
    },
    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByUsername: {
      type: String,
      required: true,
      trim: true,
    },
    createdByEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    joinedUsers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    waitingList: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        username: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          default: "WAITING",
          trim: true,
        },
      },
    ],
  },
  {
    collection: "league",
    timestamps: true,
  }
);

module.exports = mongoose.model("League", leagueSchema);

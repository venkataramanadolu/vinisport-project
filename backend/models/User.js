const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
      default: "",
    },
    lastName: {
      type: String,
      // required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|aol\.com|protonmail\.com|zoho\.com)$/i,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password required only if not Google user
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    dob: {
      type: Date,
      default: null,
    },
    age: {
      type: Number,
      default: null,
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    state: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    countryCode: {
      type: String,
      trim: true,
      default: "",
    },
    interestedSport: {
      type: String,
      trim: true,
      default: "",
    },
    experience: {
      type: String,
      trim: true,
      default: "",
    },
    socialMediaLinks: {
      type: String,
      trim: true,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    club: {
      type: String,
      trim: true,
      default: "Standalone / Unaffiliated",
    },
    clubId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      default: null,
    },
    joinedClubs: [
      {
        clubId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Club",
          required: true,
        },
        clubName: {
          type: String,
          required: true,
          trim: true,
        },
        sport: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
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
    rating: {
      type: Number,
      default: 1200,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    sportsSkills: {
      type: Object,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) {
    return false; // Google users don't have passwords
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

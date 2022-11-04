const mongoose = require("mongoose");

// Creating band Schema
const bandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    userid: {
      // type: String,
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// creating new band model and exporting it
const Bands = new mongoose.model("Band", bandSchema);

module.exports = Bands;

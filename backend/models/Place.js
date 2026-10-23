const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    latitude: Number,
    longitude: Number,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Place", placeSchema);

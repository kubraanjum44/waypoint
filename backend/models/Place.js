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
    },
    location: {
      type: String,
      required: true,
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
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Place", placeSchema);

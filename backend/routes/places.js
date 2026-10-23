const express = require("express");
const mongoose = require("mongoose");
const Place = require("../models/Place");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Public: browse all destinations.
router.get("/", async (req, res) => {
  try {
    const places = await Place.find()
      .populate("owner", "name")
      .sort({ createdAt: -1 });

    return res.json(places);
  } catch (error) {
    console.error("Fetch places failed:", error.message);
    return res.status(500).json({ message: "Failed to fetch places." });
  }
});

// Public: view one destination.
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid place ID." });
    }

    const place = await Place.findById(id).populate("owner", "name");

    if (!place) {
      return res.status(404).json({ message: "Place not found." });
    }

    return res.json(place);
  } catch (error) {
    console.error("Fetch place failed:", error.message);
    return res.status(500).json({ message: "Failed to fetch place." });
  }
});

// Protected: only a logged-in user can create a destination.
// Ownership is assigned from the verified JWT, never from req.body.
router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      category,
      imageUrl,
      latitude,
      longitude,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof location !== "string" ||
      !name.trim() ||
      !description.trim() ||
      !location.trim()
    ) {
      return res.status(400).json({
        message: "Name, description, and location are required.",
      });
    }

    if (
      (latitude !== undefined &&
        (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
      (longitude !== undefined &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
    ) {
      return res.status(400).json({ message: "Invalid map coordinates." });
    }

    if ((latitude === undefined) !== (longitude === undefined)) {
      return res.status(400).json({
        message: "Provide both latitude and longitude, or leave both blank.",
      });
    }

    const savedPlace = await Place.create({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      category,
      imageUrl: typeof imageUrl === "string" ? imageUrl : "",
      latitude,
      longitude,
      owner: req.userId,
    });

    return res.status(201).json(savedPlace);
  } catch (error) {
    console.error("Create place failed:", error.message);
    return res.status(500).json({ message: "Failed to create place." });
  }
});

// Protected: only the owner can edit their destination.
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid place ID." });
    }

    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ message: "Place not found." });
    }

    if (!place.owner || place.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only edit destinations you created.",
      });
    }

    const {
      name,
      description,
      location,
      category,
      imageUrl,
      latitude,
      longitude,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof location !== "string" ||
      !name.trim() ||
      !description.trim() ||
      !location.trim()
    ) {
      return res.status(400).json({
        message: "Name, description, and location are required.",
      });
    }

    if (
      (latitude !== undefined &&
        (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) ||
      (longitude !== undefined &&
        (!Number.isFinite(longitude) || longitude < -180 || longitude > 180))
    ) {
      return res.status(400).json({ message: "Invalid map coordinates." });
    }

    if ((latitude === undefined) !== (longitude === undefined)) {
      return res.status(400).json({
        message: "Provide both latitude and longitude, or leave both blank.",
      });
    }

    place.name = name.trim();
    place.description = description.trim();
    place.location = location.trim();
    place.category = category || "Other";
    if (typeof imageUrl === "string") place.imageUrl = imageUrl;
    place.latitude = latitude;
    place.longitude = longitude;

    await place.save();
    return res.json(place);
  } catch (error) {
    console.error("Update place failed:", error.message);
    return res.status(500).json({ message: "Failed to update place." });
  }
});

// Protected: only the owner can delete their destination.
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid place ID." });
    }

    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({ message: "Place not found." });
    }

    if (!place.owner || place.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "You can only delete destinations you created.",
      });
    }

    await place.deleteOne();
    return res.json({ message: "Place deleted successfully." });
  } catch (error) {
    console.error("Delete place failed:", error.message);
    return res.status(500).json({ message: "Failed to delete place." });
  }
});

module.exports = router;

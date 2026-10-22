const express = require("express");

const Place = require("../models/Place");

const router = express.Router();

// GET: Get all places
router.get("/", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch places" });
  }
});

const mongoose = require("mongoose");

// GET: Get one place by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid place ID",
      });
    }

    const place = await Place.findById(id);

    if (!place) {
      return res.status(404).json({
        message: "Place not found",
      });
    }

    res.json(place);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch place",
    });
  }
});


// POST: Create a new place
router.post("/", async (req, res) => {
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

    if (!name || !description || !location) {
      return res.status(400).json({
        message: "Name, description and location are required",
      });
    }

    const newPlace = new Place({
      name,
      description,
      location,
      category,
      imageUrl,
      latitude,
      longitude,
    });

    const savedPlace = await newPlace.save();

    res.status(201).json(savedPlace);
  } catch (error) {
    res.status(500).json({ message: "Failed to create place" });
  }
});

module.exports = router;

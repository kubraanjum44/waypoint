
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
const placeRoutes = require("./routes/places");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/places", placeRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to Waypoint API!");
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Waypoint server is running!",
  });
});

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Waypoint server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();

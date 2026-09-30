// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Load environment variables from the .env file
require("dotenv").config();

// Import authentication routes for register and login APIs
const authRoutes = require("./routes/authRoutes");

// Import Room routes for Room CRUD operations
const roomRoutes = require("./routes/roomRoutes");

// Import Booking routes for Booking CRUD operations
const bookingRoutes = require("./routes/bookingRoutes");

// Create the Express application
const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

// Allow requests from other applications such as our mobile app
app.use(cors());

// Allow Express to read JSON data sent in request bodies
app.use(express.json());


// ======================================================
// API ROUTES
// ======================================================

// Connect authentication routes to /api/auth
app.use("/api/auth", authRoutes);

// Connect Room routes to /api/rooms
app.use("/api/rooms", roomRoutes);

// Connect Booking routes to /api/bookings
app.use("/api/bookings", bookingRoutes);


// ======================================================
// TEST ROUTE
// ======================================================

// Simple route used to check whether the backend is running
app.get("/", (req, res) => {
  res.status(200).json({
    message: "HostelHub API is running",
  });
});


// ======================================================
// DATABASE CONNECTION
// ======================================================

// Connect the backend to MongoDB Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });


// ======================================================
// START SERVER
// ======================================================

// Use the port from .env, or port 5000 if one is not provided
const PORT = process.env.PORT || 5000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
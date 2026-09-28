// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Load environment variables from the .env file
require("dotenv").config();
// Import authentication routes for register and login APIs
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Connect authentication routes to /api/auth
app.use("/api/auth", authRoutes);
// Test route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "HostelHub API is running",
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

// Server port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
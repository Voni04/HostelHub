// Import Express so we can create API routes
const express = require("express");

// Import the register and login functions from our auth controller
const {
  registerUser,
  loginUser,
  getProfile,
} = require("../controllers/authController");

// Import middleware used to protect private routes
const { protect } = require("../middleware/authMiddleware");
// Create an Express router
const router = express.Router();

// Register route
// POST /api/auth/register
router.post("/register", registerUser);

// Login route
// POST /api/auth/login
router.post("/login", loginUser);

// Protected route - user must provide a valid JWT
// GET /api/auth/profile
router.get("/profile", protect, getProfile);

// Export the router so server.js can use these routes
module.exports = router;
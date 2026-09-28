// Import Express so we can create Room API routes
const express = require("express");

// Import the createRoom function from the Room controller
const { 
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
} = require("../controllers/roomController");

// Import authentication middleware
// This will make sure only logged-in users can access protected routes
const { protect } = require("../middleware/authMiddleware");

// Create an Express router
const router = express.Router();

// Create a new room
// POST /api/rooms
// The user must provide a valid JWT before createRoom is executed
// User must be logged in to view the rooms
router.post("/", protect, createRoom);

// Get all rooms
// GET /api/rooms
router.get("/", protect, getAllRooms);

// Get one specific room using its MongoDB ID
// GET /api/rooms/:id
router.get("/:id", protect, getRoomById);

// Update one specific room
// PUT /api/rooms/:id
router.put("/:id", protect, updateRoom);

// Delete one specific room
// DELETE /api/rooms/:id
router.delete("/:id", protect, deleteRoom);

// Export the router so server.js can use it
module.exports = router;
// Import Express
const express = require("express");

// Create an Express router
const router = express.Router();

// Import Room controller functions
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");

// Import JWT authentication middleware
const { protect } = require("../middleware/authMiddleware");

// Import image upload middleware
const upload = require("../middleware/uploadMiddleware");

// CREATE a new room
// "image" is the field name that will contain the uploaded image
router.post("/", protect, upload.single("image"), createRoom);

// READ all rooms
router.get("/", protect, getAllRooms);

// READ one room by its MongoDB ID
router.get("/:id", protect, getRoomById);

// UPDATE a room
// An image can also be uploaded when editing a room
router.put("/:id", protect, upload.single("image"), updateRoom);

// DELETE a room
router.delete("/:id", protect, deleteRoom);

// Export the router
module.exports = router;
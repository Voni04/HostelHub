// Import Express so we can create booking routes.
const express = require("express");

// Create an Express router.
const router = express.Router();

// Import the Booking controller functions.
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/bookingController");

// Import the JWT authentication middleware.
//
// authMiddleware.js exports:
// module.exports = { protect };
//
// Therefore, we use { protect } here to extract
// the protect function from the exported object.
const { protect } = require("../middleware/authMiddleware");


// ======================================================
// BOOKING ROUTES
// ======================================================

// Create a new booking.
// POST /api/bookings
router.post("/", protect, createBooking);

// Get all bookings.
// GET /api/bookings
router.get("/", protect, getAllBookings);

// Get one booking using its MongoDB ID.
// GET /api/bookings/:id
router.get("/:id", protect, getBookingById);

// Update booking dates.
// PUT /api/bookings/:id
router.put("/:id", protect, updateBooking);

// Update the status of a booking.
//
// This route is used to approve or reject
// a Pending booking.
//
// PATCH /api/bookings/:id/status
router.patch(
  "/:id/status",
  protect,
  updateBookingStatus
);

// Delete one booking.
// DELETE /api/bookings/:id
router.delete("/:id", protect, deleteBooking);


// Export the router so server.js can use it.
module.exports = router;
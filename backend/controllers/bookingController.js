// Import the Booking model so we can create
// and manage bookings in MongoDB.
const Booking = require("../models/Booking");

// Import the Room model so we can check
// whether the requested room exists.
const Room = require("../models/Room");


// ======================================================
// CREATE A NEW BOOKING
// ======================================================
const createBooking = async (req, res) => {
  try {
    // Get booking information sent by the client.
    const {
      roomId,
      startDate,
      endDate,
    } = req.body;

    // Check that all required information was provided.
    if (!roomId || !startDate || !endDate) {
      return res.status(400).json({
        message:
          "Please provide room, start date, and end date",
      });
    }

    // Check whether the selected room actually exists.
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Convert the supplied dates into JavaScript Date objects.
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check whether the supplied dates are valid.
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Please provide valid booking dates",
      });
    }

    // The end date must be later than the start date.
    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be later than start date",
      });
    }

    // Create the booking.
    //
    // req.userId comes from our JWT authentication middleware,
    // so the logged-in user automatically becomes the booking owner.
    const newBooking = await Booking.create({
      userId: req.userId,
      roomId: roomId,
      startDate: start,
      endDate: end,

      // New bookings start as Pending.
      status: "Pending",
    });

    // Return the newly created booking.
    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while creating booking",
    });
  }
};


// ======================================================
// GET ALL BOOKINGS
// ======================================================
const getAllBookings = async (req, res) => {
  try {
    // Get all bookings from MongoDB.
    //
    // populate() replaces the stored ObjectId references
    // with useful information from User and Room.
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate(
        "roomId",
        "roomNumber roomType pricePerMonth availabilityStatus"
      )
      .sort({ createdAt: -1 });

    // Return all bookings.
    res.status(200).json({
      message: "Bookings retrieved successfully",
      count: bookings.length,
      bookings: bookings,
    });
  } catch (error) {
    console.error(
      "Get bookings error:",
      error.message
    );

    res.status(500).json({
      message: "Server error while retrieving bookings",
    });
  }
};


// ======================================================
// GET ONE BOOKING
// ======================================================
const getBookingById = async (req, res) => {
  try {
    // Get the booking ID from the URL.
    const bookingId = req.params.id;

    // Find the booking and include its related
    // User and Room information.
    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate(
        "roomId",
        "roomNumber roomType pricePerMonth availabilityStatus"
      );

    // Return 404 if the booking does not exist.
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Return the selected booking.
    res.status(200).json({
      message: "Booking retrieved successfully",
      booking: booking,
    });
  } catch (error) {
    console.error(
      "Get booking error:",
      error.message
    );

    res.status(400).json({
      message: "Invalid booking ID",
    });
  }
};


// ======================================================
// UPDATE A BOOKING
// ======================================================
const updateBooking = async (req, res) => {
  try {
    // Get the booking ID from the URL.
    const bookingId = req.params.id;

    // Find the existing booking.
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // If new dates were provided, use them.
    // Otherwise keep the existing dates.
    const start = req.body.startDate
      ? new Date(req.body.startDate)
      : booking.startDate;

    const end = req.body.endDate
      ? new Date(req.body.endDate)
      : booking.endDate;

    // Validate the dates.
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Please provide valid booking dates",
      });
    }

    // End date must be later than start date.
    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be later than start date",
      });
    }

    // Update the booking dates.
    booking.startDate = start;
    booking.endDate = end;

    // We are intentionally NOT changing booking status here.
    // Approval/rejection will be handled separately when
    // we implement the required booking business logic.

    // Save the updated booking.
    const updatedBooking = await booking.save();

    // Return the updated booking.
    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(
      "Update booking error:",
      error.message
    );

    res.status(400).json({
      message: "Unable to update booking",
    });
  }
};


// ======================================================
// DELETE A BOOKING
// ======================================================
const deleteBooking = async (req, res) => {
  try {
    // Get the booking ID from the URL.
    const bookingId = req.params.id;

    // Find the booking before deleting it.
    const booking = await Booking.findById(bookingId);

    // Return 404 if it does not exist.
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Delete the booking from MongoDB.
    await booking.deleteOne();

    // Return a success message.
    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete booking error:",
      error.message
    );

    res.status(400).json({
      message: "Unable to delete booking",
    });
  }
};


// Export all controller functions so that
// bookingRoutes.js can use them.
module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
};
// Import the Booking model so we can create
// and manage bookings in MongoDB.
const Booking = require("../models/Booking");

// Import the Room model so we can check room capacity
// and update occupancy and availability.
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

    // Check whether the selected room exists.
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // ==================================================
    // BUSINESS RULE:
    // Do not allow a new booking request if the room
    // has already reached its maximum capacity.
    // ==================================================
    if (
      room.currentOccupancy >= room.capacity ||
      room.availabilityStatus === "Unavailable"
    ) {
      return res.status(400).json({
        message: "This room is currently full",
      });
    }

    // Convert supplied dates into JavaScript Date objects.
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

    // End date must be later than start date.
    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be later than start date",
      });
    }

    // Create the booking.
    //
    // req.userId comes from JWT authentication middleware,
    // so the logged-in user becomes the booking owner.
    const newBooking = await Booking.create({
      userId: req.userId,
      roomId: roomId,
      startDate: start,
      endDate: end,

      // Every new booking starts as Pending.
      status: "Pending",
    });

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
    // populate() replaces the stored ObjectId references
    // with selected information from User and Room.
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate(
        "roomId",
        "roomNumber roomType pricePerMonth capacity currentOccupancy availabilityStatus"
      )
      .sort({ createdAt: -1 });

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

    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email")
      .populate(
        "roomId",
        "roomNumber roomType pricePerMonth capacity currentOccupancy availabilityStatus"
      );

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

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
// UPDATE BOOKING DATES
// ======================================================
const updateBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Use new dates when supplied.
    // Otherwise keep the existing dates.
    const start = req.body.startDate
      ? new Date(req.body.startDate)
      : booking.startDate;

    const end = req.body.endDate
      ? new Date(req.body.endDate)
      : booking.endDate;

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message: "Please provide valid booking dates",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        message:
          "End date must be later than start date",
      });
    }

    // This endpoint only changes dates.
    // Status changes are handled separately below.
    booking.startDate = start;
    booking.endDate = end;

    const updatedBooking = await booking.save();

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
// UPDATE BOOKING STATUS
// ======================================================
// This controller handles approval and rejection.
// Approval also updates Room occupancy.
const updateBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // Get the new status from the request body.
    const { status } = req.body;

    // Only Approved and Rejected are accepted here.
    if (
      status !== "Approved" &&
      status !== "Rejected"
    ) {
      return res.status(400).json({
        message:
          "Status must be Approved or Rejected",
      });
    }

    // Find the booking.
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    // Prevent changing a booking that has already
    // been approved or rejected.
    if (booking.status !== "Pending") {
      return res.status(400).json({
        message:
          "Only pending bookings can change status",
      });
    }

    // Find the room connected to this booking.
    const room = await Room.findById(booking.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }


    // ==================================================
    // APPROVE BOOKING
    // ==================================================
    if (status === "Approved") {
      // Before approving, check that there is still space.
      if (room.currentOccupancy >= room.capacity) {
        // Keep room status correct if it is already full.
        room.availabilityStatus = "Unavailable";
        await room.save();

        return res.status(400).json({
          message:
            "Cannot approve booking because the room is full",
        });
      }

      // Increase occupancy by one.
      room.currentOccupancy += 1;

      // If occupancy has now reached capacity,
      // mark the room as unavailable.
      if (room.currentOccupancy >= room.capacity) {
        room.availabilityStatus = "Unavailable";
      } else {
        room.availabilityStatus = "Available";
      }

      // Save the changed room.
      await room.save();

      // Change the booking status.
      booking.status = "Approved";
      await booking.save();

      return res.status(200).json({
        message: "Booking approved successfully",
        booking: booking,
        room: room,
      });
    }


    // ==================================================
    // REJECT BOOKING
    // ==================================================
    // Rejection does not occupy a place in the room.
    booking.status = "Rejected";
    await booking.save();

    return res.status(200).json({
      message: "Booking rejected successfully",
      booking: booking,
    });
  } catch (error) {
    console.error(
      "Update booking status error:",
      error.message
    );

    res.status(400).json({
      message: "Unable to update booking status",
    });
  }
};


// ======================================================
// DELETE A BOOKING
// ======================================================
const deleteBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }


    // ==================================================
    // BUSINESS RULE:
    // If an APPROVED booking is deleted, release
    // the place that it occupied in the room.
    // ==================================================
    if (booking.status === "Approved") {
      const room = await Room.findById(booking.roomId);

      if (room) {
        // Prevent occupancy from going below zero.
        if (room.currentOccupancy > 0) {
          room.currentOccupancy -= 1;
        }

        // If there is now free space,
        // make the room available again.
        if (room.currentOccupancy < room.capacity) {
          room.availabilityStatus = "Available";
        }

        await room.save();
      }
    }

    // Delete the booking itself.
    await booking.deleteOne();

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
  updateBookingStatus,
  deleteBooking,
};
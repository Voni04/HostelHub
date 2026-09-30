// Import mongoose so we can create the Booking schema
// and store booking documents in MongoDB.
const mongoose = require("mongoose");

// Define the structure of a Booking document.
const bookingSchema = new mongoose.Schema(
  {
    // Reference to the user who created the booking.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reference to the room being booked.
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },

    // Date on which the booking was created.
    bookingDate: {
      type: Date,
      default: Date.now,
    },

    // Date when the user plans to start staying.
    startDate: {
      type: Date,
      required: true,
    },

    // Date when the user plans to leave.
    endDate: {
      type: Date,
      required: true,
    },

    // Current state of the booking.
    // New bookings start as Pending.
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
  },
  {
    // Automatically adds createdAt and updatedAt.
    timestamps: true,
  }
);

// Create the Booking model using the schema.
const Booking = mongoose.model("Booking", bookingSchema);

// Export the model so controllers can use it.
module.exports = Booking;
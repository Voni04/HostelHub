// Import mongoose so we can create the Room schema and model
const mongoose = require("mongoose");

// Define the structure of a room in MongoDB
const roomSchema = new mongoose.Schema(
  {
    // Unique room number, for example: A101
    roomNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Type of room allowed in HostelHub
    roomType: {
      type: String,
      required: true,
      enum: ["Single", "Double", "Triple"],
    },

    // Monthly rental price of the room
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },

    // Maximum number of students the room can hold
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Number of students currently occupying the room
    // New rooms start with zero occupants
    currentOccupancy: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Additional information about the room
    description: {
      type: String,
      trim: true,
    },

    // Stores the room image path or URL
    // We will implement actual image uploading later
    image: {
      type: String,
      default: "",
    },

    // Shows whether the room can accept more bookings
    availabilityStatus: {
      type: String,
      enum: ["Available", "Unavailable"],
      default: "Available",
    },
  },
  {
    // Automatically creates createdAt and updatedAt
    timestamps: true,
  }
);

// Create and export the Room model
module.exports = mongoose.model("Room", roomSchema);
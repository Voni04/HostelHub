// Import the Room model so we can create and manage rooms in MongoDB
const Room = require("../models/Room");

// Create a new room
const createRoom = async (req, res) => {
  try {
    // Get room information sent in the request body
    const {
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description,
    } = req.body;

    // Check that the main required fields were provided
    if (!roomNumber || !roomType || pricePerMonth === undefined || !capacity) {
      return res.status(400).json({
        message:
          "Please provide room number, room type, price per month, and capacity",
      });
    }

    // Check whether a room with the same room number already exists
    const existingRoom = await Room.findOne({ roomNumber });

    if (existingRoom) {
      return res.status(400).json({
        message: "A room with this room number already exists",
      });
    }

    // Create and save the new room in MongoDB
    const newRoom = await Room.create({
      roomNumber,
      roomType,
      pricePerMonth,
      capacity,
      description,
    });

    // Return the newly created room
    res.status(201).json({
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    // Handle validation or other server errors
    console.error("Create room error:", error.message);

    res.status(500).json({
      message: "Server error while creating room",
    });
  }
};

// Get all rooms from MongoDB
const getAllRooms = async (req, res) => {
  try {
    // Find all Room documents in the database
    // sort() displays the newest rooms first
    const rooms = await Room.find().sort({ createdAt: -1 });

    // Return all rooms to the client
    res.status(200).json({
      message: "Rooms retrieved successfully",
      count: rooms.length,
      rooms: rooms,
    });
  } catch (error) {
    // Handle unexpected server or database errors
    console.error("Get rooms error:", error.message);

    res.status(500).json({
      message: "Server error while retrieving rooms",
    });
  }
};

// Get one specific room using its MongoDB ID
const getRoomById = async (req, res) => {
  try {
    // Get the room ID from the URL parameter
    // Example: /api/rooms/68d8abc123...
    const roomId = req.params.id;

    // Search MongoDB for a room with this ID
    const room = await Room.findById(roomId);

    // If no room exists with this ID, return 404
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Return the requested room
    res.status(200).json({
      message: "Room retrieved successfully",
      room: room,
    });
  } catch (error) {
    // An invalid MongoDB ID can also cause an error
    console.error("Get room error:", error.message);

    res.status(400).json({
      message: "Invalid room ID",
    });
  }
};

// Update an existing room using its MongoDB ID
const updateRoom = async (req, res) => {
  try {
    // Get the room ID from the URL
    const roomId = req.params.id;

    // Find the room before trying to update it
    const room = await Room.findById(roomId);

    // If the room does not exist, return 404
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Update only the fields provided in the request body
    // If a field is not provided, keep its existing value
    room.roomNumber = req.body.roomNumber ?? room.roomNumber;
    room.roomType = req.body.roomType ?? room.roomType;
    room.pricePerMonth =
      req.body.pricePerMonth ?? room.pricePerMonth;
    room.capacity = req.body.capacity ?? room.capacity;
    room.description =
      req.body.description ?? room.description;

    // Save the updated room in MongoDB
    const updatedRoom = await room.save();

    // Return the updated room
    res.status(200).json({
      message: "Room updated successfully",
      room: updatedRoom,
    });
  } catch (error) {
    // Handle invalid IDs, validation errors, or database errors
    console.error("Update room error:", error.message);

    res.status(400).json({
      message: "Unable to update room",
    });
  }
};

// Delete an existing room using its MongoDB ID
const deleteRoom = async (req, res) => {
  try {
    // Get the room ID from the URL parameter
    const roomId = req.params.id;

    // Search for the room before deleting it
    const room = await Room.findById(roomId);

    // If the room does not exist, return a 404 response
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Delete the room from MongoDB
    await room.deleteOne();

    // Return a success message
    res.status(200).json({
      message: "Room deleted successfully",
    });
  } catch (error) {
    // Handle invalid IDs or other database errors
    console.error("Delete room error:", error.message);

    res.status(400).json({
      message: "Unable to delete room",
    });
  }
};

// Export the function so it can be used in room routes
module.exports = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
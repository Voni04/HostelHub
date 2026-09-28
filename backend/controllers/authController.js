// Import bcryptjs so we can securely hash user passwords
const bcrypt = require("bcryptjs");

// Import jsonwebtoken so we can create a JWT after successful login
const jwt = require("jsonwebtoken");

// Import the User model so we can create and search for users
const User = require("../models/User");

// Register a new user
const registerUser = async (req, res) => {
  try {
    // Get the name, email, and password sent from the client
    const { name, email, password } = req.body;

    // Check whether all required fields were provided
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    // Check whether a user with this email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(10);

    // Hash the password before storing it in MongoDB
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send a success response
    // Never send the hashed password back to the client
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    // Handle unexpected server/database errors
    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Server error while registering user",
    });
  }
};

// Login an existing user
const loginUser = async (req, res) => {
  try {
    // Get email and password sent by the client
    const { email, password } = req.body;

    // Make sure both fields were provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Search MongoDB for a user with this email
    const user = await User.findOne({ email });

    // If no user is found, login should fail
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare the entered password with the hashed password in MongoDB
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    // If the passwords do not match, login should fail
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create a JWT containing the user's ID
    // The token will expire after 1 day
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send successful login response with the JWT
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle unexpected server or database errors
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error while logging in",
    });
  }
};

// Get the profile of the currently logged-in user
const getProfile = async (req, res) => {
  try {
    // req.userId was added by our authentication middleware
    // Find the user using that ID and exclude the password field
    const user = await User.findById(req.userId).select("-password");

    // If the user no longer exists in the database
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return the logged-in user's details
    res.status(200).json({
      message: "Protected profile accessed successfully",
      user: user,
    });
  } catch (error) {
    // Handle unexpected server or database errors
    console.error("Profile error:", error.message);

    res.status(500).json({
      message: "Server error while getting profile",
    });
  }
};

// Export the function so we can use it inside our routes
module.exports = {
  registerUser,
  loginUser,
  getProfile,
};
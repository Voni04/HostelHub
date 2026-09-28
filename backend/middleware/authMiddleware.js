// Import jsonwebtoken so we can verify JWT tokens
const jwt = require("jsonwebtoken");

// Middleware to protect routes from unauthenticated users
const protect = (req, res, next) => {
  try {
    // Get the Authorization header sent by the client
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    // and whether it starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided",
      });
    }

    // Extract only the token from:
    // "Bearer eyJhbGciOi..."
    const token = authHeader.split(" ")[1];

    // Verify the token using the same secret used during login
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save the logged-in user's ID in the request object
    // Other controllers can later access it using req.userId
    req.userId = decoded.userId;

    // Token is valid, so continue to the protected route
    next();
  } catch (error) {
    // This happens if the token is invalid or expired
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Export the middleware so we can use it in protected routes
module.exports = {
  protect,
};
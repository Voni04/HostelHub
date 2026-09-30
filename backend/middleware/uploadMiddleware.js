// Import multer for handling file uploads
const multer = require("multer");

// Import path so we can work with file extensions
const path = require("path");

// Configure where uploaded room images will be stored
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save uploaded images inside the backend/uploads folder
    cb(null, "uploads/");
  },

  filename: function (req, file, cb) {
    // Create a unique filename to avoid files having the same name
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Keep the original image extension, such as .jpg or .png
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// Allow only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  // Check the file extension
  const extensionIsValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  // Check the MIME type
  const mimeTypeIsValid = allowedTypes.test(file.mimetype);

  if (extensionIsValid && mimeTypeIsValid) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  }
};

// Create the Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,

  // Maximum image size = 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Export so we can use it in the room routes
module.exports = upload;
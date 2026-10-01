// Import Multer for handling uploaded files
const multer = require("multer");

// Import Cloudinary
const { v2: cloudinary } = require("cloudinary");

// Configure Cloudinary using the values stored in .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store the uploaded image temporarily in memory
const storage = multer.memoryStorage();

// Allow only supported image files
const fileFilter = (req, file, cb) => {
  // Allowed image MIME types
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // Accept only supported image types
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed"));
  }
};

// Multer first receives and validates the image
const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,

  // Maximum image size = 5 MB
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Upload the image buffer to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  try {
    // If no image was selected, continue normally.
    // This is important when editing a room without changing its image.
    if (!req.file) {
      return next();
    }

    // Upload the image buffer to Cloudinary using an upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        // Keep HostelHub room images together in Cloudinary
        folder: "hostelhub/rooms",

        // Automatically detect the image format
        resource_type: "image",
      },
      (error, result) => {
        // If Cloudinary fails, return an error
        if (error) {
          console.error("Cloudinary upload error:", error.message);

          return res.status(500).json({
            message: "Unable to upload room image",
          });
        }

        // Replace req.file.path with the permanent Cloudinary HTTPS URL.
        // roomController.js will save this URL in MongoDB.
        req.file.path = result.secure_url;

        // Continue to the room controller
        next();
      }
    );

    // Send the image stored in memory to Cloudinary
    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("Image upload error:", error.message);

    res.status(500).json({
      message: "Server error while uploading image",
    });
  }
};

// This middleware performs two steps:
// 1. Multer reads and validates the image.
// 2. The image is uploaded from memory to Cloudinary.
const upload = {
  single: (fieldName) => [
    multerUpload.single(fieldName),
    uploadToCloudinary,
  ],
};

// Export so room routes can continue using upload.single("image")
module.exports = upload;
const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const requireAuth = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error("Only JPG, PNG and WebP images are allowed"));
    }
  },
});

router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "waypoint" },
        (error, uploadedImage) => {
          if (error) {
            return reject(error);
          }

          resolve(uploadedImage);
        },
      );

      stream.end(req.file.buffer);
    });

    res.status(201).json({
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Image upload failed:", error.message);

    res.status(500).json({
      message: "Image upload failed",
    });
  }
});

module.exports = router;

const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// temp storage (local)
const upload = multer({ dest: "uploads/" });

// upload function
const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "live-commerce",
    });

    return result;
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

module.exports = { upload, uploadToCloudinary };

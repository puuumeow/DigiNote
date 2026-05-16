const fs = require("fs");
const path = require("path");
const multer = require("multer");

const avatarDir = path.join(__dirname, "..", "uploads", "avatars");

if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },

  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpg|jpeg|png|webp/;
  const extensionOk = allowedExtensions.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeOk = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ].includes(file.mimetype);

  if (extensionOk && mimeOk) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, PNG, and WEBP images are allowed"), false);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

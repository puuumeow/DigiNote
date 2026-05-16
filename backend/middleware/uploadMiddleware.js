const fs = require("fs");
const path = require("path");
const multer = require("multer");

const pdfDir = path.join(__dirname, "..", "uploads", "pdfs");

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
  },

  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const safeName = originalName
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    cb(null, `${Date.now()}-${safeName || "note"}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();

  // Some browsers/operating systems send PDFs as application/octet-stream.
  // So we accept by extension first, then keep the client-side PDF check too.
  const acceptedMimeTypes = [
    "application/pdf",
    "application/x-pdf",
    "application/octet-stream",
    "binary/octet-stream",
  ];

  if (ext === ".pdf" || acceptedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Only PDF files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;

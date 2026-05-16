const express = require("express");
const multer = require("multer");

const {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
  getMyNotes,
  getMySales,
  getMyPurchases,
  downloadNote,
  previewNote,
  purchaseNote,
  upvoteNote,
  bookmarkNote,
  getBookmarkedNotes,
  addComment,
  getNoteComments,
  deleteComment,
} = require("../controllers/noteController");

const {
  protect,
} = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const uploadSinglePdf = (req, res, next) => {
  upload.single("pdf")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "PDF file must be 10MB or smaller"
          : error.message;

      return res.status(400).json({ message });
    }

    return res.status(400).json({
      message: error.message || "Upload failed",
    });
  });
};

// CREATE NOTE
router.post(
  "/",
  protect,
  uploadSinglePdf,
  createNote
);

// GET ALL NOTES
router.get("/", getAllNotes);

// GET MY NOTES
router.get("/my-notes", protect, getMyNotes);

// GET SALES FROM MY UPLOADED NOTES
router.get("/my-sales", protect, getMySales);

// GET NOTES I PURCHASED
router.get("/my-purchases", protect, getMyPurchases);

// GET BOOKMARKED NOTES
router.get("/bookmarks", protect, getBookmarkedNotes);

// PREVIEW NOTE
router.get("/preview/:id", previewNote);

// PURCHASE NOTE
router.post("/purchase/:id", protect, purchaseNote);

// DOWNLOAD NOTE
router.get("/download/:id", protect, downloadNote);

// UPVOTE NOTE
router.put("/upvote/:id", protect, upvoteNote);

// BOOKMARK NOTE
router.put("/bookmark/:id", protect, bookmarkNote);

// GET NOTE COMMENTS
router.get("/:id/comments", getNoteComments);

// ADD NOTE COMMENT
router.post("/:id/comments", protect, addComment);

// DELETE COMMENT
router.delete("/comments/:commentId", protect, deleteComment);

// GET SINGLE NOTE
router.get("/:id", getSingleNote);

// UPDATE NOTE
router.put("/:id", protect, updateNote);

// DELETE NOTE
router.delete("/:id", protect, deleteNote);

module.exports = router;

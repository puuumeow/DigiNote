const express = require("express");

const {
  createReport,
  getAllReports,
  reviewReport,
  rejectReport,
} = require("../controllers/reportController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();


// CREATE REPORT
router.post(
  "/",
  protect,
  createReport
);


// GET ALL REPORTS
router.get(
  "/",
  protect,
  adminOnly,
  getAllReports
);


// REVIEW REPORT
router.put(
  "/review/:id",
  protect,
  adminOnly,
  reviewReport
);


// REJECT REPORT
router.put(
  "/reject/:id",
  protect,
  adminOnly,
  rejectReport
);

module.exports = router;
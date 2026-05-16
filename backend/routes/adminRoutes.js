const express = require("express");

const {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getAllUsers,
  getAllNotesForAdmin,
  banUser,
  unbanUser,
  verifyCreator,
  updateUserRole,
  deleteAnyNote,
  featureNote,
  removeFeaturedNote,
} = require("../controllers/adminController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// DASHBOARD
router.get(
  "/dashboard",
  protect,
  adminOnly,
  getDashboardAnalytics
);

// REVENUE
router.get(
  "/revenue",
  protect,
  adminOnly,
  getRevenueAnalytics
);

// USERS
router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

// NOTES
router.get(
  "/notes",
  protect,
  adminOnly,
  getAllNotesForAdmin
);

// BAN USER
router.put(
  "/ban-user/:id",
  protect,
  adminOnly,
  banUser
);

// UNBAN USER
router.put(
  "/unban-user/:id",
  protect,
  adminOnly,
  unbanUser
);

// VERIFY CREATOR
router.put(
  "/verify-creator/:id",
  protect,
  adminOnly,
  verifyCreator
);

// UPDATE USER ROLE
router.put(
  "/update-role/:id",
  protect,
  adminOnly,
  updateUserRole
);

// DELETE NOTE
router.delete(
  "/delete-note/:id",
  protect,
  adminOnly,
  deleteAnyNote
);

// FEATURE NOTE
router.put(
  "/feature-note/:id",
  protect,
  adminOnly,
  featureNote
);

// REMOVE FEATURED
router.put(
  "/remove-feature/:id",
  protect,
  adminOnly,
  removeFeaturedNote
);

module.exports = router;

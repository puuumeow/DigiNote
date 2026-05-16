const User = require("../models/User");
const Note = require("../models/Note");
const Report = require("../models/Report");
const Purchase = require("../models/Purchase");
const Comment = require("../models/Comment");
const fs = require("fs");

// GET DASHBOARD ANALYTICS
const getDashboardAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalNotes = await Note.countDocuments();
    const totalReports = await Report.countDocuments();
    const bannedUsers = await User.countDocuments({
      isBanned: true,
    });
    const featuredNotes = await Note.countDocuments({
      featured: true,
    });

    res.status(200).json({
      totalUsers,
      totalNotes,
      totalReports,
      bannedUsers,
      featuredNotes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL USERS
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET ALL NOTES FOR ADMIN
const getAllNotesForAdmin = async (req, res) => {
  try {
    const notes = await Note.find()
      .populate("user", "fullName email")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// BAN USER
const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBanned = true;
    await user.save();

    await User.updateMany(
      { _id: { $ne: user._id } },
      {
        $pull: {
          followers: user._id,
          following: user._id,
        },
      }
    );

    user.followers = [];
    user.following = [];
    await user.save();

    res.status(200).json({
      message: "User banned successfully. This account is now hidden from public search and profiles.",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UNBAN USER
const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.isBanned = false;
    await user.save();

    res.status(200).json({
      message: "User unbanned successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY CREATOR
const verifyCreator = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.role = "creator";
    await user.save();

    res.status(200).json({
      message: "Creator verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER ROLE
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const allowedRoles = ["user", "creator", "admin", "superadmin"];
    const requestedRole = req.body.role;

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!allowedRoles.includes(requestedRole)) {
      return res.status(400).json({
        message: "Invalid role selected",
      });
    }

    if (requestedRole === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only a superadmin can assign superadmin role",
      });
    }

    if (user.role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Only a superadmin can modify another superadmin",
      });
    }

    user.role = requestedRole;
    await user.save();

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE ANY NOTE
const deleteAnyNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    note.isDeletedByAdmin = true;
    await note.save();

    if (note.pdfFile && fs.existsSync(note.pdfFile)) {
      fs.unlinkSync(note.pdfFile);
    }

    if (note.previewFile && fs.existsSync(note.previewFile)) {
      fs.unlinkSync(note.previewFile);
    }

    await Comment.deleteMany({
      note: note._id,
    });

    await Purchase.deleteMany({
      note: note._id,
    });

    await note.deleteOne();

    res.status(200).json({
      message: "Note deleted by admin",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// FEATURE NOTE
const featureNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    note.featured = true;
    await note.save();

    res.status(200).json({
      message: "Note featured successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// REMOVE FEATURED
const removeFeaturedNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    note.featured = false;
    await note.save();

    res.status(200).json({
      message: "Featured removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET REVENUE ANALYTICS
const getRevenueAnalytics = async (req, res) => {
  try {
    const paidPurchases = await Purchase.find({
      status: "paid",
    })
      .populate("user", "fullName email university role")
      .populate({
        path: "note",
        select: "title category price user createdAt",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .sort({
        createdAt: -1,
      });

    const totalRevenue = paidPurchases.reduce(
      (sum, purchase) => sum + Number(purchase.amount || 0),
      0
    );

    const paidDownloads = paidPurchases.length;

    const premiumUsers = new Set(
      paidPurchases
        .filter((purchase) => purchase.user)
        .map((purchase) => purchase.user._id.toString())
    ).size;

    const purchases = paidPurchases.map((purchase) => ({
      _id: purchase._id,
      amount: purchase.amount || 0,
      status: purchase.status,
      purchasedAt: purchase.createdAt,
      buyer: purchase.user
        ? {
            _id: purchase.user._id,
            fullName: purchase.user.fullName,
            email: purchase.user.email,
            university: purchase.user.university || "",
            role: purchase.user.role,
          }
        : null,
      note: purchase.note
        ? {
            _id: purchase.note._id,
            title: purchase.note.title,
            category: purchase.note.category,
            price: purchase.note.price || 0,
            seller: purchase.note.user
              ? {
                  _id: purchase.note.user._id,
                  fullName: purchase.note.user.fullName,
                  email: purchase.note.user.email,
                }
              : null,
          }
        : null,
    }));

    res.status(200).json({
      totalRevenue,
      premiumUsers,
      paidDownloads,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
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
};

const fs = require("fs");

const Note = require("../models/Note");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Purchase = require("../models/Purchase");
const Notification = require("../models/Notification");
const createPreviewPdf = require("../utils/createPreviewPdf");

const getUserId = (user) => user?._id || user;

// CREATE NOTE
const createNote = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      university,
      faculty,
      department,
      tags,
      isPaid,
      price,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Please choose a PDF file",
      });
    }

    const requiredFields = {
      title,
      description,
      category,
      university,
      faculty,
      department,
    };

    const missingField = Object.keys(requiredFields).find(
      (field) => !String(requiredFields[field] || "").trim()
    );

    if (missingField) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: `${missingField} is required`,
      });
    }

    const paidStatus = isPaid === "true" || isPaid === true;
    const notePrice = paidStatus ? Number(price) : 0;

    if (paidStatus && (!notePrice || notePrice <= 0)) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Price is required for paid notes",
      });
    }

    let previewFile = "";

    if (paidStatus) {
      try {
        previewFile = await createPreviewPdf(req.file.path);
      } catch (previewError) {
        console.error("Preview generation failed:", previewError.message);
        previewFile = "";
      }
    }

    const cleanTags = typeof tags === "string"
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : Array.isArray(tags)
        ? tags
        : [];

    const note = await Note.create({
      user: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      university: university.trim(),
      faculty: faculty.trim(),
      department: department.trim(),
      tags: cleanTags,
      isPaid: paidStatus,
      price: notePrice,
      pdfFile: req.file.path,
      previewFile,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "Note uploaded successfully",
      note,
    });
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error.message || "Upload failed",
    });
  }
};

// GET ALL NOTES
const getAllNotes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const keyword = req.query.search
      ? {
          $or: [
            {
              title: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              description: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              category: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              university: {
                $regex: req.query.search,
                $options: "i",
              },
            },
            {
              department: {
                $regex: req.query.search,
                $options: "i",
              },
            },
          ],
        }
      : {};

    const filters = {};

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.university) {
      filters.university = req.query.university;
    }

    if (req.query.department) {
      filters.department = req.query.department;
    }

    if (req.query.isPaid) {
      filters.isPaid = req.query.isPaid === "true";
    }

    let sortOption = {
      createdAt: -1,
    };

    if (req.query.sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (req.query.sort === "downloads") {
      sortOption = {
        downloads: -1,
      };
    }

    if (req.query.sort === "upvotes") {
      sortOption = {
        upvotes: -1,
      };
    }

    const activeUserIds = await User.find({
      isBanned: false,
    }).distinct("_id");

    const publicQuery = {
      ...keyword,
      ...filters,
      user: { $in: activeUserIds },
    };

    const notes = await Note.find(publicQuery)
      .populate("user", "fullName email avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments(publicQuery);

    res.status(200).json({
      total,
      page,
      pages: Math.ceil(total / limit),
      notes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET SINGLE NOTE
const getSingleNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate(
      "user",
      "fullName email avatar bio university department isBanned"
    );

    if (!note || !note.user || note.user.isBanned) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE NOTE
const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (getUserId(note.user).toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    note.title = req.body.title || note.title;
    note.description = req.body.description || note.description;
    note.category = req.body.category || note.category;
    note.university = req.body.university || note.university;
    note.faculty = req.body.faculty || note.faculty;
    note.department = req.body.department || note.department;

    if (req.body.isPaid !== undefined) {
      note.isPaid = req.body.isPaid === "true" || req.body.isPaid === true;
    }

    if (req.body.price !== undefined) {
      note.price = note.isPaid ? Number(req.body.price) : 0;
    }

    const updatedNote = await note.save();

    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE NOTE
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const isOwner = getUserId(note.user).toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

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
      message: "Note deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET MY NOTES
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET SALES FOR MY UPLOADED PAID NOTES
const getMySales = async (req, res) => {
  try {
    const myNotes = await Note.find({
      user: req.user._id,
    }).select("_id");

    const noteIds = myNotes.map((note) => note._id);

    const purchases = await Purchase.find({
      note: { $in: noteIds },
      status: "paid",
    })
      .populate("user", "fullName email avatar")
      .populate("note", "title category price isPaid downloads")
      .sort({ createdAt: -1 });

    const totalEarnings = purchases.reduce(
      (sum, purchase) => sum + Number(purchase.amount || 0),
      0
    );

    res.status(200).json({
      totalSales: purchases.length,
      totalEarnings,
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET NOTES I HAVE PURCHASED
const getMyPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      user: req.user._id,
      status: "paid",
    })
      .populate({
        path: "note",
        select: "title category price isPaid user downloads",
        populate: {
          path: "user",
          select: "fullName email avatar",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PREVIEW NOTE
const previewNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("user", "isBanned");

    if (!note || !note.user || note.user.isBanned) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.isPaid) {
      if (!note.previewFile) {
        return res.status(404).json({
          message: "Preview not available for this paid note",
        });
      }

      return res.sendFile(note.previewFile, {
        root: process.cwd(),
      });
    }

    res.sendFile(note.pdfFile, {
      root: process.cwd(),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// PURCHASE NOTE
const purchaseNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("user", "isBanned");

    if (!note || !note.user || note.user.isBanned) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (!note.isPaid) {
      return res.status(400).json({
        message: "This note is free",
      });
    }

    if (getUserId(note.user).toString() === req.user._id.toString()) {
      return res.status(400).json({
        message: "You own this note already",
      });
    }

    const existingPurchase = await Purchase.findOne({
      user: req.user._id,
      note: note._id,
    });

    if (existingPurchase) {
      return res.status(200).json({
        message: "You already purchased this note. Download is unlocked.",
        purchase: existingPurchase,
      });
    }

    const purchase = await Purchase.create({
      user: req.user._id,
      note: note._id,
      amount: note.price,
      status: "paid",
    });

    if (getUserId(note.user).toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: getUserId(note.user),
        sender: req.user._id,
        note: note._id,
        type: "purchase",
        message: `${req.user.fullName} purchased your note: ${note.title}`,
      });
    }

    res.status(201).json({
      message: "Note purchased successfully",
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DOWNLOAD NOTE
const downloadNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate("user", "isBanned");

    if (!note || !note.user || note.user.isBanned) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (note.isPaid) {
      const isOwner = getUserId(note.user).toString() === req.user._id.toString();
      const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";
      const purchase = await Purchase.findOne({
        user: req.user._id,
        note: note._id,
        status: "paid",
      });

      if (!isOwner && !isAdmin && !purchase) {
        return res.status(403).json({
          message: "Please purchase this note before downloading",
        });
      }
    }

    note.downloads += 1;

    await note.save();

    res.download(note.pdfFile);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// UPVOTE NOTE
const upvoteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const alreadyUpvoted = note.upvotedBy.includes(req.user._id);

    if (alreadyUpvoted) {
      return res.status(400).json({
        message: "Already upvoted",
      });
    }

    note.upvotes += 1;
    note.upvotedBy.push(req.user._id);

    await note.save();

    if (getUserId(note.user).toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: getUserId(note.user),
        sender: req.user._id,
        note: note._id,
        type: "upvote",
        message: `${req.user.fullName} upvoted your note: ${note.title}`,
      });
    }

    res.status(200).json({
      message: "Note upvoted",
      totalUpvotes: note.upvotes,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// BOOKMARK NOTE
const bookmarkNote = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    const alreadyBookmarked = user.bookmarks.includes(note._id);

    if (alreadyBookmarked) {
      return res.status(400).json({
        message: "Already bookmarked",
      });
    }

    user.bookmarks.push(note._id);

    await user.save();

    res.status(200).json({
      message: "Note bookmarked",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET BOOKMARKED NOTES
const getBookmarkedNotes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookmarks",
      populate: {
        path: "user",
        select: "fullName avatar isBanned",
      },
    });

    const visibleBookmarks = user.bookmarks.filter(
      (note) => note.user && !note.user.isBanned
    );

    res.status(200).json(visibleBookmarks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ADD COMMENT
const addComment = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    if (!req.body.text) {
      return res.status(400).json({
        message: "Comment text required",
      });
    }

    const comment = await Comment.create({
      note: req.params.id,
      user: req.user._id,
      text: req.body.text,
    });

    note.commentsCount += 1;
    await note.save();

    if (getUserId(note.user).toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: getUserId(note.user),
        sender: req.user._id,
        note: note._id,
        type: "comment",
        message: `${req.user.fullName} commented on your note: ${note.title}`,
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "fullName avatar"
    );

    res.status(201).json({
      message: "Comment added",
      comment: populatedComment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// GET NOTE COMMENTS
const getNoteComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      note: req.params.id,
    })
      .populate("user", "fullName avatar")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin" || req.user.role === "superadmin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await comment.deleteOne();

    await Note.findByIdAndUpdate(comment.note, {
      $inc: {
        commentsCount: -1,
      },
    });

    res.status(200).json({
      message: "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createNote,
  getAllNotes,
  getSingleNote,
  updateNote,
  deleteNote,
  getMyNotes,
  getMySales,
  getMyPurchases,
  previewNote,
  purchaseNote,
  downloadNote,
  upvoteNote,
  bookmarkNote,
  getBookmarkedNotes,
  addComment,
  getNoteComments,
  deleteComment,
};

const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "spam",
        "plagiarism",
        "fake content",
        "harassment",
        "inappropriate material",
      ],
    },

    message: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Report",
  reportSchema
);
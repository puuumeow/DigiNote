const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["paid", "pending", "failed"],
      default: "paid",
    },
  },
  {
    timestamps: true,
  }
);

purchaseSchema.index(
  {
    user: 1,
    note: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
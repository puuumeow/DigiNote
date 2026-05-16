const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    university: {
      type: String,
      required: true,
    },

    faculty: {
      type: String,
      required: true,
    },

    department: {
      type: String,
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    pdfFile: {
      type: String,
      required: true,
    },

    previewFile: {
    type: String,
    default: "",
    },
    fileSize: {
      type: Number,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    price: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },

    upvotes: {
      type: Number,
      default: 0,
    },

    upvotedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    rating: {
      type: Number,
      default: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
    },
    featured: {
  type: Boolean,
  default: false,
},

isDeletedByAdmin: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  },
  
);

module.exports = mongoose.model("Note", noteSchema);
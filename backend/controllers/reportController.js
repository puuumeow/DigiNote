const Report = require("../models/Report");


// CREATE REPORT
const createReport = async (req, res) => {
  try {
    const {
      note,
      reason,
      message,
    } = req.body;

    const report = await Report.create({
      reportedBy: req.user._id,
      note,
      reason,
      message,
    });

    res.status(201).json({
      message: "Report submitted",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL REPORTS
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate(
        "reportedBy",
        "fullName email"
      )
      .populate({
        path: "note",
        select: "title category university department isPaid price downloads upvotes user createdAt",
        populate: {
          path: "user",
          select: "fullName email",
        },
      })
      .sort({
        createdAt: -1,
      });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// REVIEW REPORT
const reviewReport = async (req, res) => {
  try {
    const report = await Report.findById(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = "reviewed";

    await report.save();

    res.status(200).json({
      message: "Report reviewed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// REJECT REPORT
const rejectReport = async (req, res) => {
  try {
    const report = await Report.findById(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    report.status = "rejected";

    await report.save();

    res.status(200).json({
      message: "Report rejected",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


module.exports = {
  createReport,
  getAllReports,
  reviewReport,
  rejectReport,
};
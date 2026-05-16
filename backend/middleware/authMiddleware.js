const jwt = require("jsonwebtoken");
const User = require("../models/User");


// PROTECT ROUTES
const protect = async (req, res, next) => {
  let token;

  try {
    // CHECK TOKEN
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // VERIFY TOKEN
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // GET USER
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      if (req.user.isBanned) {
        return res.status(403).json({
          message: "User banned. Your account has been banned by admin.",
        });
      }

      next();
    } else {
      return res.status(401).json({
        message: "Not authorized, no token",
      });
    }
  } catch (error) {
    return res.status(401).json({
      message: "Token failed",
    });
  }
};


// ADMIN ONLY
const adminOnly = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "admin" ||
      req.user.role === "superadmin")
  ) {
    next();
  } else {
    return res.status(403).json({
      message: "Admin access only",
    });
  }
};


// SUPER ADMIN ONLY
const superAdminOnly = (req, res, next) => {
  if (
    req.user &&
    req.user.role === "superadmin"
  ) {
    next();
  } else {
    return res.status(403).json({
      message: "Super Admin access only",
    });
  }
};

module.exports = {
  protect,
  adminOnly,
  superAdminOnly,
};
const express =
  require("express");

const router =
  express.Router();

const {
  getMyProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  getPublicProfile,
  toggleFollowUser,
} = require(
  "../controllers/userController"
);

const {
  protect,
} = require("../middleware/authMiddleware");

const avatarUpload =
  require(
    "../middleware/avatarUpload"
  );


// PROFILE
router.get(
  "/profile",
  protect,
  getMyProfile
);


// UPDATE PROFILE
router.put(
  "/profile",
  protect,
  updateProfile
);


// UPLOAD AVATAR
router.put(
  "/avatar",
  protect,
  avatarUpload.single(
    "avatar"
  ),
  uploadAvatar
);

// SEARCH USERS
router.get(
  "/search",
  searchUsers
);

// PUBLIC USER PROFILE
router.get(
  "/:id",
  protect,
  getPublicProfile
);

// FOLLOW OR UNFOLLOW USER
router.put(
  "/:id/follow",
  protect,
  toggleFollowUser
);

module.exports =
  router;

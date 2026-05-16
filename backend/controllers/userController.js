const User =
  require("../models/User");

const Note =
  require("../models/Note");

const Notification =
  require("../models/Notification");


// GET CURRENT USER PROFILE
const getMyProfile =
  async (req, res) => {

    try{

      const user =
        await User.findById(
          req.user._id
        ).select("-password");

      if(!user){

        return res.status(404).json({
          message:"User not found",
        });
      }

      res.status(200).json(
        user
      );

    }
    catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  };


// UPDATE PROFILE
const updateProfile =
  async (req, res) => {

    try{

      const user =
        await User.findById(
          req.user._id
        );

      if(!user){

        return res.status(404).json({
          message:"User not found",
        });
      }

      user.fullName =
        req.body.fullName ||
        user.fullName;

      user.bio =
        req.body.bio ||
        user.bio;

      user.university =
        req.body.university ||
        user.university;

      user.faculty =
        req.body.faculty ||
        user.faculty;

      user.department =
        req.body.department ||
        user.department;

      await user.save();

      res.status(200).json({
        message:
          "Profile updated",
        user,
      });

    }
    catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  };


// GET PUBLIC USER PROFILE
const getPublicProfile =
  async (req, res) => {

    try{

      const user =
        await User.findById(
          req.params.id
        ).select("-password -bookmarks");

      if(!user || user.isBanned){

        return res.status(404).json({
          message:"User not found",
        });
      }

      const notes =
        await Note.find({
          user:user._id,
        })
        .sort({
          createdAt:-1,
        })
        .select("title description category university department isPaid price downloads upvotes commentsCount createdAt");

      const isFollowing =
        req.user &&
        user.followers.some(
          (followerId) =>
            followerId.toString() === req.user._id.toString()
        );

      res.status(200).json({
        user:{
          _id:user._id,
          fullName:user.fullName,
          email:user.email,
          avatar:user.avatar,
          bio:user.bio,
          role:user.role,
          university:user.university,
          faculty:user.faculty,
          department:user.department,
          followersCount:user.followers.length,
          followingCount:user.following.length,
          isFollowing:Boolean(isFollowing),
        },
        notes,
      });

    }
    catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  };


// FOLLOW OR UNFOLLOW USER
const toggleFollowUser =
  async (req, res) => {

    try{

      if(req.params.id === req.user._id.toString()){

        return res.status(400).json({
          message:"You cannot follow yourself",
        });
      }

      const targetUser =
        await User.findById(req.params.id);

      const currentUser =
        await User.findById(req.user._id);

      if(!targetUser || targetUser.isBanned){

        return res.status(404).json({
          message:"User not found",
        });
      }

      const alreadyFollowing =
        currentUser.following.some(
          (userId) =>
            userId.toString() === targetUser._id.toString()
        );

      if(alreadyFollowing){

        currentUser.following =
          currentUser.following.filter(
            (userId) =>
              userId.toString() !== targetUser._id.toString()
          );

        targetUser.followers =
          targetUser.followers.filter(
            (userId) =>
              userId.toString() !== currentUser._id.toString()
          );

        await currentUser.save();
        await targetUser.save();

        return res.status(200).json({
          message:"User unfollowed",
          isFollowing:false,
          followersCount:targetUser.followers.length,
        });
      }

      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);

      await currentUser.save();
      await targetUser.save();

      await Notification.create({
        recipient:targetUser._id,
        sender:currentUser._id,
        type:"follow",
        message:`${currentUser.fullName} started following you`,
      });

      res.status(200).json({
        message:"User followed",
        isFollowing:true,
        followersCount:targetUser.followers.length,
      });

    }
    catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  };


// ADMIN TEST ROUTE
const adminDashboard =
  async (req, res) => {

    res.status(200).json({
      message:
        "Welcome Admin Dashboard",
    });
  };


// UPLOAD AVATAR
const uploadAvatar =
  async (req, res) => {

    try{

      const user =
        await User.findById(
          req.user._id
        );

      if(!req.file){

        return res.status(400).json({
          message:
            "Image required",
        });
      }

      if(user.avatar){

        const oldAvatarPath =
          require("path").join(
            __dirname,
            "..",
            user.avatar
          );

        if(require("fs").existsSync(oldAvatarPath)){
          require("fs").unlinkSync(oldAvatarPath);
        }
      }

      user.avatar =
        `uploads/avatars/${req.file.filename}`;

      await user.save();

      const safeUser =
        await User.findById(user._id).select("-password");

      res.status(200).json({
        message:
          "Avatar uploaded",
        avatar:user.avatar,
        user:safeUser,
      });

    }
    catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  };


// SEARCH USERS
const searchUsers =
  async (req, res) => {

    try{

      const search =
        req.query.search || "";

      const users =
        await User.find({
          isBanned:false,
          $or:[
            {
              fullName:{
                $regex:search,
                $options:"i",
              },
            },
            {
              email:{
                $regex:search,
                $options:"i",
              },
            },
            {
              university:{
                $regex:search,
                $options:"i",
              },
            },
            {
              department:{
                $regex:search,
                $options:"i",
              },
            },
          ],
        })
        .select("-password -bookmarks")
        .limit(10);

      res.status(200).json(users.map((user) => ({
        _id:user._id,
        fullName:user.fullName,
        email:user.email,
        avatar:user.avatar,
        university:user.university,
        department:user.department,
        followersCount:user.followers.length,
        followingCount:user.following.length,
      })));

    }
    catch(error){

      res.status(500).json({
        message:error.message,
      });
    }
  };


module.exports = {
  getMyProfile,
  updateProfile,
  getPublicProfile,
  toggleFollowUser,
  adminDashboard,
  uploadAvatar,
  searchUsers,
};

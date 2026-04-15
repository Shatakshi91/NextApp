const asyncHandler = require('express-async-handler');
const User         = require('../models/User');
const { cloudinary, uploadProfile } = require('../config/cloudinary');

// GET /api/users  – all users except current user
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select('name email profilePic bio isOnline lastSeen')
    .sort({ isOnline: -1, name: 1 });
  res.json({ success: true, users });
});

// PUT /api/users/profile  – update name, bio, profilePic
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (bio  !== undefined) user.bio  = bio;

  // Handle new profile image
  if (req.file) {
    // Delete old image from Cloudinary
    if (user.profilePicPublicId) {
      await cloudinary.uploader.destroy(user.profilePicPublicId).catch(() => {});
    }
    user.profilePic         = req.file.path;
    user.profilePicPublicId = req.file.filename;
  }

  await user.save();
  res.json({ success: true, message: 'Profile updated', user });
});

// PUT /api/users/password
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ success: false, message: 'Incorrect current password' });
  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated' });
});

module.exports = { getUsers, updateProfile, updatePassword };

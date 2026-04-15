const express = require('express');
const r = express.Router();
const { getUsers, updateProfile, updatePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../config/cloudinary');

r.get('/',           protect, getUsers);
r.put('/profile',    protect, uploadProfile.single('profilePic'), updateProfile);
r.put('/password',   protect, updatePassword);
module.exports = r;

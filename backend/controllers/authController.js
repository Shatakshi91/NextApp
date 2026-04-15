const asyncHandler = require('express-async-handler');
const User         = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ success: false, message: 'All fields required' });

  if (await User.findOne({ email }))
    return res.status(400).json({ success: false, message: 'Email already registered' });

  const user = await User.create({ name, email, password });
  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token
  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      profilePic: user.profilePic,
      bio:        user.bio,
      isOnline:   true,
    },
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required' });

  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const accessToken  = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Limit stored refresh tokens to 5 (max 5 devices)
  user.refreshTokens.push(refreshToken);
  if (user.refreshTokens.length > 5) user.refreshTokens.shift();
  user.isOnline = true;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      _id:        user._id,
      name:       user.name,
      email:      user.email,
      profilePic: user.profilePic,
      bio:        user.bio,
      isOnline:   true,
    },
  });
});

// POST /api/auth/refresh
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token))
    return res.status(401).json({ success: false, message: 'Refresh token revoked' });

  const newAccessToken  = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  // Rotate refresh token
  user.refreshTokens = user.refreshTokens.filter(t => t !== token);
  user.refreshTokens.push(newRefreshToken);
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const user = await User.findById(req.user._id).select('+refreshTokens');
  if (user && token) {
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    user.isOnline = false;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });
  }
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = { register, login, refreshToken, logout, getMe };

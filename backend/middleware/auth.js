const asyncHandler      = require('express-async-handler');
const User              = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

const protect = asyncHandler(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorised – no token' });

  const token = auth.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = await User.findById(decoded.id).select('-password -refreshTokens');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

module.exports = { protect };

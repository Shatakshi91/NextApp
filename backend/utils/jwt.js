const jwt = require('jsonwebtoken');

/**
 * Generate short-lived access token (15 min)
 */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });

/**
 * Generate long-lived refresh token (7 days)
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });

/**
 * Verify access token
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };

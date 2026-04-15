// authRoutes.js
const express = require('express');
const r = express.Router();
const { register, login, refreshToken, logout, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
r.post('/register', register);
r.post('/login',    login);
r.post('/refresh',  refreshToken);
r.post('/logout',   protect, logout);
r.get('/me',        protect, getMe);
module.exports = r;

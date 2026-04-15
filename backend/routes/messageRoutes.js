const express = require('express');
const r = express.Router();
const { getMessages, sendMessage, markSeen, deleteMessage, getUnreadCounts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { uploadMessage } = require('../config/cloudinary');

r.get('/unread',             protect, getUnreadCounts);
r.get('/:userId',            protect, getMessages);
r.post('/:userId',           protect, uploadMessage.single('image'), sendMessage);
r.patch('/seen/:userId',     protect, markSeen);
r.delete('/:messageId',      protect, deleteMessage);
module.exports = r;

const asyncHandler = require('express-async-handler');
const Message      = require('../models/Message');
const User         = require('../models/User');

// GET /api/messages/:userId  – paginated conversation
const getMessages = asyncHandler(async (req, res) => {
  const myId    = req.user._id;
  const otherId = req.params.userId;
  const page    = parseInt(req.query.page)  || 1;
  const limit   = parseInt(req.query.limit) || 30;
  const skip    = (page - 1) * limit;

  const filter = {
    $or: [
      { senderId: myId,    receiverId: otherId, deletedBySender:   false },
      { senderId: otherId, receiverId: myId,    deletedByReceiver: false },
    ],
  };

  const [messages, total] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Message.countDocuments(filter),
  ]);

  res.json({
    success: true,
    messages: messages.reverse(), // oldest first
    page,
    hasMore: skip + messages.length < total,
    total,
  });
});

// POST /api/messages/:userId  – send message
const sendMessage = asyncHandler(async (req, res) => {
  const senderId   = req.user._id;
  const receiverId = req.params.userId;
  const { text }   = req.body;

  if (!text && !req.file)
    return res.status(400).json({ success: false, message: 'Message text or image required' });

  const message = await Message.create({
    senderId,
    receiverId,
    text:      text?.trim() || '',
    image:     req.file ? req.file.path     : '',
    imagePublicId: req.file ? req.file.filename : '',
    delivered: true,
  });

  // Emit via Socket.io
  const io = req.app.get('io');
  if (io) {
    const socketHandler = require('../socket/socketHandler');
    const receiverSocketId = socketHandler.getSocketId(receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', message);
    }
  }

  res.status(201).json({ success: true, message });
});

// PATCH /api/messages/seen/:userId  – mark all messages from userId as seen
const markSeen = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { senderId: req.params.userId, receiverId: req.user._id, seen: false },
    { seen: true }
  );

  // Notify sender their messages were read
  const io = req.app.get('io');
  if (io) {
    const socketHandler = require('../socket/socketHandler');
    const senderSocketId = socketHandler.getSocketId(req.params.userId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('messages_seen', {
        by:       req.user._id,
        withUser: req.params.userId,
      });
    }
  }

  res.json({ success: true });
});

// DELETE /api/messages/:messageId  – soft delete
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

  const isSender   = message.senderId.toString()   === req.user._id.toString();
  const isReceiver = message.receiverId.toString()  === req.user._id.toString();

  if (!isSender && !isReceiver)
    return res.status(403).json({ success: false, message: 'Not authorised' });

  if (isSender)   message.deletedBySender   = true;
  if (isReceiver) message.deletedByReceiver = true;
  await message.save();

  res.json({ success: true, message: 'Message deleted' });
});

// GET /api/messages/unread  – unread counts per sender
const getUnreadCounts = asyncHandler(async (req, res) => {
  const counts = await Message.aggregate([
    { $match: { receiverId: req.user._id, seen: false } },
    { $group: { _id: '$senderId', count: { $sum: 1 } } },
  ]);
  const map = {};
  counts.forEach(c => { map[c._id.toString()] = c.count; });
  res.json({ success: true, unreadCounts: map });
});

module.exports = { getMessages, sendMessage, markSeen, deleteMessage, getUnreadCounts };

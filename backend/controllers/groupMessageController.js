const asyncHandler   = require('express-async-handler');
const Group          = require('../models/Group');
const GroupMessage   = require('../models/GroupMessage');

// GET /api/groups/:groupId/messages
const getGroupMessages = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (!group.hasMember(req.user._id)) return res.status(403).json({ success: false, message: 'Not a member' });

  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 30;
  const skip  = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    GroupMessage.find({ groupId: req.params.groupId, deletedBy: { $ne: req.user._id } })
      .populate('senderId', 'name profilePic')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    GroupMessage.countDocuments({ groupId: req.params.groupId }),
  ]);

  res.json({ success: true, messages: messages.reverse(), page, hasMore: skip + messages.length < total, total });
});

// POST /api/groups/:groupId/messages
const sendGroupMessage = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const member = group.getMember(req.user._id);
  if (!member) return res.status(403).json({ success: false, message: 'Not a member' });
  if (member.isMuted) return res.status(403).json({ success: false, message: 'You are muted in this group' });
  if (member.isBanned) return res.status(403).json({ success: false, message: 'You are banned' });

  const { text } = req.body;
  if (!text && !req.file) return res.status(400).json({ success: false, message: 'Message required' });

  const message = await GroupMessage.create({
    groupId:  group._id,
    senderId: req.user._id,
    text:     text?.trim() || '',
    image:    req.file ? req.file.path     : '',
    imagePublicId: req.file ? req.file.filename : '',
    type:     req.file ? 'image' : 'text',
  });

  const populated = await message.populate('senderId', 'name profilePic');

  // Update group lastMessage snapshot
  group.lastMessage = {
    text:      message.text || '📷 Image',
    sender:    req.user.name,
    createdAt: message.createdAt,
  };
  await group.save();

  // Emit to all group members
  const io = req.app.get('io');
  if (io) io.to(`group_${group._id}`).emit('receive_group_message', populated);

  res.status(201).json({ success: true, message: populated });
});

// PATCH /api/groups/:groupId/messages/read
const markGroupMessagesRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  await GroupMessage.updateMany(
    { groupId: req.params.groupId, 'readBy.user': { $ne: userId } },
    { $push: { readBy: { user: userId, readAt: new Date() } } }
  );
  res.json({ success: true });
});

// DELETE /api/groups/:groupId/messages/:messageId
const deleteGroupMessage = asyncHandler(async (req, res) => {
  const message = await GroupMessage.findById(req.params.messageId);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

  const group    = await Group.findById(req.params.groupId);
  const member   = group?.getMember(req.user._id);
  const isAuthor = message.senderId.toString() === req.user._id.toString();
  const canDelete = isAuthor || ['admin','moderator'].includes(member?.role);

  if (!canDelete) return res.status(403).json({ success: false, message: 'Not authorised' });

  message.deletedBy.push(req.user._id);
  await message.save();

  const io = req.app.get('io');
  if (io) io.to(`group_${group._id}`).emit('group_message_deleted', { messageId: message._id });

  res.json({ success: true });
});

module.exports = { getGroupMessages, sendGroupMessage, markGroupMessagesRead, deleteGroupMessage };

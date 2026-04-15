const mongoose = require('mongoose');

const readBySchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  readAt: { type: Date, default: Date.now },
}, { _id: false });

const groupMessageSchema = new mongoose.Schema({
  groupId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  text:     { type: String, default: '' },
  image:    { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  // System messages (member joined, left, etc.)
  type:     { type: String, enum: ['text', 'image', 'system'], default: 'text' },
  readBy:   [readBySchema],
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

groupMessageSchema.index({ groupId: 1, createdAt: -1 });

module.exports = mongoose.model('GroupMessage', groupMessageSchema);

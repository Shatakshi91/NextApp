const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  text:       { type: String, default: '' },
  image:      { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  seen:       { type: Boolean, default: false },
  delivered:  { type: Boolean, default: false },
  // Soft delete support
  deletedBySender:   { type: Boolean, default: false },
  deletedByReceiver: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index for fast conversation queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);

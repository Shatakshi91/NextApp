const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  // Soft mute/ban within group
  isMuted:  { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
}, { _id: false });

const groupSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
  description: { type: String, default: '', maxlength: 200 },
  avatar:      { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [memberSchema],
  // Invite link
  inviteCode:  { type: String, unique: true, sparse: true },
  isPrivate:   { type: Boolean, default: false },
  // Last message snapshot for sidebar preview
  lastMessage: {
    text:      { type: String, default: '' },
    sender:    { type: String, default: '' },
    createdAt: { type: Date },
  },
}, { timestamps: true });

// Index for fast member lookup
groupSchema.index({ 'members.user': 1 });

// Convenience: check if a user is in the group
groupSchema.methods.hasMember = function (userId) {
  return this.members.some(m => m.user.toString() === userId.toString() && !m.isBanned);
};

// Get a member's role
groupSchema.methods.getMember = function (userId) {
  return this.members.find(m => m.user.toString() === userId.toString());
};

module.exports = mongoose.model('Group', groupSchema);

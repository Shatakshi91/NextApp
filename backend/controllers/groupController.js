const asyncHandler = require('express-async-handler');
const Group        = require('../models/Group');
const GroupMessage = require('../models/GroupMessage');
const { cloudinary, uploadProfile } = require('../config/cloudinary');
const crypto       = require('crypto');

// ── Helper ─────────────────────────────────────────────────────────────────
const generateInviteCode = () => crypto.randomBytes(6).toString('hex');

// ── Create Group ───────────────────────────────────────────────────────────
// POST /api/groups
const createGroup = asyncHandler(async (req, res) => {
  let { name, description, memberIds = [], isPrivate = false } = req.body;

  if (!name) return res.status(400).json({ success: false, message: 'Group name required' });

  // ✅ FIX: ensure memberIds is always an array
  if (!Array.isArray(memberIds)) {
    memberIds = [memberIds];
  }

  const uniqueMembers = [...new Set([...memberIds, req.user._id.toString()])];

  const members = uniqueMembers.map(uid => ({
    user: uid,
    role: uid === req.user._id.toString() ? 'admin' : 'member',
  }));

  const group = await Group.create({
    name,
    description: description || '',
    createdBy:   req.user._id,
    members,
    isPrivate,
    inviteCode:  generateInviteCode(),
    avatar:      req.file ? req.file.path     : '',
    avatarPublicId: req.file ? req.file.filename : '',
  });

  const populated = await group.populate('members.user', 'name profilePic isOnline');

  // Notify all members via socket
  const io = req.app.get('io');
  if (io) {
    const { getSocketId } = require('../socket/socketHandler');
    members.forEach(m => {
      const sid = getSocketId(m.user.toString());
      if (sid) io.to(sid).emit('group_created', populated);
    });
  }

  // System message
  await GroupMessage.create({
    groupId:  group._id,
    senderId: req.user._id,
    text:     `${req.user.name} created the group`,
    type:     'system',
  });

  res.status(201).json({ success: true, group: populated });
});

// ── Get My Groups ──────────────────────────────────────────────────────────
// GET /api/groups
const getMyGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id, 'members.isBanned': false })
    .populate('members.user', 'name profilePic isOnline')
    .populate('createdBy', 'name')
    .sort({ updatedAt: -1 });
  res.json({ success: true, groups });
});

// ── Get Single Group ───────────────────────────────────────────────────────
// GET /api/groups/:groupId
const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId)
    .populate('members.user', 'name profilePic isOnline lastSeen')
    .populate('createdBy', 'name profilePic');

  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (!group.hasMember(req.user._id))
    return res.status(403).json({ success: false, message: 'Not a member' });

  res.json({ success: true, group });
});

// ── Update Group Info ──────────────────────────────────────────────────────
// PUT /api/groups/:groupId
const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const member = group.getMember(req.user._id);
  if (!member || !['admin', 'moderator'].includes(member.role))
    return res.status(403).json({ success: false, message: 'Admin/moderator only' });

  const { name, description, isPrivate } = req.body;
  if (name)        group.name        = name;
  if (description !== undefined) group.description = description;
  if (isPrivate   !== undefined) group.isPrivate   = isPrivate;

  if (req.file) {
    if (group.avatarPublicId) await cloudinary.uploader.destroy(group.avatarPublicId).catch(() => {});
    group.avatar          = req.file.path;
    group.avatarPublicId  = req.file.filename;
  }

  await group.save();
  const populated = await group.populate('members.user', 'name profilePic isOnline');

  const io = req.app.get('io');
  if (io) io.to(`group_${group._id}`).emit('group_updated', populated);

  res.json({ success: true, group: populated });
});

// ── Add Members ────────────────────────────────────────────────────────────
// POST /api/groups/:groupId/members
const addMembers = asyncHandler(async (req, res) => {
  const { userIds } = req.body;
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const member = group.getMember(req.user._id);
  if (!member || !['admin', 'moderator'].includes(member.role))
    return res.status(403).json({ success: false, message: 'Admin/moderator only' });

  const added = [];
  for (const uid of userIds) {
    const exists = group.members.find(m => m.user.toString() === uid);
    if (!exists) {
      group.members.push({ user: uid, role: 'member' });
      added.push(uid);
    } else if (exists.isBanned) {
      return res.status(400).json({ success: false, message: `User ${uid} is banned` });
    }
  }

  await group.save();
  const populated = await group.populate('members.user', 'name profilePic isOnline');

  // System messages + socket notifications
  const io = req.app.get('io');
  const { getSocketId } = require('../socket/socketHandler');
  for (const uid of added) {
    await GroupMessage.create({ groupId: group._id, senderId: req.user._id, text: `${req.user.name} added a new member`, type: 'system' });
    const sid = getSocketId(uid);
    if (sid && io) io.to(sid).emit('added_to_group', populated);
  }
  if (io) io.to(`group_${group._id}`).emit('group_updated', populated);

  res.json({ success: true, group: populated });
});

// ── Remove Member ──────────────────────────────────────────────────────────
// DELETE /api/groups/:groupId/members/:userId
const removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const requestor = group.getMember(req.user._id);
  const isSelf    = req.params.userId === req.user._id.toString();

  if (!isSelf && (!requestor || requestor.role !== 'admin'))
    return res.status(403).json({ success: false, message: 'Admin only' });

  // Cannot remove the creator
  if (group.createdBy.toString() === req.params.userId && !isSelf)
    return res.status(400).json({ success: false, message: 'Cannot remove the group creator' });

  group.members = group.members.filter(m => m.user.toString() !== req.params.userId);

  // If group empty after removal, delete it
  if (group.members.length === 0) {
    await group.deleteOne();
    return res.json({ success: true, message: 'Group deleted (no members left)' });
  }

  // If admin left, promote next member
  if (isSelf && requestor?.role === 'admin' && group.members.length > 0) {
    group.members[0].role = 'admin';
  }

  await group.save();
  const populated = await group.populate('members.user', 'name profilePic isOnline');

  const io = req.app.get('io');
  if (io) {
    const { getSocketId } = require('../socket/socketHandler');
    const leftSid = getSocketId(req.params.userId);
    if (leftSid) io.to(leftSid).emit('removed_from_group', { groupId: group._id });
    io.to(`group_${group._id}`).emit('group_updated', populated);
  }

  await GroupMessage.create({
    groupId: group._id, senderId: req.user._id,
    text: isSelf ? `${req.user.name} left the group` : `A member was removed`,
    type: 'system',
  });

  res.json({ success: true, group: populated });
});

// ── Change Member Role ─────────────────────────────────────────────────────
// PATCH /api/groups/:groupId/members/:userId/role
const changeMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin','moderator','member'].includes(role))
    return res.status(400).json({ success: false, message: 'Invalid role' });

  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const requestor = group.getMember(req.user._id);
  if (!requestor || requestor.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin only' });

  const target = group.getMember(req.params.userId);
  if (!target) return res.status(404).json({ success: false, message: 'Member not found' });

  target.role = role;
  await group.save();
  const populated = await group.populate('members.user', 'name profilePic isOnline');

  const io = req.app.get('io');
  if (io) io.to(`group_${group._id}`).emit('group_updated', populated);

  res.json({ success: true, group: populated });
});

// ── Mute / Ban Member ──────────────────────────────────────────────────────
// PATCH /api/groups/:groupId/members/:userId/mute
const muteMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const requestor = group.getMember(req.user._id);
  if (!requestor || !['admin','moderator'].includes(requestor.role))
    return res.status(403).json({ success: false, message: 'Admin/moderator only' });

  const target = group.getMember(req.params.userId);
  if (!target) return res.status(404).json({ success: false, message: 'Member not found' });

  target.isMuted = !target.isMuted;
  await group.save();
  res.json({ success: true, isMuted: target.isMuted });
});

// ── Generate New Invite Code ───────────────────────────────────────────────
// POST /api/groups/:groupId/invite
const regenerateInvite = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

  const member = group.getMember(req.user._id);
  if (!member || member.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admin only' });

  group.inviteCode = generateInviteCode();
  await group.save();
  res.json({ success: true, inviteCode: group.inviteCode });
});

// ── Join Via Invite Code ───────────────────────────────────────────────────
// POST /api/groups/join/:inviteCode
const joinViaInvite = asyncHandler(async (req, res) => {
  const group = await Group.findOne({ inviteCode: req.params.inviteCode });
  if (!group) return res.status(404).json({ success: false, message: 'Invalid invite code' });
  if (group.isPrivate) return res.status(403).json({ success: false, message: 'Private group – need admin approval' });

  const already = group.getMember(req.user._id);
  if (already && !already.isBanned) {
    const populated = await group.populate('members.user', 'name profilePic isOnline');
    return res.json({ success: true, group: populated, alreadyMember: true });
  }

  if (already?.isBanned) return res.status(403).json({ success: false, message: 'You are banned from this group' });

  group.members.push({ user: req.user._id, role: 'member' });
  await group.save();

  const populated = await group.populate('members.user', 'name profilePic isOnline');

  const io = req.app.get('io');
  if (io) io.to(`group_${group._id}`).emit('group_updated', populated);

  await GroupMessage.create({ groupId: group._id, senderId: req.user._id, text: `${req.user.name} joined via invite link`, type: 'system' });

  res.json({ success: true, group: populated });
});

// ── Delete Group ───────────────────────────────────────────────────────────
// DELETE /api/groups/:groupId
const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.groupId);
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.createdBy.toString() !== req.user._id.toString())
    return res.status(403).json({ success: false, message: 'Only the creator can delete this group' });

  if (group.avatarPublicId) await cloudinary.uploader.destroy(group.avatarPublicId).catch(() => {});
  await GroupMessage.deleteMany({ groupId: group._id });
  await group.deleteOne();

  const io = req.app.get('io');
  if (io) io.to(`group_${group._id}`).emit('group_deleted', { groupId: group._id });

  res.json({ success: true, message: 'Group deleted' });
});

module.exports = {
  createGroup, getMyGroups, getGroup, updateGroup,
  addMembers, removeMember, changeMemberRole, muteMember,
  regenerateInvite, joinViaInvite, deleteGroup,
};

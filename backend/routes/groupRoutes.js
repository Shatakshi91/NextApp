const express = require('express');
const r       = express.Router();
const {
  createGroup, getMyGroups, getGroup, updateGroup,
  addMembers, removeMember, changeMemberRole, muteMember,
  regenerateInvite, joinViaInvite, deleteGroup,
} = require('../controllers/groupController');
const {
  getGroupMessages, sendGroupMessage, markGroupMessagesRead, deleteGroupMessage,
} = require('../controllers/groupMessageController');
const { protect } = require('../middleware/auth');
const { uploadProfile, uploadMessage } = require('../config/cloudinary');

// Group CRUD
r.post('/',                            protect, uploadProfile.single('avatar'), createGroup);
r.get('/',                             protect, getMyGroups);
r.get('/:groupId',                     protect, getGroup);
r.put('/:groupId',                     protect, uploadProfile.single('avatar'), updateGroup);
r.delete('/:groupId',                  protect, deleteGroup);

// Member management
r.post('/:groupId/members',            protect, addMembers);
r.delete('/:groupId/members/:userId',  protect, removeMember);
r.patch('/:groupId/members/:userId/role', protect, changeMemberRole);
r.patch('/:groupId/members/:userId/mute', protect, muteMember);

// Invite
r.post('/:groupId/invite',             protect, regenerateInvite);
r.post('/join/:inviteCode',            protect, joinViaInvite);

// Messages
r.get('/:groupId/messages',            protect, getGroupMessages);
r.post('/:groupId/messages',           protect, uploadMessage.single('image'), sendGroupMessage);
r.patch('/:groupId/messages/read',     protect, markGroupMessagesRead);
r.delete('/:groupId/messages/:messageId', protect, deleteGroupMessage);

module.exports = r;

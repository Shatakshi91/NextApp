const User  = require('../models/User');
const Group = require('../models/Group');
const { verifyAccessToken } = require('../utils/jwt');

// userId -> socketIds map. A user can be connected from multiple tabs/devices.
const userSocketMap = new Map();

const getSocketIds = (userId) => Array.from(userSocketMap.get(userId) || []);
const getSocketId = (userId) => getSocketIds(userId)[0];
const getOnlineUsers = () => Array.from(userSocketMap.keys());

const addUserSocket = (userId, socketId) => {
  const socketIds = userSocketMap.get(userId) || new Set();
  socketIds.add(socketId);
  userSocketMap.set(userId, socketIds);
  return socketIds.size;
};

const removeUserSocket = (userId, socketId) => {
  const socketIds = userSocketMap.get(userId);
  if (!socketIds) return 0;

  socketIds.delete(socketId);
  if (socketIds.size === 0) {
    userSocketMap.delete(userId);
    return 0;
  }

  return socketIds.size;
};

module.exports = function socketHandler(io) {

  // ── Auth middleware ──────────────────────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = verifyAccessToken(token);
      const user    = await User.findById(decoded.id).select('_id name profilePic');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`✅ Connected: ${socket.user.name} [${socket.id}]`);

    const connectionCount = addUserSocket(userId, socket.id);
    if (connectionCount === 1) {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    }
    io.emit('online_users', getOnlineUsers());

    // Auto-join all group rooms
    try {
      const userGroups = await Group.find({ 'members.user': userId }).select('_id');
      userGroups.forEach(g => socket.join(`group_${g._id}`));
    } catch (e) { /* ignore */ }

    // ── Group room join/leave ──────────────────────────────────────
    socket.on('join_group', (groupId) => socket.join(`group_${groupId}`));
    socket.on('leave_group', (groupId) => socket.leave(`group_${groupId}`));

    // ── DM typing ─────────────────────────────────────────────────
    socket.on('typing_start', ({ receiverId }) => {
      const socketIds = getSocketIds(receiverId);
      if (socketIds.length) io.to(socketIds).emit('user_typing', { senderId: userId });
    });
    socket.on('typing_stop', ({ receiverId }) => {
      const socketIds = getSocketIds(receiverId);
      if (socketIds.length) io.to(socketIds).emit('user_stop_typing', { senderId: userId });
    });

    // ── Group typing ───────────────────────────────────────────────
    socket.on('group_typing_start', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('group_user_typing', { groupId, senderId: userId, name: socket.user.name });
    });
    socket.on('group_typing_stop', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('group_user_stop_typing', { groupId, senderId: userId });
    });

    // ── Seen ───────────────────────────────────────────────────────
    socket.on('mark_seen', ({ senderId }) => {
      const socketIds = getSocketIds(senderId);
      if (socketIds.length) io.to(socketIds).emit('messages_seen', { by: userId });
    });

    // ── Disconnect ─────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`❌ Disconnected: ${socket.user.name}`);
      const remainingConnections = removeUserSocket(userId, socket.id);
      if (remainingConnections > 0) {
        io.emit('online_users', getOnlineUsers());
        return;
      }

      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });
      io.emit('online_users', getOnlineUsers());
      io.emit('user_offline', { userId, lastSeen });
    });
  });
};

module.exports.getSocketId    = getSocketId;
module.exports.getSocketIds   = getSocketIds;
module.exports.getOnlineUsers = getOnlineUsers;

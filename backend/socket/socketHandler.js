const User  = require('../models/User');
const Group = require('../models/Group');
const { verifyAccessToken } = require('../utils/jwt');

// userId → socketId map
const userSocketMap = new Map();

const getSocketId    = (userId) => userSocketMap.get(userId);
const getOnlineUsers = ()       => Array.from(userSocketMap.keys());

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

    userSocketMap.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('online_users', getOnlineUsers());

    // Auto-join all group rooms
    try {
      const userGroups = await Group.find({ 'members.user': userId }).select('_id');
      userGroups.forEach(g => socket.join(`group_${g._id}`));
    } catch (e) { /* ignore */ }

    // ── DM send_message ────────────────────────────────────────────
    socket.on('send_message', (data) => {
      const sid = userSocketMap.get(data.receiverId);
      if (sid) io.to(sid).emit('receive_message', { ...data, senderId: userId, createdAt: new Date() });
    });

    // ── Group message ──────────────────────────────────────────────
    socket.on('send_group_message', (data) => {
      io.to(`group_${data.groupId}`).emit('receive_group_message', data);
    });

    // ── Group room join/leave ──────────────────────────────────────
    socket.on('join_group', (groupId) => socket.join(`group_${groupId}`));
    socket.on('leave_group', (groupId) => socket.leave(`group_${groupId}`));

    // ── DM typing ─────────────────────────────────────────────────
    socket.on('typing_start', ({ receiverId }) => {
      const sid = userSocketMap.get(receiverId);
      if (sid) io.to(sid).emit('user_typing', { senderId: userId });
    });
    socket.on('typing_stop', ({ receiverId }) => {
      const sid = userSocketMap.get(receiverId);
      if (sid) io.to(sid).emit('user_stop_typing', { senderId: userId });
    });

    // ── Group typing ───────────────────────────────────────────────
    socket.on('group_typing_start', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('group_user_typing', { senderId: userId, name: socket.user.name });
    });
    socket.on('group_typing_stop', ({ groupId }) => {
      socket.to(`group_${groupId}`).emit('group_user_stop_typing', { senderId: userId });
    });

    // ── Seen ───────────────────────────────────────────────────────
    socket.on('mark_seen', ({ senderId }) => {
      const sid = userSocketMap.get(senderId);
      if (sid) io.to(sid).emit('messages_seen', { by: userId });
    });

    // ── Disconnect ─────────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`❌ Disconnected: ${socket.user.name}`);
      userSocketMap.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      io.emit('online_users', getOnlineUsers());
      io.emit('user_offline', { userId, lastSeen: new Date() });
    });
  });
};

module.exports.getSocketId    = getSocketId;
module.exports.getOnlineUsers = getOnlineUsers;

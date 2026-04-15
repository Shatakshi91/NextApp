const express   = require('express');
const http      = require('http');
const mongoose  = require('mongoose');
const cors      = require('cors');
const dotenv    = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

const app    = express();
const server = http.createServer(app);

// ── Socket.io setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') ||
          origin === process.env.CLIENT_URL || origin === 'http://localhost:5173')
        return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Attach io to app so controllers can emit
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') ||
        origin === process.env.CLIENT_URL || origin === 'http://localhost:5173')
      return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/groups',   require('./routes/groupRoutes'));

app.get('/', (req, res) => res.json({ message: '⚡ NexChat API running' }));

// ── Socket.io logic ───────────────────────────────────────────────────────────
require('./socket/socketHandler')(io);

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ── DB + Start ────────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('✅ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`🚀 NexChat server on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

module.exports = { io };

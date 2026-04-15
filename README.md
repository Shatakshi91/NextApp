# ⚡ NexChat – Real-Time Chat Application

> A production-ready, full-stack real-time chat app with DMs, group chats, media sharing, typing indicators, online status, and a stunning futuristic multi-theme UI.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | `https://nexchat.vercel.app` |
| **Backend**  | `https://nexchat-api.onrender.com` |

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend  | React 18, Vite, Tailwind CSS, Framer Motion, Zustand |
| Backend   | Node.js, Express, Socket.io |
| Database  | MongoDB + Mongoose |
| Auth      | JWT (Access + Refresh tokens) |
| Storage   | Cloudinary (images) |
| Payments  | — |
| Deploy    | Render (backend) + Vercel (frontend) |

---

## ✨ Features

### 💬 Messaging
- Real-time one-to-one DMs via Socket.io
- Real-time group messaging
- Image sharing (Cloudinary)
- Message seen / delivered status (✓ / ✓✓)
- Typing indicators (debounced)
- Optimistic UI updates
- Infinite scroll / pagination (30 msgs/page)
- Emoji picker
- Auto-scroll to latest message

### 👥 Group Chat
- Create groups with avatar + description
- Add / remove members
- Role system: **Admin → Moderator → Member**
- Admins can promote/demote members
- Mute individual members
- Generate / regenerate invite links
- Join groups via invite code
- System messages (join/leave events)
- Real-time group updates via socket rooms
- Leave group / Delete group

### 🔐 Authentication
- JWT access tokens (15 min) + refresh tokens (7 days)
- Auto token refresh with queued retry
- Secure bcrypt password hashing
- Persistent login (localStorage)
- Multi-device support (up to 5 refresh tokens)
- Online / offline status tracking

### 🎨 UI / UX
- **4 themes**: Dark, Neon, Cyberpunk, Aurora
- Glassmorphism design language
- Framer Motion animations throughout
- Loading skeletons + shimmer effects
- Noise texture overlay
- Grid background pattern
- Responsive (mobile + desktop)
- Custom scrollbars

---

## 📁 Project Structure

```
nexchat/
├── backend/
│   ├── config/
│   │   └── cloudinary.js         # Multer + Cloudinary
│   ├── controllers/
│   │   ├── authController.js     # Register, login, refresh, logout
│   │   ├── userController.js     # Profile, password, list
│   │   ├── messageController.js  # DM send, get, seen, delete
│   │   ├── groupController.js    # Group CRUD + member management
│   │   └── groupMessageController.js
│   ├── middleware/
│   │   └── auth.js               # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   ├── Group.js
│   │   └── GroupMessage.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── messageRoutes.js
│   │   └── groupRoutes.js
│   ├── socket/
│   │   └── socketHandler.js      # All Socket.io events + rooms
│   ├── utils/
│   │   └── jwt.js                # Token helpers
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── Sidebar.jsx         # Users + groups list
│   │   │   │   ├── ChatWindow.jsx      # DM conversation
│   │   │   │   ├── MessageBubble.jsx   # Sent / received bubbles
│   │   │   │   ├── MessageInput.jsx    # Text + emoji + image
│   │   │   │   ├── TypingIndicator.jsx
│   │   │   │   └── WelcomeScreen.jsx
│   │   │   ├── group/
│   │   │   │   ├── GroupWindow.jsx     # Group chat view
│   │   │   │   ├── GroupInfoPanel.jsx  # Member management panel
│   │   │   │   ├── CreateGroupModal.jsx
│   │   │   │   ├── AddMembersModal.jsx
│   │   │   │   └── JoinGroupModal.jsx
│   │   │   ├── common/
│   │   │   │   └── Navbar.jsx          # Theme switcher + profile
│   │   │   └── ui/
│   │   │       └── ImageModal.jsx      # Fullscreen image preview
│   │   ├── hooks/
│   │   │   ├── useSocket.js    # Wire all socket events to stores
│   │   │   └── useTyping.js    # Debounced typing hook
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ChatPage.jsx
│   │   ├── store/
│   │   │   ├── authStore.js    # Auth + JWT
│   │   │   ├── chatStore.js    # DM state
│   │   │   ├── groupStore.js   # Group state
│   │   │   └── themeStore.js   # Theme switcher
│   │   ├── utils/
│   │   │   ├── axios.js        # Axios + auto-refresh interceptor
│   │   │   └── socket.js       # Socket.io singleton
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css           # Tailwind + 4 CSS themes
│   ├── .env
│   ├── vercel.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── render.yaml
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
MONGODB_URL=mongodb://localhost:27017/nexchat

JWT_SECRET=NexChat_SuperSecret_JWT_Key_2024
JWT_REFRESH_SECRET=NexChat_Refresh_Secret_2024
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> In production on Vercel:
> ```
> VITE_API_URL=https://nexchat-api.onrender.com/api
> VITE_SOCKET_URL=https://nexchat-api.onrender.com
> ```

---

## 🚀 Local Development

```bash
# 1. Clone and install
git clone https://github.com/your-username/nexchat.git
cd nexchat

# 2. Backend
cd backend && npm install
# edit .env with your MongoDB + Cloudinary credentials
npm run dev        # → http://localhost:5000

# 3. Frontend (new terminal)
cd ../frontend && npm install
npm run dev        # → http://localhost:5173
```

---

## 🌐 Deploy on Render (Backend)

1. [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Settings:

| Field | Value |
|-------|-------|
| Root Directory | `backend` |
| Build Command  | `npm install` |
| Start Command  | `npm start` |

4. **Environment Variables**:

| Key | Value |
|-----|-------|
| `MONGODB_URL`         | MongoDB Atlas URI |
| `JWT_SECRET`          | any strong random string |
| `JWT_REFRESH_SECRET`  | different strong random string |
| `JWT_EXPIRE`          | `15m` |
| `JWT_REFRESH_EXPIRE`  | `7d` |
| `CLOUDINARY_CLOUD_NAME` | your Cloudinary name |
| `CLOUDINARY_API_KEY`    | your Cloudinary key |
| `CLOUDINARY_API_SECRET` | your Cloudinary secret |
| `CLIENT_URL`          | `https://your-app.vercel.app` |
| `NODE_ENV`            | `production` |

---

## 🌐 Deploy on Vercel (Frontend)

1. [vercel.com](https://vercel.com) → **New Project** → import repo
2. Settings:

| Field | Value |
|-------|-------|
| Root Directory   | `frontend` |
| Build Command    | `npm run build` |
| Output Directory | `dist` |

3. **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL`    | `https://nexchat-api.onrender.com/api` |
| `VITE_SOCKET_URL` | `https://nexchat-api.onrender.com` |

4. `vercel.json` already handles React Router `/* → /index.html`

---

## 🔑 API Reference

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login`    | Login |
| POST | `/api/auth/refresh`  | Rotate access + refresh tokens |
| POST | `/api/auth/logout`   | Revoke refresh token |
| GET  | `/api/auth/me`       | Get current user |

### Users
| Method | Route | Description |
|--------|-------|-------------|
| GET  | `/api/users`          | List all users |
| PUT  | `/api/users/profile`  | Update profile + avatar |
| PUT  | `/api/users/password` | Change password |

### DM Messages
| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/api/messages/:userId`       | Get conversation (paginated) |
| POST   | `/api/messages/:userId`       | Send message (text + image) |
| PATCH  | `/api/messages/seen/:userId`  | Mark as seen |
| DELETE | `/api/messages/:messageId`    | Soft delete |
| GET    | `/api/messages/unread`        | Get unread counts per sender |

### Groups
| Method | Route | Description |
|--------|-------|-------------|
| POST   | `/api/groups`                              | Create group |
| GET    | `/api/groups`                              | Get my groups |
| GET    | `/api/groups/:groupId`                     | Get group details |
| PUT    | `/api/groups/:groupId`                     | Update group |
| DELETE | `/api/groups/:groupId`                     | Delete group |
| POST   | `/api/groups/:groupId/members`             | Add members |
| DELETE | `/api/groups/:groupId/members/:userId`     | Remove member |
| PATCH  | `/api/groups/:groupId/members/:userId/role`| Change role |
| PATCH  | `/api/groups/:groupId/members/:userId/mute`| Toggle mute |
| POST   | `/api/groups/:groupId/invite`              | Regen invite code |
| POST   | `/api/groups/join/:inviteCode`             | Join via invite |
| GET    | `/api/groups/:groupId/messages`            | Get group messages |
| POST   | `/api/groups/:groupId/messages`            | Send group message |
| PATCH  | `/api/groups/:groupId/messages/read`       | Mark all as read |
| DELETE | `/api/groups/:groupId/messages/:messageId` | Delete message |

---

## 🔌 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `send_message`         | `{ receiverId, text, image }` | Send DM |
| `send_group_message`   | `{ groupId, text, image }`    | Send group msg |
| `join_group`           | `groupId`                     | Join socket room |
| `leave_group`          | `groupId`                     | Leave socket room |
| `typing_start`         | `{ receiverId }`              | Start DM typing |
| `typing_stop`          | `{ receiverId }`              | Stop DM typing |
| `group_typing_start`   | `{ groupId }`                 | Start group typing |
| `group_typing_stop`    | `{ groupId }`                 | Stop group typing |
| `mark_seen`            | `{ senderId }`                | Mark DMs as seen |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `receive_message`       | `Message`     | New DM received |
| `receive_group_message` | `GroupMessage`| New group message |
| `online_users`          | `userId[]`    | Updated online list |
| `user_offline`          | `{ userId, lastSeen }` | User went offline |
| `user_typing`           | `{ senderId }`| DM typing start |
| `user_stop_typing`      | `{ senderId }`| DM typing stop |
| `group_user_typing`     | `{ senderId, name, groupId }` | Group typing |
| `group_user_stop_typing`| `{ senderId, groupId }` | Group typing stop |
| `messages_seen`         | `{ by }`      | DMs marked as read |
| `group_updated`         | `Group`       | Group info changed |
| `group_deleted`         | `{ groupId }` | Group was deleted |
| `added_to_group`        | `Group`       | You were added |
| `removed_from_group`    | `{ groupId }` | You were removed |
| `group_message_deleted` | `{ messageId, groupId }` | Message deleted |

---

## 🎨 Themes

| Theme | Description | Accent |
|-------|------------|--------|
| `dark`      | Deep navy — calm & focused    | Violet `#8b5cf6` |
| `neon`      | Electric blue — wired energy  | Cyan `#00f5ff` |
| `cyberpunk` | Hot pink — raw & aggressive   | Pink `#ff2d78` |
| `aurora`    | Forest green — natural & cool | Green `#39ff14` |

Switch themes via the palette button in the Navbar. Theme persists in `localStorage`.

---

## 🐛 Known Limitations (Free Tier)
- Render backend sleeps after 15 min inactivity — first request takes ~30s
- Socket.io reconnects automatically after backend wakes up
- In-memory `userSocketMap` resets on server restart (use Redis for production scale)

---

## 👤 Author

**Jaydeep** — Built with ⚡ using the MERN Stack + Socket.io

---

## 📄 License

MIT License
#   a d v a n c e d - c h a t - a p p  
 
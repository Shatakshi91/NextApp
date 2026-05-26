# NexChat Project Structure

NexChat is a two-app MERN workspace with a Node/Express API and a Vite React client.

## Workspace

```text
NextApp/
├── backend/     Express API, MongoDB models, Socket.io server
├── frontend/    Vite React app, Zustand stores, Socket.io client
├── docs/        Architecture and maintenance notes
└── package.json Root helper scripts for install, build, and start
```

## Backend Breakdown

```text
backend/
├── config/       Cloudinary and upload configuration
├── controllers/  Request handlers and business workflow orchestration
├── middleware/   Authentication middleware
├── models/       Mongoose schemas and indexes
├── routes/       API route definitions
├── socket/       Socket.io connection, presence, rooms, typing, read receipts
├── utils/        JWT helpers
└── server.js     Express, CORS, Socket.io, routes, database startup
```

Backend responsibility split:

- REST APIs own persistence and message creation.
- Socket.io owns realtime delivery, presence, group rooms, typing, and read receipts.
- Controllers emit persisted messages after the database write succeeds.
- Models define the durable data shape and query indexes.

## Frontend Breakdown

```text
frontend/src/
├── components/   UI sections split by chat, group, common, and ui primitives
├── hooks/        Socket listener wiring and typing behavior
├── pages/        Route-level screens
├── store/        Zustand auth, chat, group, and theme state
├── utils/        Axios and Socket.io singletons
├── App.jsx       Route guard and authenticated socket provider
└── main.jsx      React entry point
```

Frontend responsibility split:

- Stores call REST APIs for writes and keep local optimistic state.
- Socket listeners merge realtime updates into the stores.
- Components render state and trigger store actions only.
- Axios owns access-token attachment and refresh-token retry behavior.

## Maintenance Plan

1. Keep REST as the only path that creates or mutates persisted messages.
2. Keep Socket.io events idempotent on the client so reconnects and duplicate deliveries are safe.
3. Add controller-level authorization checks before every group-scoped mutation.
4. Keep pagination counts aligned with the exact visibility filter used for each query.
5. Add backend integration tests around auth, messaging, group membership, and unread/read behavior.
6. Add frontend tests for optimistic message replacement and socket duplicate handling.

# ⚡ ZoopIn: Hype-Driven Live Commerce

> Drop products. React in real-time. Buy the hype.

ZoopIn is a live commerce marketplace where sellers host live video drops and buyers watch, react, and shop: all in real-time. Built on a full MERN stack with WebRTC peer-to-peer streaming and Socket.io for real-time signaling and events. The UI follows a **Neubrutalist** design system: thick black borders, hard offset shadows, and high-contrast `#f4ff00` yellow: designed to create urgency and energy around every product drop.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, MongoDB (Mongoose) |
| Real-time | Socket.io (signaling + events) |
| Streaming | WebRTC (P2P video, signaled via Socket.io) |
| Auth | JWT stored in localStorage, managed via Zustand |
| Media | Cloudinary (product image uploads) |
| State | Zustand (`authStore.js`) |
| Design | Neubrutalism: 3px borders, hard shadows, `#f4ff00` palette |

---

## How It Works

ZoopIn has three core flows:

**Viewer**: Opens the landing page, browses live sessions in a TikTok-style vertical feed, joins a room, watches the P2P stream, sends hype emoji reactions, and submits questions to the host via a slide-up drawer.

**Shop Owner**: Signs in, creates a session, uploads products via Cloudinary, goes live, and switches the featured "Product Spotlight" during the stream. Every product switch is broadcast to all connected viewers instantly via a `product:changed` Socket.io event.

**Admin**: Signs in, monitors active sessions, viewer counts, submitted questions, and engagement analytics from the admin control center.

---

## Video Streaming Architecture

ZoopIn uses a custom WebRTC implementation for low-latency P2P streaming. Here's how the connection is established:

**Phase 1: Signaling via Socket.io**

WebRTC cannot discover peers on its own. ZoopIn uses Socket.io as a signaling layer. The host joins a room and emits `host:join`. The viewer joins and emits `viewer:join`. The host then sends an SDP Offer (session description) and ICE Candidates (network routing info) to the viewer through the socket server.

**Phase 2: P2P Media via WebRTC**

Once the handshake is complete, the video stream travels directly between the host and viewer: bypassing the server entirely. The host accesses camera and mic via `navigator.mediaDevices.getUserMedia` inside the `useWebRTCProducer.js` hook and attaches it to an `RTCPeerConnection`. The viewer receives the stream via the `ontrack` event inside `useWebRTCViewer.js` and renders it to a local `<video>` element.

**Bandwidth Optimization**

The `LiveFeed` component only creates a socket and WebRTC connection for the currently active slide. Scrolling past a session tears down the connection — saving bandwidth and keeping performance clean.

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page: live session discovery, live previews, how-to-use guide |
| `/live/:roomId` | Viewer room: P2P stream, hype reactions, question drawer |
| `/login` | Role-aware login: redirects to correct dashboard based on role |
| `/studio` | Shop owner control center: products, session controls, product switching |
| `/admin` | Admin dashboard: sessions, questions, analytics |

---

## Auth & Roles

Two roles exist in the system: `shop_owner` and `buyer`. Role-based navigation is handled via `authRoutes.js`, which redirects users to the correct dashboard on login. JWT tokens are stored in `localStorage` and passed as headers on all API requests. Session state is persisted client-side via Zustand.

---

## Project Structure

```
ZoopIn/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # Tools for sellers: Dashboard, Stream Controls
│   │   │   └── viewer/         # Tools for buyers: Reactions, Spotlight, Feed Slides
│   │   ├── hooks/
│   │   │   ├── useWebRTCProducer.js   # Host camera + peer connection logic
│   │   │   ├── useWebRTCViewer.js     # Viewer stream receive logic
│   │   │   ├── useReactions.js        # Floating emoji reaction engine
│   │   │   └── useSocket.js           # Socket.io connection management
│   │   └── store/
│   │       └── authStore.js    # Zustand: user session + role state
│   └── vercel.json             # SPA rewrite rules for Vercel deployment
└── server/
    └── ...                     # Express API + Socket.io server
```

---

## Local Setup

**Step 1: Install all dependencies**

```bash
npm run install-all
```

This installs dependencies for both `client/` and `server/` from the root.

**Step 2: Configure environment variables**

Create `server/.env` and `client/.env` using the variables listed in the section below. Fill in your MongoDB URI, Cloudinary credentials, JWT secret, and account credentials.

**Step 3: Start the dev server**

```bash
npm run dev
```

This runs both the Express backend and the Vite frontend concurrently.

---

## Environment Variables

### server/.env

```env
PORT=
MONGODB_URI=
MONGO_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
SHOP_OWNER_EMAIL=
SHOP_OWNER_PASSWORD=
CLIENT_URL=
NODE_ENV=
```

`ADMIN_PASSWORD` and `SHOP_OWNER_PASSWORD` must be bcrypt hashes: not plain text strings.

### client/.env

```env
VITE_API_URL=
VITE_SOCKET_URL=
```

Both should point to your backend server URL (e.g., `http://localhost:5000` in development).

---

## Default Dev Accounts

These are pre-configured accounts for local development. Do **not** use these in production.

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Shop Owner | owner@example.com | admin123 |

> ⚠️ Change all credentials before any real deployment. Passwords are stored as bcrypt hashes inside `server/.env`: update them there directly.

---

## Deployment

**Backend**: The `Procfile` at the root defines the start command. Deploy to Railway, Render, or Heroku. Set all `server/.env` variables in your platform's environment config. Set `CLIENT_URL` to your deployed frontend URL to configure CORS correctly.

**Frontend**: `client/vercel.json` handles SPA fallback rewrites so all routes resolve to `index.html`. Deploy the `client/` directory to Vercel. Set `VITE_API_URL` and `VITE_SOCKET_URL` to your deployed backend URL.

---

## Session Lifecycle

A session goes through three states: `Pending` (created, not yet live) → `Live` (actively streaming) → `Ended` (archived). During a live session, the host can switch the active product. This emits a `product:changed` Socket.io event which causes the `ProductSpotlight` component to update instantly for every connected viewer.

---

## Design System

ZoopIn uses a **Neubrutalist** design system across all components.

- **Borders**: Thick `3px` or `4px` solid black borders on all interactive elements
- **Shadows**: Hard, non-blurred box shadows (e.g., `8px 8px 0px 0px rgba(0,0,0,1)`)
- **Typography**: Spline Sans, `font-black`, heavy use of `italic` and `uppercase`
- **Colors**: Zoop Yellow `#f4ff00`, Pure Black `#000000`, Pure White `#FFFFFF`, Live Red `#dc2626`
- **Notifications**: Custom Neubrutalist toast system (`ToastContainer.jsx`) wired to a global Zustand store

Every interaction: questions, product switches, viewer reactions: is treated as a "Signal" to reinforce the high-energy, real-time aesthetic.

---

## Current Scope

ZoopIn is optimized for a minimal, functional live commerce workflow. Auth uses env-configured accounts instead of a full user registration system. The streaming model is one host broadcasting to many viewers via P2P. The product catalog, sessions, and all analytics are tied to the configured shop owner account.
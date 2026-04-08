<p align="center">
  <img src="client/public/zoopin-logo.png" alt="ZoopIn logo" width="360" />
</p>

<h1 align="center">ZoopIn</h1>

<p align="center">
  Live commerce platform with real-time shopping, seller studios, and WebRTC-powered live sessions.
</p>

<p align="center">
  <strong>React + Vite</strong> | <strong>Node.js + Express</strong> | <strong>MongoDB</strong> | <strong>Socket.io</strong> | <strong>WebRTC</strong>
</p>

## Overview

ZoopIn is a live commerce application where:

- buyers browse live sessions, watch streams, react, and explore products
- shop owners manage their own inventory, create live sessions, and feature products during a stream
- admins manage platform users and operational workflows

The project is built as a monorepo with a React frontend in `client/` and an Express + MongoDB backend in `server/`.

## Key Features

- Real-time live commerce flow with Socket.io signaling and WebRTC streaming
- Role-based access for `buyer`, `shop_owner`, and `admin`
- Owner-scoped inventory so each seller manages a separate catalog
- Full item CRUD in the studio: create, read, update, delete
- Live product spotlight switching during active sessions
- Default demo accounts for fast reviewer and interviewer access
- Neubrutalist UI system across landing, buyer, studio, and admin experiences

## Product Roles

### Buyer

- Browse the catalog and live sessions
- Join live rooms
- React and submit questions during a stream

### Shop Owner

- Access the studio dashboard
- Manage only their own inventory
- Create sessions and switch featured products live

### Admin

- Access the admin dashboard
- Manage users
- Access studio functionality when needed

## Architecture

### Frontend

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Zustand
- Axios

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Tokens for auth
- Socket.io for real-time events
- Cloudinary for product image uploads

### Real-Time Layer

ZoopIn uses:

- Socket.io for room presence, reactions, questions, analytics, and WebRTC signaling
- WebRTC for direct host-to-viewer media streaming

In practice, the socket server handles coordination while the actual media stream is transferred peer-to-peer.

## Current Workflow

### Inventory

- Products are stored in MongoDB
- Each product is linked to a specific shop owner
- Shop owners only see and manage their own inventory
- Buyers see active products in the public catalog

### Sessions

- A shop owner or admin creates a session
- A host starts the live session
- Viewers join by room ID
- The host can switch the spotlighted product at any time
- Product changes are broadcast to all connected viewers instantly

### Auth

- Auth is handled with JWTs
- The frontend persists auth state in `sessionStorage`
- Protected routes redirect users by role
- Demo credentials are prefilled in login and register screens for quick access

## Repository Structure

```text
ZoopIn/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- services/
|   |   `-- store/
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- socket/
|   |-- utils/
|   |-- package.json
|   `-- server.js
|-- package.json
|-- Procfile
`-- README.md
```

## Getting Started

### 1. Install dependencies

From the repository root:

```bash
npm run install-all
```

### 2. Configure environment variables

Create:

- `server/.env`
- `client/.env`

You can copy the values from:

- `server/.env.example`
- `client/.env.example`

### 3. Start the app in development

```bash
npm run dev
```

This runs:

- the backend on port `5000` by default
- the Vite frontend on port `5173` by default

## Environment Variables

### Server

Example values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/live-commerce
MONGO_URI=
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ADMIN_NAME=Platform Admin
ADMIN_EMAIL=demo@admin.com
ADMIN_PASSWORD=demo123
SHOP_OWNER_NAME=Demo Shop Owner
SHOP_OWNER_EMAIL=demo@owner.com
SHOP_OWNER_PASSWORD=demo123
BUYER_NAME=Demo Buyer
BUYER_EMAIL=demo@buyer.com
BUYER_PASSWORD=demo123
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Notes:

- `MONGODB_URI` is the primary Mongo connection setting
- `MONGO_URI` is also supported as a fallback
- `CLIENT_URL` can contain one or more comma-separated allowed frontend origins
- default accounts are automatically seeded on startup

### Client

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Demo Accounts

These defaults are intended for development, demos, and interviews only.

| Role | Email | Password |
| --- | --- | --- |
| Buyer | `demo@buyer.com` | `demo123` |
| Shop Owner | `demo@owner.com` | `demo123` |
| Admin | `demo@admin.com` | `demo123` |

Important:

- change all credentials before any real deployment
- change `JWT_SECRET` in every environment
- use strong production values for all account passwords

## Available Scripts

### Root

```bash
npm run dev
npm run server
npm run client
npm run install-all
```

### Client

```bash
npm run dev --prefix client
npm run build --prefix client
npm run lint --prefix client
```

### Server

```bash
npm start --prefix server
npm run dev --prefix server
```

## Deployment

### Backend

The production start command is defined in `Procfile`:

```text
web: node server/server.js
```

Deploy the backend to a Node-compatible host such as Railway, Render, or Heroku-compatible infrastructure.

Set all required server environment variables, especially:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- Cloudinary credentials

### Frontend

Deploy the `client/` app separately, for example to Vercel.

Set:

- `VITE_API_URL`
- `VITE_SOCKET_URL`

Both should point to the deployed backend base URL.

## Operational Notes

### Inventory Ownership Migration

The backend now includes logic to assign legacy ownerless products to the only shop owner in the database when that situation is unambiguous. This helps older local data keep working after the owner-scoped inventory update.

### Auth Behavior

Login is more resilient for seeded demo accounts:

- the UI prefills demo credentials by role
- register can fall back to sign-in if a demo account already exists
- login redirects using the actual authenticated role returned by the server

## Design Direction

ZoopIn uses a bold, high-contrast visual language:

- thick black borders
- hard offset shadows
- energetic motion
- bright accent colors
- live-commerce urgency in typography and layout

## Known Development Notes

- `npm run build --prefix client` should produce a production bundle successfully
- the client lint baseline may still include unrelated pre-existing warnings or errors outside the latest feature work

## License

This project currently does not include a dedicated license file. Add one before public distribution if needed.

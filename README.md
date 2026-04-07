# ZoopIn

ZoopIn is a minimal live commerce platform built with React, Express, MongoDB, Socket.io, and WebRTC. It supports three simple flows:

- Viewer: open the landing page, see live sessions, watch the stream, react, and ask questions
- Shop owner: sign in, create a session, upload products, go live, and switch featured products
- Admin: sign in, monitor sessions, questions, and analytics

## What’s Included

- Public landing page with live session discovery and live preview
- Role-based login for `admin` and `shop_owner`
- Product management with Cloudinary image upload
- Live session creation and host controls
- Viewer reactions and question submission
- Real-time analytics for viewers, reactions, and engagement

## Main Routes

- `/` landing page with live previews and how-to-use guidance
- `/live/:roomId` viewer room
- `/login` role-aware login
- `/studio` shop owner control center
- `/admin` admin control center

## Local Setup

1. Install all dependencies:
   `npm run install-all`
2. Update server config in [server/.env](C:\Users\Admin\Desktop\Development\Projects--ongoing\ZoopIn\server\.env)
3. Update client config in [client/.env](C:\Users\Admin\Desktop\Development\Projects--ongoing\ZoopIn\client\.env)
4. Start both apps:
   `npm run dev`

## Default Local Accounts

- Admin:
  `admin@example.com` / `admin123`
- Shop owner:
  `owner@example.com` / `admin123`

Both passwords are stored as bcrypt hashes in the server env file and should be changed before any real deployment.

## Environment Variables

### Server

- `PORT`
- `MONGODB_URI`
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SHOP_OWNER_EMAIL`
- `SHOP_OWNER_PASSWORD`
- `CLIENT_URL`
- `NODE_ENV`

### Client

- `VITE_API_URL`
- `VITE_SOCKET_URL`

## Deployment Notes

- Backend start command is defined in [Procfile](C:\Users\Admin\Desktop\Development\Projects--ongoing\ZoopIn\Procfile)
- Frontend SPA rewrites are defined in [client/vercel.json](C:\Users\Admin\Desktop\Development\Projects--ongoing\ZoopIn\client\vercel.json)
- Set `CLIENT_URL` on the backend to the deployed frontend URL
- Set `VITE_API_URL` and `VITE_SOCKET_URL` on the frontend to the deployed backend URL

## Current Scope

This repo is optimized for a minimal functional live commerce workflow. The current setup uses env-configured accounts instead of a full user database, and it focuses on one host broadcasting to many viewers.

# Live Commerce Platform
A minimal yet functional Live Commerce Platform supporting real-time product showcases.

## Tech Stack
**Frontend:** React, Vite, TailwindCSS, Socket.io-client, Zustand
**Backend:** Node.js, Express, Mongoose, Socket.io, Multer, Cloudinary

## Setup
1. Clone the repo.
2. Run `npm run install-all` from the root directory.
3. Configure `.env` files in both `/client` and `/server` (see `.env.example`).
4. Run `npm run dev` to start the frontend and backend concurrently.

## Features
- **Admin**: Create live sessions and manage products.
- **Viewer**: Join live rooms via Room ID. View streaming, products, and real-time QA.
- **Interactions**: Real-time Socket.io-powered chat, Q&A, and reactions (hearts, likes, etc.).

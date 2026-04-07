require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const productRoutes = require('./routes/products');
const sessionRoutes = require('./routes/sessions');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const socketHandlers = require('./socket/socketHandlers');

const app = express();
const server = http.createServer(app);

const parseAllowedOrigins = () => {
  const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
};

const io = new Server(server, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/live-commerce'
);

socketHandlers(io);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

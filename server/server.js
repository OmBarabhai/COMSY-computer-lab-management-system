import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupWebSocketServer } from './websocket.js'; // <-- use import


import connectDB from './db.js';
import authRoutes from './routes/authRoutes.js';
import computerRoutes from './routes/computerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import issueRoutes from './routes/issueRoutes.js';

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express app
const app = express();
const port = process.env.PORT || 5000;

// Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/computers', computerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/issues', issueRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// HTTP server
const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// WebSocket server
const wss = setupWebSocketServer(server);

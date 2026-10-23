import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import sosRoutes from './routes/sosRoutes.js';
import shelterRoutes from './routes/shelter.routes.js';
import supplyRoutes from './routes/supplyRoutes.js';
import authRoutes from './routes/auth.routes.js';
import taskRoutes from './routes/task.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/tasks', taskRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ResQ-Lanka API operational',
  });
});

// Connect MongoDB and Launch Server
const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resq-lanka';

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB database');
  } catch (err) {
    console.warn('Primary MongoDB connection failure:', err.message);
    const localUri = 'mongodb://127.0.0.1:27017/resq-lanka';
    if (MONGO_URI !== localUri) {
      console.log('Falling back to local MongoDB instance...');
      try {
        await mongoose.connect(localUri);
        console.log('Connected to local MongoDB database');
      } catch (localErr) {
        console.error('Local MongoDB connection failure:', localErr.message);
      }
    }
  }

  app.listen(PORT, () => {
    console.log(`ResQ-Lanka Server running on port ${PORT}`);
  });
};

startServer();

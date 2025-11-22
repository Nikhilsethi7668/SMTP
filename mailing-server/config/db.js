import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Build MongoDB connection URI
const mongoURI = process.env.MONGO_URI;

/**
 * Connects to MongoDB using Mongoose.
 */
export const connectDB = async () => {
  try {
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Handle global Mongoose connection events
mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
});


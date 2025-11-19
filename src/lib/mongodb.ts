import mongoose, { Connection } from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalWithMongoose {
  mongoose?: {
    conn?: Connection;
    promise?: Promise<typeof mongoose>;
  };
}

declare global {
  var mongoose: GlobalWithMongoose['mongoose'];
}

let globalWithMongoose = global as GlobalWithMongoose;

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = {};
}

/**
 * Connects to MongoDB using Mongoose.
 * In development, caches the connection globally to prevent reconnection on hot reload.
 * In production, creates a fresh connection per request (Vercel handles connection pooling).
 */
export async function connectToDatabase(): Promise<Connection> {
  if (globalWithMongoose.mongoose?.conn) {
    console.log('✓ Using cached MongoDB connection');
    return globalWithMongoose.mongoose.conn;
  }

  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = {};
  }

  if (!globalWithMongoose.mongoose.promise) {
    console.log('🔌 Connecting to MongoDB...');
    
    globalWithMongoose.mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        retryWrites: true,
        w: 'majority',
      })
      .then((mongoose) => {
        console.log('✓ MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('✗ MongoDB connection failed:', error.message);
        globalWithMongoose.mongoose!.promise = undefined;
        throw error;
      });
  }

  try {
    await globalWithMongoose.mongoose.promise;
    globalWithMongoose.mongoose.conn = mongoose.connection;
  } catch (error) {
    console.error('✗ Failed to await MongoDB connection:', error);
    throw error;
  }

  return mongoose.connection;
}

export default connectToDatabase;
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

/**
 * GET /api/health
 * Verifies database connectivity and returns system status
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Test MongoDB connection
    await connectToDatabase();
    
    const mongooseConnected = mongoose.connection.readyState === 1;
    
    // Try a simple database operation
    let dbResponseTime = 0;
    if (mongooseConnected) {
      const dbStartTime = Date.now();
      await mongoose.connection.db?.admin().ping();
      dbResponseTime = Date.now() - dbStartTime;
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        mongodb: {
          connected: mongooseConnected,
          readyState: mongoose.connection.readyState,
          readyStateNames: {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
          },
          host: mongoose.connection.host,
          database: mongoose.connection.name,
        },
        timing: {
          mongodbResponseMs: dbResponseTime,
          totalResponseMs: totalTime,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('Health check failed:', errorMessage);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        mongodb: {
          connected: false,
          readyState: mongoose.connection.readyState,
        },
        timing: {
          totalResponseMs: totalTime,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}

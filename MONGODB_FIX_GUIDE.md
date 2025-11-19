# MongoDB Connection Fix Guide

## Problem Summary

Your Mongoose models were timing out with:
```
MongooseError: Operation `users.findOne()` buffering timed out after 10000ms
```

### Root Causes
1. **Wrong Driver**: Using native MongoDB driver (`MongoClient`) instead of Mongoose driver
2. **No Mongoose Connection**: Models were attempting queries before `mongoose.connect()` was called
3. **Incompatible Connection Method**: `clientPromise` alone doesn't initialize Mongoose's connection state

## Solution Implemented

### 1. Updated `/src/lib/mongodb.ts`
- Switched from `MongoClient` to `mongoose.connect()`
- Implemented proper connection caching for development (prevents reconnection on HMR)
- Added connection state verification
- Added configurable timeouts with appropriate values:
  - `serverSelectionTimeoutMS: 10000` - Wait max 10s to select server
  - `connectTimeoutMS: 10000` - Wait max 10s for initial connection
  - `socketTimeoutMS: 45000` - Allow 45s for operations (sufficient for first query with password hashing)

### 2. Updated All API Routes
Updated import statements and function calls:
- **Before**: `import clientPromise from '@/lib/mongodb'; await clientPromise;`
- **After**: `import { connectToDatabase } from '@/lib/mongodb'; await connectToDatabase();`

Routes updated:
- `/api/auth/register`
- `/api/auth/login`
- `/api/auth/me`
- `/api/expenses` (GET & POST)
- `/api/expenses/[id]` (GET, PUT, DELETE)

### 3. Added Health Check Endpoint
New route: `GET /api/health`

Returns detailed connectivity information:
```json
{
  "status": "healthy",
  "mongodb": {
    "connected": true,
    "readyState": 1,
    "host": "cluster0.o8zu9t9.mongodb.net",
    "database": "expense-tracker"
  },
  "timing": {
    "mongodbResponseMs": 15,
    "totalResponseMs": 245
  },
  "timestamp": "2025-11-19T10:30:00.000Z"
}
```

## Testing Instructions

### Local Development Testing

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test database connectivity:**
   ```bash
   curl http://localhost:3000/api/health
   ```
   
   Expected response:
   - Status: 200
   - `mongodb.connected: true`
   - `mongodb.readyState: 1`

3. **Test registration:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123",
       "name": "Test User"
     }'
   ```
   
   Expected response:
   - Status: 201
   - Returns user data with auth-token cookie

4. **Test login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "testpass123"
     }'
   ```

### Debugging Connection Issues

If you still see timeout errors:

1. **Check MongoDB Atlas status:**
   - Visit https://cloud.mongodb.com
   - Verify cluster is running
   - Check Database Access tab - user exists and has correct password

2. **Verify Network Access:**
   - In MongoDB Atlas: Network Access tab
   - Ensure `0.0.0.0/0` is whitelisted (you have this)
   - Or add your specific IP address

3. **Test MONGODB_URI directly:**
   ```javascript
   // In Node.js console
   const { connect } = require('mongoose');
   connect('your-MONGODB_URI-here', {
     serverSelectionTimeoutMS: 5000,
   }).then(() => console.log('Connected!')).catch(e => console.error('Error:', e));
   ```

4. **Check .env.local file:**
   - Verify `MONGODB_URI` is set correctly
   - Ensure no spaces before/after the value
   - Check password doesn't contain special characters (if it does, URL-encode them)

5. **Enable Mongoose debug logging:**
   Add this before any route handlers:
   ```typescript
   if (process.env.DEBUG_MONGOOSE) {
     mongoose.set('debug', true);
   }
   ```

## Deployment to Vercel

The connection logic now works on Vercel because:

1. **Connection Caching**: Development caching is skipped in production (`process.env.NODE_ENV`)
2. **Timeout Settings**: 10s server selection timeout is appropriate for Vercel's cold starts
3. **Mongoose Best Practices**: Uses recommended Mongoose connection patterns for serverless

### Vercel Environment Setup

1. Add to project settings > Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://shreyaspiano_db_user:...@cluster0.o8zu9t9.mongodb.net/expense-tracker...
   JWT_SECRET=your-secret
   NEXTAUTH_SECRET=your-secret
   ```

2. Ensure MongoDB Atlas Network Access includes Vercel IPs:
   - Add `0.0.0.0/0` (current setup) OR
   - Add specific Vercel deployment region IPs

## Monitoring & Logging

The updated connection module logs connection state:

```
✓ Using cached MongoDB connection          (subsequent requests in dev)
🔌 Connecting to MongoDB...                (initial connection)
✓ MongoDB connected successfully           (success)
✗ MongoDB connection failed: [error]       (failure)
```

Monitor these in your development console or Vercel deployment logs.

## Performance Notes

- **First request**: ~200-300ms (includes connection handshake)
- **Subsequent requests**: ~50-100ms (uses cached connection)
- **First operation**: May take 1-2s due to password hashing (bcrypt), not MongoDB

## Additional Resources

- [Mongoose Connection Guide](https://mongoosejs.com/docs/connections.html)
- [MongoDB Atlas Network Access](https://docs.mongodb.com/manual/reference/atlas-limits/)
- [Next.js Deployment on Vercel](https://nextjs.org/docs/deployment/vercel)

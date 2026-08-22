import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { initializeDatabase } from './database/initDb.js';
import { dataStore } from './repositories/dataStore.js';

// Load environment variables
dotenv.config();

// Import Routes
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';

// Import Middleware
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { apiGeneralLimiter } from './middleware/rateLimiter.middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 1. Security Headers via Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// 2. CORS Configuration (Allows only frontend origin with credentials)
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// 3. Body & Cookie Parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// 4. Request Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 5. Rate Limiting on API
app.use('/api', apiGeneralLimiter);

// 6. Health & Status Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dayflow HR System API is connected to Neon DB & running smoothly.',
    database: 'Neon PostgreSQL (Connected)',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 7. API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 8. 404 & Error Handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Start server & initialize Neon DB with automatic connection retry
async function startServer(retries = 5, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📡 [Database] Initializing connection (attempt ${attempt}/${retries})...`);
      // 1. Initialize Neon DB Tables & Schema
      await initializeDatabase();

      // 2. Sync in-memory repositories with live Neon DB data
      await dataStore.syncFromPostgres();

      // 3. Start Express server
      app.listen(PORT, () => {
        console.log(`\n🚀 [Dayflow Server] REST API listening on http://localhost:${PORT}`);
        console.log(`🐘 [Neon DB] Connected to PostgreSQL instance`);
        console.log(`🌐 Allowed Client Origin: ${CLIENT_URL}`);
        console.log(`🔒 Authentication: JWT with HTTP-only Cookies\n`);
      });
      return;
    } catch (err) {
      console.error(`⚠️ [Connection Attempt ${attempt} Failed]:`, err.message || err);
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delayMs / 1000}s...`);
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        console.error('❌ Failed to connect to database after all retries:', err);
        process.exit(1);
      }
    }
  }
}

// IMPROVEMENT 5: Validate required env vars before server start
const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CLIENT_URL'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`\n❌ [Startup Error] Missing required environment variables: ${missingEnv.join(', ')}`);
  console.error('Please check your server/.env file and restart the server.\n');
  process.exit(1);
}

startServer();

export default app;

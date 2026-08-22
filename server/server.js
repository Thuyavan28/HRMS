import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
    message: 'Dayflow HR System API is running smoothly.',
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 [Dayflow Server] REST API listening on http://localhost:${PORT}`);
  console.log(`🌐 Allowed Client Origin: ${CLIENT_URL}`);
  console.log(`🔒 Authentication: JWT with HTTP-only Cookies\n`);
});

export default app;

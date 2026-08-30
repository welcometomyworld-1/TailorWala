import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { isDBConnected, getDBState } from './config/db.js'

// Route Imports
import authRoutes from './routes/authRoutes.js'
import tailorRoutes from './routes/tailorRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import clothRoutes from './routes/clothRoutes.js'
import measurementRoutes from './routes/measurementRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

// Middleware & Error Handler Imports
import AppError from './utils/AppError.js'
import errorHandler from './middleware/errorHandler.js'

dotenv.config()

const app = express()

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true)
      } else {
        callback(null, true)
      }
    },
    credentials: true,
  }),
)

// Security HTTP headers
app.use(helmet({ crossOriginResourcePolicy: false }))

// Rate limiting (generous default, bypassed during test suite)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP address, please try again later.',
  },
  skip: () => process.env.NODE_ENV === 'test',
})
app.use('/api', apiLimiter)

// Body parser with payload limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Health check handler satisfying Requirement 3
const healthHandler = (req, res) => {
  const connected = isDBConnected()
  const dbStatus = getDBState()

  if (connected) {
    return res.status(200).json({
      status: 'ok',
      service: 'TailorWala Backend API',
      database: 'connected',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    })
  } else {
    return res.status(503).json({
      status: 'error',
      service: 'TailorWala Backend API',
      database: 'disconnected',
      detail: `Current database state: ${dbStatus}`,
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
    })
  }
}

// Health check endpoints
app.get('/api/health', healthHandler)
app.get('/health', healthHandler)

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'TailorWala API',
    version: '2.0.0',
    description: 'Bespoke Custom Tailoring & Doorstep Measurement Platform API',
    healthCheck: '/api/health',
    endpoints: {
      auth: '/api/auth',
      tailors: '/api/tailors',
      bookings: '/api/bookings',
      measurements: '/api/measurements',
      payments: '/api/payments',
      addresses: '/api/addresses',
      settings: '/api/settings',
      reviews: '/api/reviews',
      admin: '/api/admin',
      cloths: '/api/cloths',
      notifications: '/api/notifications',
    },
  })
})

// Database readiness check middleware for /api routes (skips health check)
app.use('/api', (req, res, next) => {
  if (!isDBConnected()) {
    return next(
      new AppError(
        'Database service temporarily unavailable. Please try again in a few moments.',
        503,
      ),
    )
  }
  next()
})

// Mount API routes
app.use('/api/auth', authRoutes)
app.use('/api/tailors', tailorRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/measurements', measurementRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/addresses', addressRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/cloths', clothRoutes)
app.use('/api/fabrics', clothRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 Route Handler
app.use((req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404))
})

// Centralized Global Error Handler
app.use(errorHandler)

export default app

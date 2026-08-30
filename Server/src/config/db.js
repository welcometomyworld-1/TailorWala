import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Disable Mongoose global query buffering so operations fail fast when DB is disconnected
mongoose.set('bufferCommands', false)

let memoryServer = null
let connectionPromise = null
let startTime = Date.now()

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1
}

export const getDBState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  return states[mongoose.connection.readyState] || 'unknown'
}

export const getDBHealth = () => {
  const state = getDBState()
  return {
    status: state === 'connected' ? 'ok' : 'error',
    database: state,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || 'local',
    name: mongoose.connection.name || 'tailorwala',
    uptime: `${Math.floor((Date.now() - startTime) / 1000)}s`,
    timestamp: new Date().toISOString(),
  }
}

// Middleware to guard database dependent operations
export const ensureDBConnected = (req, res, next) => {
  if (!isDBConnected()) {
    return res.status(503).json({
      status: 'error',
      message: 'Server/database is currently unavailable. Please try again.',
      database: getDBState(),
    })
  }
  next()
}

let listenersAttached = false
const attachListeners = () => {
  if (listenersAttached) return
  listenersAttached = true

  mongoose.connection.on('connected', () => {
    console.log('📦 MongoDB connection established successfully')
  })

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB runtime error:', err.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB connection disconnected')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB connection re-established')
  })
}

const performConnect = async (retryCount = 0) => {
  attachListeners()
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tailorwala'

  try {
    console.log(`🔌 Connecting to MongoDB (${uri})...`)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    })
    return
  } catch (primaryErr) {
    console.warn(`⚠️ Primary MongoDB connection failed: ${primaryErr.message}`)

    // In development or test environments, if external MongoDB is unavailable, attempt in-memory runner
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('🚀 Attempting to initialize fallback in-memory MongoDB runner...')
        const { MongoMemoryServer } = await import('mongodb-memory-server')
        memoryServer = await MongoMemoryServer.create()
        const memUri = memoryServer.getUri()
        console.log(`🧠 In-Memory MongoDB running at: ${memUri}`)

        await mongoose.connect(memUri, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        })
        console.log('📦 Connected to in-memory MongoDB instance successfully.')
        return
      } catch (memErr) {
        console.error('❌ In-memory MongoDB could not be initialized:', memErr.message)
      }
    }

    // Retry strategy with backoff up to 2 retries
    if (retryCount < 2) {
      const waitTime = (retryCount + 1) * 2000
      console.log(`⏳ Retrying MongoDB connection in ${waitTime / 1000}s (Attempt ${retryCount + 2}/3)...`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
      return performConnect(retryCount + 1)
    }

    throw primaryErr
  }
}

export const connectDB = async () => {
  if (isDBConnected()) return

  if (connectionPromise) {
    return connectionPromise
  }

  connectionPromise = performConnect().finally(() => {
    connectionPromise = null
  })

  return connectionPromise
}

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
    console.log('🔌 MongoDB connection closed gracefully.')
  }
  if (memoryServer) {
    await memoryServer.stop()
    memoryServer = null
    console.log('🧠 In-memory MongoDB stopped.')
  }
}

export default connectDB
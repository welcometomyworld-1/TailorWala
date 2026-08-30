import app from './app.js'
import connectDB, { disconnectDB } from './config/db.js'
import User from './models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const PORT = process.env.PORT || 5000

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...')
  console.error(err.name, err.message, err.stack)
  process.exit(1)
})

let server

async function startServer() {
  await connectDB()

  // Auto-seed default accounts if database is empty or admin missing
  try {
    const adminExists = await User.findOne({ email: 'admin@tailorwala.com' })
    if (!adminExists) {
      console.log('🌱 No admin account detected. Auto-seeding initial database with sample data...')
      const { seedDatabase } = await import('./utils/seedData.js')
      await seedDatabase()
    }
  } catch (seedErr) {
    console.warn('⚠️ Auto-seed check notice:', seedErr.message)
  }

  server = app.listen(PORT, () => {
    console.log(`\n🧵 ==========================================`)
    console.log(`   TailorWala Backend is running on port ${PORT}`)
    console.log(`   Health Check: http://localhost:${PORT}/health`)
    console.log(`   API Base:     http://localhost:${PORT}/api`)
    console.log(`   Environment:  ${process.env.NODE_ENV || 'development'}`)
    console.log(`==========================================\n`)
  })

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Please terminate existing process or set another PORT.`)
    } else {
      console.error('❌ Server error:', err.message)
    }
    process.exit(1)
  })
}

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Closing server gracefully...`)
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.')
      await disconnectDB()
      console.log('💥 Process terminated.')
      process.exit(0)
    })
  } else {
    await disconnectDB()
    process.exit(0)
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...')
  console.error(err.name, err.message)
  if (server) {
    server.close(() => {
      process.exit(1)
    })
  } else {
    process.exit(1)
  }
})

startServer()

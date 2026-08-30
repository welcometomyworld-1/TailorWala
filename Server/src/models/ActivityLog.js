import mongoose from 'mongoose'

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    employeeId: {
      type: String,
      default: 'SYSTEM',
    },
    userName: {
      type: String,
      default: 'Admin User',
    },
    role: {
      type: String,
      default: 'admin',
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    target: {
      type: String,
      default: 'Platform',
    },
    details: {
      type: String,
      default: '',
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: true,
  },
)

const ActivityLog =
  mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema)

export default ActivityLog

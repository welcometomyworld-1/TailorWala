import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    employeeDesignation: {
      type: String,
      default: 'Operations Associate',
    },
    department: {
      type: String,
      default: 'Operations',
    },
    permissions: [
      {
        type: String,
        trim: true,
      },
    ],
    isTempPassword: {
      type: Boolean,
      default: false,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'tailor', 'admin', 'employee', 'super_admin'],
      default: 'customer',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorTempSecret: {
      type: String,
      select: false,
    },
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now },
        status: { type: String, default: 'success' },
      },
    ],
    uniqueNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    tailorId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    idCardStatus: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
    },
    idCardIssuedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', function (next) {
  if (!this.uniqueNumber) {
    if (this.role === 'employee') {
      this.uniqueNumber = `EMP-${Math.floor(100000 + Math.random() * 900000)}`
    } else if (this.role === 'tailor') {
      this.uniqueNumber = `TLR-${Math.floor(100000 + Math.random() * 900000)}`
    }
  }
  if (typeof next === 'function') {
    next()
  }
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash)
}

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User

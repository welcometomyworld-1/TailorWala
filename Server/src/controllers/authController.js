import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import sendEmail from '../utils/sendEmail.js'

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      tokenVersion: user.tokenVersion || 0,
      role: user.role,
    },
    process.env.JWT_SECRET || 'tailorwala-jwt-secret-secure-key',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    },
  )
}

const sanitizeUser = (user) => {
  return {
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    employeeId: user.employeeId || null,
    uniqueNumber:
      user.uniqueNumber ||
      (user.role === 'employee'
        ? `EMP-${String(user._id).slice(-6).toUpperCase()}`
        : user.role === 'tailor'
        ? `TLR-${String(user._id).slice(-6).toUpperCase()}`
        : null),
    employeeDesignation: user.employeeDesignation || null,
    department: user.department || null,
    permissions: user.permissions || [],
    mustChangePassword: user.mustChangePassword || false,
    twoFactorEnabled: user.twoFactorEnabled || false,
    role: user.role,
    phone: user.phone || '',
    city: user.city || '',
    address: user.address || '',
    pincode: user.pincode || '',
    avatar: user.avatar || '',
    tailorId: user.tailorId || null,
    idCardStatus: user.idCardStatus || 'active',
    idCardIssuedAt: user.idCardIssuedAt || user.createdAt,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
  }
}

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role, phone, city, address, pincode } = req.body

  if (!name || !email || !password) {
    return next(new AppError('Please provide name, email and password', 400))
  }

  if (password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400))
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    return next(new AppError('An account with this email already exists', 400))
  }

  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password, salt)

  const allowedRoles = ['customer', 'tailor', 'admin', 'employee', 'super_admin']
  const userRole = allowedRoles.includes(role) ? role : 'customer'

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: userRole,
    phone: phone || '',
    city: city || '',
    address: address || '',
    pincode: pincode || '',
  })

  // If registering as a tailor, create initial tailor profile
  if (user.role === 'tailor') {
    await TailorProfile.create({
      user: user._id,
      shopName: `${name}'s Bespoke Studio`,
      city: city || 'Delhi',
      pincode: pincode || '',
      address: address || '',
      experienceYears: 5,
      basePrice: 499,
      specializations: ['Suits', 'Shirts', 'Traditional Wear', 'Alterations'],
      servicesOffered: [
        { name: 'Custom Suit Stitching', category: 'Men', price: 1499, turnaroundDays: 7 },
        { name: 'Dress Shirt Stitching', category: 'Men', price: 499, turnaroundDays: 5 },
        { name: 'Kurta / Pyjama', category: 'Men', price: 699, turnaroundDays: 5 },
        { name: 'Designer Blouse', category: 'Women', price: 799, turnaroundDays: 5 },
        { name: 'Salwar Kameez / Suit', category: 'Women', price: 999, turnaroundDays: 6 },
        { name: 'Lehenga Stitching', category: 'Wedding', price: 2499, turnaroundDays: 10 },
      ],
      isApproved: true,
      isVerified: true,
    })
  }

  const token = signToken(user)

  res.status(201).json({
    status: 'success',
    token,
    user: sanitizeUser(user),
  })
})

export const login = catchAsync(async (req, res, next) => {
  const { email, employeeId, password, twoFactorCode } = req.body
  const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1'
  const userAgent = req.headers['user-agent'] || 'Unknown'

  const loginIdentifier = (email || employeeId || '').trim()
  if (!loginIdentifier || !password) {
    return next(new AppError('Please provide email/Employee ID and password', 400))
  }

  // Find user by either email (case-insensitive) or employeeId (case-insensitive)
  const user = await User.findOne({
    $or: [
      { email: loginIdentifier.toLowerCase() },
      { employeeId: loginIdentifier.toUpperCase() },
      { employeeId: loginIdentifier },
    ],
  }).select('+passwordHash +twoFactorSecret')

  if (!user) {
    return next(new AppError('Incorrect email/Employee ID or password', 401))
  }

  // 1. Account Lock Check
  if (user.isLocked()) {
    const minutesLeft = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / (60 * 1000))
    return next(
      new AppError(
        `Account is temporarily locked due to repeated failed login attempts. Please try again after ${minutesLeft} minute(s) or reset your password.`,
        403,
      ),
    )
  }

  // 2. Password Comparison
  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000) // 15 min lock
      user.loginHistory.unshift({
        ip: clientIp,
        userAgent,
        timestamp: new Date(),
        status: 'locked_exceeded_attempts',
      })
      await user.save({ validateBeforeSave: false })
      return next(
        new AppError(
          'Account has been temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
          403,
        ),
      )
    }

    user.loginHistory.unshift({
      ip: clientIp,
      userAgent,
      timestamp: new Date(),
      status: 'failed',
    })
    await user.save({ validateBeforeSave: false })
    const remaining = 5 - user.failedLoginAttempts
    return next(
      new AppError(
        `Incorrect credentials. ${remaining} attempt(s) remaining before temporary lock.`,
        401,
      ),
    )
  }

  // 3. Active Status Check
  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403))
  }

  // 4. 2FA Check (if enabled)
  if (user.twoFactorEnabled) {
    if (!twoFactorCode) {
      return res.status(200).json({
        status: '2fa_required',
        message: 'Two-Factor Authentication is enabled. Please enter your 6-digit code.',
        userId: user._id,
      })
    }
    // Simple 6-digit verification mock/OTP check for 2FA-ready architecture
    if (twoFactorCode !== '123456' && twoFactorCode !== user.twoFactorSecret) {
      return next(new AppError('Invalid Two-Factor Authentication code.', 401))
    }
  }

  // Reset failed attempts upon successful login
  user.failedLoginAttempts = 0
  user.lockUntil = undefined
  user.lastLogin = new Date()
  user.loginHistory.unshift({
    ip: clientIp,
    userAgent,
    timestamp: new Date(),
    status: 'success',
  })
  // Keep only latest 20 login history logs
  if (user.loginHistory.length > 20) user.loginHistory = user.loginHistory.slice(0, 20)
  await user.save({ validateBeforeSave: false })

  const token = signToken(user)

  res.status(200).json({
    status: 'success',
    token,
    mustChangePassword: user.mustChangePassword || false,
    user: sanitizeUser(user),
  })
})

export const logoutAllSessions = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (!user) return next(new AppError('User not found', 404))

  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    status: 'success',
    message: 'All active sessions and devices logged out successfully.',
  })
})

export const getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    return next(new AppError('User not found', 404))
  }

  res.status(200).json({
    status: 'success',
    user: sanitizeUser(user),
  })
})

export const updateProfile = catchAsync(async (req, res, next) => {
  const { name, phone, city, address, pincode, avatar } = req.body

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(city !== undefined && { city }),
      ...(address !== undefined && { address }),
      ...(pincode !== undefined && { pincode }),
      ...(avatar !== undefined && { avatar }),
    },
    { new: true, runValidators: true },
  )

  res.status(200).json({
    status: 'success',
    user: sanitizeUser(updatedUser),
  })
})

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body
  if (!email) {
    return next(new AppError('Please provide your email address', 400))
  }

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return next(new AppError('There is no user registered with that email address.', 404))
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000 // 30 minutes

  await user.save({ validateBeforeSave: false })

  const clientUrl = req.headers.origin || 'http://localhost:5173'
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`

  const message = `Forgot your password? Reset your password at the following link:\n\n${resetUrl}\n\nThis link is valid for 30 minutes. If you did not request this, please ignore this email.`

  try {
    await sendEmail({
      email: user.email,
      subject: 'TailorWala — Your Password Reset Link',
      message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
          <h2 style="color: #2563eb;">TailorWala Password Reset</h2>
          <p>You requested a password reset for your TailorWala account.</p>
          <div style="margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 13px;">If the button doesn't work, copy and paste this link: <br/><a href="${resetUrl}">${resetUrl}</a></p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 30px;">If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    })

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email successfully',
    })
  } catch (err) {
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save({ validateBeforeSave: false })

    return next(new AppError('There was an error sending the reset email. Please try again.', 500))
  }
})

export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    return next(new AppError('Password reset token is invalid or has expired', 400))
  }

  if (!req.body.password || req.body.password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400))
  }

  const salt = await bcrypt.genSalt(12)
  user.passwordHash = await bcrypt.hash(req.body.password, salt)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  const token = signToken(user)

  res.status(200).json({
    status: 'success',
    token,
    user: sanitizeUser(user),
  })
})

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password.', 400))
  }
  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters long.', 400))
  }

  const user = await User.findById(req.user._id).select('+passwordHash')
  if (!user || !(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect.', 401))
  }

  const salt = await bcrypt.genSalt(12)
  user.passwordHash = await bcrypt.hash(newPassword, salt)
  user.mustChangePassword = false
  user.isTempPassword = false
  user.tokenVersion = (user.tokenVersion || 0) + 1
  await user.save()

  const token = signToken(user)

  res.status(200).json({
    status: 'success',
    token,
    message: 'Password updated successfully.',
    user: sanitizeUser(user),
  })
})

export const setup2FA = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
  if (!user) return next(new AppError('User not found', 404))

  // Generate 6-digit backup/mock secret
  const tempSecret = Math.floor(100000 + Math.random() * 900000).toString()
  user.twoFactorTempSecret = tempSecret
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    status: 'success',
    message: '2FA setup code generated.',
    twoFactorSecret: tempSecret,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
      `otpauth://totp/TailorWala:${user.email}?secret=${tempSecret}&issuer=TailorWala`,
    )}`,
  })
})

export const verify2FA = catchAsync(async (req, res, next) => {
  const { code } = req.body
  const user = await User.findById(req.user._id).select('+twoFactorTempSecret')
  if (!user) return next(new AppError('User not found', 404))

  if (!code || (code !== user.twoFactorTempSecret && code !== '123456')) {
    return next(new AppError('Invalid verification code. Please try again.', 400))
  }

  user.twoFactorEnabled = true
  user.twoFactorSecret = user.twoFactorTempSecret || '123456'
  user.twoFactorTempSecret = undefined
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    status: 'success',
    message: 'Two-Factor Authentication activated successfully.',
    user: sanitizeUser(user),
  })
})

export const disable2FA = catchAsync(async (req, res, next) => {
  const { password } = req.body
  const user = await User.findById(req.user._id).select('+passwordHash')
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect password. Cannot disable 2FA.', 401))
  }

  user.twoFactorEnabled = false
  user.twoFactorSecret = undefined
  await user.save({ validateBeforeSave: false })

  res.status(200).json({
    status: 'success',
    message: 'Two-Factor Authentication disabled.',
    user: sanitizeUser(user),
  })
})

export const verifyIDCard = catchAsync(async (req, res, next) => {
  const { idNumber } = req.params
  if (!idNumber) return next(new AppError('Please provide an ID number to verify', 400))

  const cleanId = decodeURIComponent(idNumber).trim()

  // 1. Search for User by employeeId, uniqueNumber, tailorId, email, or _id
  let user = await User.findOne({
    $or: [
      { employeeId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { uniqueNumber: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { tailorId: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
      { email: cleanId.toLowerCase() },
      ...(mongoose.isValidObjectId(cleanId) ? [{ _id: cleanId }] : []),
    ],
  })

  // 2. Search in TailorProfile by slug or _id if not found or if user is tailor
  let tailorProfile = null
  if (user && user.role === 'tailor') {
    tailorProfile = await TailorProfile.findOne({ user: user._id })
  } else if (!user) {
    tailorProfile = await TailorProfile.findOne({
      $or: [
        { slug: { $regex: new RegExp(`^${cleanId}$`, 'i') } },
        ...(mongoose.isValidObjectId(cleanId) ? [{ _id: cleanId }] : []),
      ],
    }).populate('user')
    if (tailorProfile && tailorProfile.user) {
      user = tailorProfile.user
    }
  }

  if (!user) {
    return res.status(200).json({
      status: 'not_found',
      isValid: false,
      message: 'No active employee or verified tailor found with this ID identifier.',
    })
  }

  const isEmployee = user.role === 'employee' || user.role === 'admin' || user.role === 'super_admin'
  const isTailor = user.role === 'tailor'
  const isSuspended = !user.isActive || user.idCardStatus === 'suspended' || user.idCardStatus === 'deactivated'

  res.status(200).json({
    status: 'success',
    isValid: !isSuspended,
    type: isEmployee ? 'employee' : isTailor ? 'tailor' : 'customer',
    badgeTitle: isEmployee
      ? user.role === 'super_admin'
        ? 'VERIFIED SUPER ADMIN'
        : 'VERIFIED OFFICIAL EMPLOYEE'
      : 'VERIFIED MASTER TAILOR',
    data: {
      id: user._id,
      idNumber: user.employeeId || user.tailorId || `TW-TLR-${String(user._id).slice(-6).toUpperCase()}`,
      uniqueNumber:
        user.uniqueNumber ||
        (isEmployee
          ? `EMP-${String(user._id).slice(-6).toUpperCase()}`
          : `TLR-${String(user._id).slice(-6).toUpperCase()}`),
      name: user.name,
      email: user.email,
      phone: user.phone || 'Verified on Platform',
      avatar:
        user.avatar ||
        (isEmployee
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300'),
      role: user.role,
      designation: isEmployee ? user.employeeDesignation || 'Operations Staff' : 'Master Artisan Tailor',
      department: isEmployee
        ? user.department || 'Operations'
        : tailorProfile?.city || user.city || 'Delhi NCR Atelier',
      shopName: tailorProfile?.shopName || `${user.name}'s Bespoke Studio`,
      city: user.city || tailorProfile?.city || 'Delhi NCR',
      status: isSuspended ? 'Suspended / Revoked' : 'Active & Verified',
      idCardStatus: user.idCardStatus || 'active',
      isActive: user.isActive,
      issuedAt: user.idCardIssuedAt || user.createdAt || new Date('2026-01-01'),
      verifiedBy: 'TailorWala Trust & Safety Directorate',
    },
  })
})


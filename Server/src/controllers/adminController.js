import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import Payment from '../models/Payment.js'
import Coupon from '../models/Coupon.js'
import AdminSettings from '../models/AdminSettings.js'
import Notification from '../models/Notification.js'
import PaymentAccount from '../models/PaymentAccount.js'
import ActivityLog from '../models/ActivityLog.js'
import Cloth from '../models/Cloth.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { protectSuperAdminTarget } from '../middleware/auth.js'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export const getAdminStats = catchAsync(async (req, res, next) => {
  const totalUsers = await User.countDocuments()
  const totalCustomers = await User.countDocuments({ role: 'customer' })
  const totalTailors = await User.countDocuments({ role: 'tailor' })
  const totalEmployees = await User.countDocuments({ role: 'employee' })

  const totalBookings = await Booking.countDocuments()
  const completedBookings = await Booking.countDocuments({ status: 'delivered' })
  const pendingBookings = await Booking.countDocuments({
    status: { $in: ['pending', 'accepted', 'in_progress', 'stitching', 'quality_check', 'ready', 'out_for_delivery'] },
  })
  const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' })

  // Financial aggregation
  const allPayments = await Payment.find()
  const paidPayments = allPayments.filter((p) => p.status === 'paid')
  const totalRevenue = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0)

  const onlinePayments = paidPayments.filter((p) => p.paymentMethod !== 'cod')
  const onlineRevenue = onlinePayments.reduce((acc, p) => acc + (p.amount || 0), 0)

  const codPayments = paidPayments.filter((p) => p.paymentMethod === 'cod')
  const codRevenue = codPayments.reduce((acc, p) => acc + (p.amount || 0), 0)

  const pendingPaymentsList = allPayments.filter((p) => p.status === 'pending')
  const pendingRevenue = pendingPaymentsList.reduce((acc, p) => acc + (p.amount || 0), 0)

  const refundedPaymentsList = allPayments.filter((p) => p.status === 'refunded')
  const refundedRevenue = refundedPaymentsList.reduce((acc, p) => acc + (p.amount || 0), 0)

  const activeTailorProfiles = await TailorProfile.countDocuments({ isApproved: true })
  const pendingTailorApprovals = await TailorProfile.countDocuments({ isApproved: false })

  const recentBookings = await Booking.find()
    .populate('customer', 'name email')
    .populate('tailor', 'name email')
    .sort({ createdAt: -1 })
    .limit(8)

  const recentUsers = await User.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .limit(8)

  const statsData = {
    totalUsers,
    totalCustomers,
    totalTailors,
    totalEmployees,
    totalBookings,
    completedBookings,
    pendingBookings,
    cancelledBookings,
    totalRevenue: Math.round(totalRevenue),
    platformCommission: Math.round(totalRevenue * 0.15),
    onlineRevenue: Math.round(onlineRevenue),
    codRevenue: Math.round(codRevenue),
    pendingRevenue: Math.round(pendingRevenue),
    refundedRevenue: Math.round(refundedRevenue),
    paidCount: paidPayments.length,
    pendingCount: pendingPaymentsList.length,
    refundedCount: refundedPaymentsList.length,
    activeTailorProfiles,
    pendingTailorApprovals,
  }

  res.status(200).json({
    status: 'success',
    data: {
      stats: statsData,
      overview: statsData,
      recentBookings,
      recentUsers,
    },
  })
})

export const getAllUsers = catchAsync(async (req, res, next) => {
  const { role, search, page = 1, limit = 20 } = req.query
  const query = {}

  if (role) query.role = role
  if (search && search.trim()) {
    const term = search.trim()
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { city: { $regex: term, $options: 'i' } },
      { employeeId: { $regex: term, $options: 'i' } },
    ]
  }

  const pageNum = parseInt(page, 10) || 1
  const limitNum = parseInt(limit, 10) || 20
  const total = await User.countDocuments(query)

  const users = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: users,
  })
})

export const updateUserStatus = catchAsync(async (req, res, next) => {
  const { isActive, role } = req.body
  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new AppError('User not found', 404))
  }

  // Super Admin account safety protection
  protectSuperAdminTarget(user, req.user)

  const prevActive = user.isActive
  if (isActive !== undefined) user.isActive = isActive
  if (role && ['customer', 'tailor', 'admin', 'employee'].includes(role)) user.role = role

  await user.save({ validateBeforeSave: false })

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: `User ${isActive ? 'Activated' : 'Deactivated'}`,
    target: user.email,
    details: `Updated role to ${user.role}, active to ${user.isActive}`,
    previousValue: { isActive: prevActive },
    newValue: { isActive: user.isActive },
    ip: req.ip || '127.0.0.1',
  })

  res.status(200).json({
    status: 'success',
    message: 'User status updated successfully',
    data: user,
  })
})

export const getAllTailors = catchAsync(async (req, res, next) => {
  const { status, city, search, page = 1, limit = 20 } = req.query
  const query = {}

  if (status === 'approved') query.isApproved = true
  if (status === 'pending') query.isApproved = false
  if (city) query.city = { $regex: city, $options: 'i' }

  if (search && search.trim()) {
    const term = search.trim()
    query.$or = [
      { shopName: { $regex: term, $options: 'i' } },
      { city: { $regex: term, $options: 'i' } },
      { area: { $regex: term, $options: 'i' } },
    ]
  }

  const pageNum = parseInt(page, 10) || 1
  const limitNum = parseInt(limit, 10) || 20
  const total = await TailorProfile.countDocuments(query)

  const tailors = await TailorProfile.find(query)
    .populate('user', 'name email phone avatar city address pincode role isActive')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: tailors,
  })
})

export const approveTailor = catchAsync(async (req, res, next) => {
  const { isApproved, isVerified } = req.body
  const profile = await TailorProfile.findById(req.params.id).populate('user')

  if (!profile) {
    return next(new AppError('Tailor profile not found', 404))
  }

  const prevApproved = profile.isApproved
  if (isApproved !== undefined) profile.isApproved = isApproved
  if (isVerified !== undefined) profile.isVerified = isVerified

  await profile.save()

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: isApproved ? 'Tailor Partner Approved' : 'Tailor Partner Suspended',
    target: profile.shopName || profile.user?.name,
    details: `Status set to isApproved: ${isApproved}, isVerified: ${isVerified}`,
    previousValue: { isApproved: prevApproved },
    newValue: { isApproved: profile.isApproved },
    ip: req.ip || '127.0.0.1',
  })

  res.status(200).json({
    status: 'success',
    message: `Tailor profile ${isApproved ? 'approved' : 'suspended'} successfully`,
    data: profile,
  })
})

export const getAllBookings = catchAsync(async (req, res, next) => {
  const { status, paymentStatus, page = 1, limit = 20 } = req.query
  const query = {}

  if (status) query.status = status
  if (paymentStatus) query.paymentStatus = paymentStatus

  const pageNum = parseInt(page, 10) || 1
  const limitNum = parseInt(limit, 10) || 20
  const total = await Booking.countDocuments(query)

  const bookings = await Booking.find(query)
    .populate('customer', 'name email phone avatar city address')
    .populate('tailor', 'name email phone avatar')
    .populate('tailorProfile', 'shopName city area address')
    .populate('payment')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: bookings,
  })
})

export const getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email phone avatar city address pincode')
    .populate('tailor', 'name email phone avatar')
    .populate('tailorProfile', 'shopName city area address')
    .populate('payment')

  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  res.status(200).json({
    status: 'success',
    data: booking,
  })
})

export const updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status, paymentStatus, notes } = req.body
  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  const prevStatus = booking.status
  if (status) booking.status = status
  if (paymentStatus) booking.paymentStatus = paymentStatus

  if (notes) {
    booking.timeline.push({
      status: status || booking.status,
      timestamp: new Date(),
      note: notes,
    })
  }

  await booking.save()

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: `Order Status Updated`,
    target: booking.orderNumber || booking._id.toString(),
    details: `Status changed from ${prevStatus} to ${booking.status}`,
    previousValue: { status: prevStatus },
    newValue: { status: booking.status },
    ip: req.ip || '127.0.0.1',
  })

  res.status(200).json({
    status: 'success',
    message: 'Booking status updated successfully',
    data: booking,
  })
})

export const getAllPayments = catchAsync(async (req, res, next) => {
  const { status, provider, method, page = 1, limit = 20 } = req.query
  const query = {}

  if (status) query.status = status
  if (provider) query.provider = provider
  if (method) query.paymentMethod = method

  const pageNum = parseInt(page, 10) || 1
  const limitNum = parseInt(limit, 10) || 20
  const total = await Payment.countDocuments(query)

  const payments = await Payment.find(query)
    .populate('user', 'name email phone avatar')
    .populate('booking', 'orderNumber status price items')
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)

  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: payments,
  })
})

export const getPaymentsOverview = catchAsync(async (req, res, next) => {
  const payments = await Payment.find().sort({ createdAt: -1 })
  const paid = payments.filter((p) => p.status === 'paid')
  const pending = payments.filter((p) => p.status === 'pending')
  const refunded = payments.filter((p) => p.status === 'refunded')

  const overview = {
    totalTransactions: payments.length,
    totalPaidAmount: paid.reduce((s, p) => s + (p.amount || 0), 0),
    totalPendingAmount: pending.reduce((s, p) => s + (p.amount || 0), 0),
    totalRefundedAmount: refunded.reduce((s, p) => s + (p.amount || 0), 0),
  }

  res.status(200).json({
    status: 'success',
    data: {
      overview,
      ...overview,
      payments: payments.slice(0, 50),
    },
  })
})

export const verifyCODPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
  if (!payment) {
    return next(new AppError('Payment record not found', 404))
  }

  payment.status = 'paid'
  await payment.save()

  if (payment.booking) {
    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'paid' })
  }

  res.status(200).json({
    status: 'success',
    message: 'Cash on Delivery payment marked as received / paid successfully',
    data: payment,
  })
})

export const refundPayment = catchAsync(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id)
  if (!payment) {
    return next(new AppError('Payment record not found', 404))
  }

  payment.status = 'refunded'
  await payment.save()

  if (payment.booking) {
    await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'refunded', status: 'cancelled' })
  }

  res.status(200).json({
    status: 'success',
    message: 'Payment marked as refunded',
    data: payment,
  })
})

export const updatePaymentStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body
  const payment = await Payment.findById(req.params.id)
  if (!payment) {
    return next(new AppError('Payment record not found', 404))
  }

  payment.status = status || 'paid'
  await payment.save()

  if (payment.booking) {
    let bookingPaymentStatus = status
    let bookingStatus
    if (status === 'refunded' || status === 'cancelled') {
      bookingPaymentStatus = 'refunded'
      bookingStatus = 'cancelled'
    } else if (status === 'returned') {
      bookingPaymentStatus = 'refunded'
      bookingStatus = 'returned'
    } else if (status === 'paid') {
      bookingPaymentStatus = 'paid'
    }
    await Booking.findByIdAndUpdate(payment.booking, {
      paymentStatus: bookingPaymentStatus,
      ...(bookingStatus ? { status: bookingStatus } : {}),
    })
  }

  res.status(200).json({
    status: 'success',
    message: `Payment status updated to '${status}' successfully`,
    data: payment,
  })
})

export const getAdminSettings = catchAsync(async (req, res, next) => {
  let settings = await AdminSettings.findOne()
  if (!settings) {
    settings = await AdminSettings.create({
      codEnabled: true,
      upiEnabled: true,
      cardEnabled: true,
      qrEnabled: true,
      deliveryCharge: 49,
      codCharge: 0,
      homeVisitFee: 99,
      minOrderAmount: 199,
      maxCodAmount: 10000,
      taxRatePercent: 0,
      platformCommissionPercent: 15,
    })
  }

  res.status(200).json({
    status: 'success',
    data: settings,
    settings,
  })
})

export const updateAdminSettings = catchAsync(async (req, res, next) => {
  let settings = await AdminSettings.findOne()
  if (!settings) {
    settings = await AdminSettings.create(req.body)
  } else {
    Object.assign(settings, req.body)
    await settings.save()
  }

  res.status(200).json({
    status: 'success',
    message: 'System settings updated successfully',
    data: settings,
  })
})

// ==========================================
// ADMIN PAYMENT RECEIVING ACCOUNT
// ==========================================
export const getPaymentAccount = catchAsync(async (req, res, next) => {
  let account = await PaymentAccount.findOne({ isDefault: true })
  if (!account) {
    account = await PaymentAccount.create({
      businessName: 'TailorWala Bespoke Services',
      accountHolderName: 'TailorWala Enterprise Pvt Ltd',
      bankName: 'HDFC Bank',
      accountNumber: '50200084729184',
      ifscCode: 'HDFC0001234',
      upiId: 'tailorwala@icici',
      businessPhone: '+91 8789682127',
      businessEmail: 'billing@tailorwala.com',
      isActive: true,
      isDefault: true,
    })
  }

  // Mask account number for security: e.g. "•••• •••• 9184"
  const rawAcc = account.accountNumber || '1234567890'
  const maskedAcc = `•••• •••• ${rawAcc.slice(-4)}`

  res.status(200).json({
    status: 'success',
    data: {
      ...account.toObject(),
      accountNumberMasked: maskedAcc,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `upi://pay?pa=${account.upiId}&pn=${encodeURIComponent(account.businessName)}&cu=INR&tn=TailorWalaBespoke`,
      )}`,
    },
  })
})

export const savePaymentAccount = catchAsync(async (req, res, next) => {
  const { businessName, accountHolderName, bankName, accountNumber, ifscCode, upiId, businessPhone, businessEmail, isActive } = req.body

  let account = await PaymentAccount.findOne({ isDefault: true })
  if (!account) {
    account = new PaymentAccount({ isDefault: true })
  }

  if (businessName) account.businessName = businessName
  if (accountHolderName) account.accountHolderName = accountHolderName
  if (bankName) account.bankName = bankName
  if (accountNumber && !accountNumber.includes('•')) account.accountNumber = accountNumber
  if (ifscCode) account.ifscCode = ifscCode.toUpperCase()
  if (upiId) account.upiId = upiId.toLowerCase()
  if (businessPhone) account.businessPhone = businessPhone
  if (businessEmail) account.businessEmail = businessEmail
  if (isActive !== undefined) account.isActive = isActive

  await account.save()

  res.status(200).json({
    status: 'success',
    message: 'Business payment receiving account updated successfully.',
    data: account,
  })
})

// ==========================================
// EMPLOYEE MANAGEMENT & AUDIT LOGS
// ==========================================
export const getEmployees = catchAsync(async (req, res, next) => {
  const employees = await User.find({ role: 'employee' })
    .select('-passwordHash')
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: 'success',
    count: employees.length,
    data: employees,
    employees,
  })
})

export const createEmployee = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    designation,
    department,
    permissions,
    customPassword,
    password,
    employeeId: customEmployeeId,
    mustChangePassword,
  } = req.body

  if (!name || !email) {
    return next(new AppError('Please provide employee name and email address.', 400))
  }

  const existing = await User.findOne({ email: email.toLowerCase() })
  if (existing) {
    return next(new AppError('An account with this email address already exists.', 400))
  }

  // Determine unique employee ID
  let employeeId = customEmployeeId ? customEmployeeId.trim().toUpperCase() : ''
  if (employeeId) {
    const existingEmpId = await User.findOne({ employeeId })
    if (existingEmpId) {
      return next(new AppError(`Employee ID "${employeeId}" is already in use. Please enter a different ID.`, 400))
    }
  } else {
    // Generate unique employee ID: TW-EMP-XXXX
    const count = await User.countDocuments({ role: 'employee' })
    employeeId = `TW-EMP-${String(count + 1).padStart(4, '0')}`
  }

  // Generate or use custom password
  const plainPassword = (customPassword || password || '').trim() || `TW@${crypto.randomBytes(3).toString('hex')}#7`
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(plainPassword, salt)

  const employee = await User.create({
    name,
    email: email.toLowerCase(),
    employeeId,
    employeeDesignation: designation || 'Operations Associate',
    department: department || 'Operations',
    permissions: permissions || ['dashboard', 'orders', 'tailors', 'services'],
    isTempPassword: mustChangePassword === true,
    mustChangePassword: mustChangePassword === true,
    passwordHash,
    role: 'employee',
    phone: phone || '',
    isActive: true,
  })

  // Log creation activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: 'Employee Account Created',
    target: `${employee.name} (${employee.employeeId})`,
    details: `Designation: ${employee.employeeDesignation}, Department: ${employee.department}, Permissions: ${employee.permissions.join(', ')}`,
    ip: req.ip || '127.0.0.1',
  })

  res.status(201).json({
    status: 'success',
    message: `Employee ${employeeId} created successfully.`,
    data: {
      _id: employee._id,
      employeeId: employee.employeeId,
      uniqueNumber: employee.uniqueNumber || `EMP-${String(employee._id).slice(-6).toUpperCase()}`,
      name: employee.name,
      email: employee.email,
      temporaryPassword: plainPassword,
      permissions: employee.permissions,
      designation: employee.employeeDesignation,
    },
  })
})

export const updateEmployee = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    phone,
    designation,
    department,
    permissions,
    isActive,
    avatar,
    customPassword,
    password,
    idCardStatus,
    employeeId: newEmpId,
    mustChangePassword,
  } = req.body
  const employee = await User.findById(req.params.id)

  if (!employee || (employee.role !== 'employee' && employee.role !== 'admin')) {
    return next(new AppError('Employee record not found.', 404))
  }

  if (name) employee.name = name
  if (email) employee.email = email.toLowerCase()
  if (phone !== undefined) employee.phone = phone
  if (designation) employee.employeeDesignation = designation
  if (department) employee.department = department
  if (permissions) employee.permissions = permissions
  if (isActive !== undefined) employee.isActive = isActive
  if (avatar !== undefined) employee.avatar = avatar
  if (idCardStatus !== undefined) employee.idCardStatus = idCardStatus
  if (mustChangePassword !== undefined) employee.mustChangePassword = mustChangePassword

  // Check and update employee ID if changed
  if (newEmpId && newEmpId.trim().toUpperCase() !== (employee.employeeId || '')) {
    const trimmedId = newEmpId.trim().toUpperCase()
    const existing = await User.findOne({ employeeId: trimmedId, _id: { $ne: employee._id } })
    if (existing) {
      return next(new AppError(`Employee ID "${trimmedId}" is already assigned to another account.`, 400))
    }
    employee.employeeId = trimmedId
  }

  const newPass = (customPassword || password || '').trim()
  if (newPass && newPass.length >= 6) {
    const salt = await bcrypt.genSalt(12)
    employee.passwordHash = await bcrypt.hash(newPass, salt)
    employee.isTempPassword = false
    employee.failedLoginAttempts = 0
    employee.lockUntil = undefined
  }

  await employee.save({ validateBeforeSave: false })

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: 'Employee Details Updated',
    target: `${employee.name} (${employee.employeeId || employee.email})`,
    details: `Updated details for ${employee.employeeDesignation} in ${employee.department}`,
    ip: req.ip || '127.0.0.1',
  })

  res.status(200).json({
    status: 'success',
    message: 'Employee details & credentials updated successfully.',
    data: employee,
  })
})

export const deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await User.findById(req.params.id)
  if (!employee || employee.role !== 'employee') {
    return next(new AppError('Employee record not found.', 404))
  }

  await User.findByIdAndDelete(req.params.id)

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: 'Employee Deleted',
    target: `${employee.name} (${employee.employeeId})`,
    ip: req.ip || '127.0.0.1',
  })

  res.status(200).json({
    status: 'success',
    message: 'Employee removed successfully.',
  })
})

export const resetEmployeePassword = catchAsync(async (req, res, next) => {
  const employee = await User.findById(req.params.id)
  if (!employee || (employee.role !== 'employee' && employee.role !== 'admin')) {
    return next(new AppError('Employee record not found.', 404))
  }

  const { customPassword, password, mustChangePassword } = req.body
  const plainPassword = (customPassword || password || '').trim() || `TW@${crypto.randomBytes(3).toString('hex')}#9`
  const salt = await bcrypt.genSalt(12)
  employee.passwordHash = await bcrypt.hash(plainPassword, salt)
  employee.mustChangePassword = mustChangePassword !== undefined ? mustChangePassword : true
  employee.isTempPassword = true
  employee.failedLoginAttempts = 0
  employee.lockUntil = undefined
  employee.tokenVersion = (employee.tokenVersion || 0) + 1
  await employee.save({ validateBeforeSave: false })

  // Log activity
  await ActivityLog.create({
    user: req.user._id,
    employeeId: req.user.employeeId || 'ADMIN',
    userName: req.user.name,
    role: req.user.role,
    action: 'Employee Password Reset',
    target: `${employee.name} (${employee.employeeId || employee.email})`,
    details: `Password was reset by admin`,
    ip: req.ip || '127.0.0.1',
  })

  res.status(200).json({
    status: 'success',
    message: `Password for ${employee.name} updated successfully.`,
    temporaryPassword: plainPassword,
  })
})

export const getActivityLogs = catchAsync(async (req, res, next) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100)
  res.status(200).json({
    status: 'success',
    count: logs.length,
    data: logs,
    logs,
  })
})

// ==========================================
// ADMIN SERVICES / CATALOG MANAGEMENT
// ==========================================
export const getAllAdminServices = catchAsync(async (req, res, next) => {
  const cloths = await Cloth.find().sort({ createdAt: -1 })
  res.status(200).json({
    status: 'success',
    count: cloths.length,
    data: cloths,
    services: cloths,
  })
})

export const createAdminService = catchAsync(async (req, res, next) => {
  const { name, category, price, discountPrice, turnaroundDays, description, image, inStock } = req.body

  if (!name || price === undefined) {
    return next(new AppError('Please provide service name and price.', 400))
  }

  const cloth = await Cloth.create({
    name,
    category: category || 'Men',
    price: Number(price),
    discountPrice: discountPrice ? Number(discountPrice) : undefined,
    turnaroundDays: turnaroundDays ? Number(turnaroundDays) : 7,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
    inStock: inStock !== false,
  })

  res.status(201).json({
    status: 'success',
    message: 'Service created successfully.',
    data: cloth,
  })
})

export const updateAdminService = catchAsync(async (req, res, next) => {
  const cloth = await Cloth.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!cloth) return next(new AppError('Service not found.', 404))

  res.status(200).json({
    status: 'success',
    message: 'Service updated successfully.',
    data: cloth,
  })
})

export const deleteAdminService = catchAsync(async (req, res, next) => {
  const cloth = await Cloth.findByIdAndDelete(req.params.id)
  if (!cloth) return next(new AppError('Service not found.', 404))

  res.status(200).json({
    status: 'success',
    message: 'Service deleted successfully.',
  })
})

export const getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find()
    .populate('customer', 'name email avatar')
    .populate('tailor', 'name email')
    .populate('tailorProfile', 'shopName')
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: 'success',
    count: reviews.length,
    data: reviews,
  })
})

export const deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id)
  if (!review) {
    return next(new AppError('Review not found', 404))
  }

  res.status(200).json({
    status: 'success',
    message: 'Review removed by administrator',
  })
})

export const getAllCoupons = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 })
  res.status(200).json({
    status: 'success',
    data: coupons,
  })
})

export const createCoupon = catchAsync(async (req, res, next) => {
  const { code, title, description, discountType, discountValue, minOrderValue, maxDiscount, expiryDate } = req.body

  if (!code || !title || discountValue === undefined) {
    return next(new AppError('Please provide code, title, and discountValue', 400))
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    title,
    description: description || '',
    discountType: discountType || 'flat',
    discountValue: Number(discountValue),
    minOrderValue: Number(minOrderValue || 0),
    maxDiscount: Number(maxDiscount || 1000),
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    isActive: true,
  })

  res.status(201).json({
    status: 'success',
    data: coupon,
  })
})

export const deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) {
    return next(new AppError('Coupon not found', 404))
  }

  res.status(200).json({
    status: 'success',
    message: 'Coupon deleted successfully',
  })
})

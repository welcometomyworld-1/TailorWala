import crypto from 'crypto'
import Payment from '../models/Payment.js'
import Booking from '../models/Booking.js'
import Coupon from '../models/Coupon.js'
import Notification from '../models/Notification.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const createPaymentOrder = catchAsync(async (req, res, next) => {
  const { bookingId, paymentMethod = 'upi', provider = 'razorpay' } = req.body

  if (!bookingId) {
    return next(new AppError('Please provide bookingId', 400))
  }

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  if (booking.paymentStatus === 'paid') {
    return next(new AppError('This booking is already paid for.', 400))
  }

  const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`
  const orderId = `ORDER-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

  // Standard UPI deep link payload for QR code rendering
  const upiId = process.env.MERCHANT_UPI_ID || 'tailorwala@icici'
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=TailorWala&am=${booking.price}&cu=INR&tn=${encodeURIComponent(`Order ${booking.orderNumber || booking._id}`)}`

  res.status(200).json({
    status: 'success',
    data: {
      bookingId: booking._id,
      orderNumber: booking.orderNumber || `#TW-${booking._id.toString().slice(-6)}`,
      amount: booking.price,
      currency: 'INR',
      transactionId,
      orderId,
      provider: provider || 'razorpay',
      paymentMethod,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
      upiId,
      upiPayload,
    },
  })
})

export const verifyPayment = catchAsync(async (req, res, next) => {
  const {
    bookingId,
    transactionId,
    orderId,
    paymentMethod = 'upi',
    provider = 'razorpay',
    signature,
    providerPaymentId,
  } = req.body

  if (!bookingId || !transactionId) {
    return next(new AppError('Please provide bookingId and transactionId', 400))
  }

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  if (booking.paymentStatus === 'paid') {
    return res.status(200).json({
      status: 'success',
      message: 'Payment already recorded',
      data: { booking },
    })
  }

  // If real Razorpay keys are configured and provider is razorpay, verify HMAC signature
  if (
    provider === 'razorpay' &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET !== 'rzp_test_mock_secret' &&
    signature &&
    providerPaymentId
  ) {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${providerPaymentId}`)
      .digest('hex')

    if (generatedSignature !== signature) {
      return next(new AppError('Payment signature verification failed.', 400))
    }
  }

  const txn = transactionId || `TXN-${Date.now()}`

  // Create or update payment record
  let payment = await Payment.findOne({ transactionId: txn })
  if (!payment) {
    payment = await Payment.create({
      transactionId: txn,
      booking: booking._id,
      user: req.user._id,
      amount: booking.price,
      currency: 'INR',
      provider: provider || 'razorpay',
      status: 'paid',
      paymentMethod: paymentMethod || 'upi',
      providerOrderId: orderId || '',
      providerPaymentId: providerPaymentId || `PAY-${Date.now()}`,
      providerSignature: signature || '',
      receiptNumber: `REC-${Date.now()}`,
    })
  } else {
    payment.status = 'paid'
    payment.providerPaymentId = providerPaymentId || payment.providerPaymentId
    await payment.save()
  }

  // Update booking
  booking.paymentStatus = 'paid'
  booking.paymentMethod = paymentMethod
  booking.paymentTransactionId = payment.transactionId
  booking.paidAt = new Date()
  await booking.save()

  // Notify customer & tailor
  await Notification.create({
    recipient: booking.customer,
    sender: req.user._id,
    title: 'Payment Successful',
    message: `Payment of ₹${booking.price} for Order #${booking.orderNumber || booking._id} was successfully verified.`,
    type: 'payment_success',
    link: `/bookings/${booking._id}`,
    metadata: { bookingId: booking._id, transactionId: payment.transactionId },
  })

  await Notification.create({
    recipient: booking.tailor,
    sender: req.user._id,
    title: 'Payment Received',
    message: `Customer paid ₹${booking.price} for Order #${booking.orderNumber || booking._id}.`,
    type: 'payment_success',
    link: `/tailor`,
    metadata: { bookingId: booking._id },
  })

  res.status(200).json({
    status: 'success',
    message: 'Payment verified and order confirmed successfully',
    data: {
      ...payment.toObject(),
      booking,
      payment,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.status,
    },
  })
})

export const createCODPayment = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body

  if (!bookingId) {
    return next(new AppError('Please provide bookingId', 400))
  }

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  if (booking.paymentStatus === 'paid') {
    return next(new AppError('This booking is already marked as paid.', 400))
  }

  const transactionId = `COD-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

  // Create COD payment record with pending status
  const payment = await Payment.create({
    transactionId,
    booking: booking._id,
    user: req.user._id,
    amount: booking.price,
    currency: 'INR',
    provider: 'cod',
    status: 'pending',
    paymentMethod: 'cod',
    receiptNumber: `COD-REC-${Date.now()}`,
  })

  booking.paymentStatus = 'pending'
  booking.paymentMethod = 'cod'
  booking.paymentTransactionId = payment.transactionId
  await booking.save()

  // Notify tailor of COD order
  await Notification.create({
    recipient: booking.tailor,
    sender: req.user._id,
    title: 'New COD Order Booked',
    message: `Cash on delivery order #${booking.orderNumber || booking._id} created for ₹${booking.price}. Collect payment upon fitting handover.`,
    type: 'booking_created',
    link: `/tailor`,
    metadata: { bookingId: booking._id },
  })

  res.status(200).json({
    status: 'success',
    message: 'Cash on delivery order confirmed successfully',
    data: {
      ...payment.toObject(),
      booking,
      payment,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
    },
  })
})

export const getPaymentHistory = catchAsync(async (req, res, next) => {
  const query = req.user.role === 'admin' ? {} : { user: req.user._id }

  const payments = await Payment.find(query)
    .populate('booking', 'orderNumber serviceType status price')
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: 'success',
    count: payments.length,
    data: payments,
  })
})

export const applyCoupon = catchAsync(async (req, res, next) => {
  const { code, orderAmount = 0 } = req.body

  if (!code) {
    return next(new AppError('Please provide a coupon code', 400))
  }

  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  })

  if (!coupon) {
    return next(new AppError('Invalid or expired coupon code', 400))
  }

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    return next(new AppError('This coupon code has expired', 400))
  }

  if (coupon.minOrderValue && Number(orderAmount) < coupon.minOrderValue) {
    return next(
      new AppError(
        `This coupon requires a minimum order value of ₹${coupon.minOrderValue}`,
        400,
      ),
    )
  }

  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = (Number(orderAmount) * coupon.discountValue) / 100
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  } else {
    discount = coupon.discountValue
  }

  discount = Math.min(discount, Number(orderAmount))

  res.status(200).json({
    status: 'success',
    data: {
      code: coupon.code,
      title: coupon.title,
      discountAmount: Math.round(discount),
      finalAmount: Math.max(0, Math.round(Number(orderAmount) - discount)),
    },
  })
})

export const getReceivingAccount = catchAsync(async (req, res, next) => {
  let PaymentAccount = (await import('../models/PaymentAccount.js')).default
  let account = await PaymentAccount.findOne({ isDefault: true, isActive: true })

  if (!account) {
    account = {
      businessName: 'TailorWala Bespoke Services',
      upiId: 'tailorwala@icici',
      businessPhone: '+91 8789682127',
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      businessName: account.businessName,
      upiId: account.upiId,
      businessPhone: account.businessPhone,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
        `upi://pay?pa=${account.upiId}&pn=${encodeURIComponent(account.businessName)}&cu=INR&tn=TailorWalaPayment`,
      )}`,
    },
  })
})


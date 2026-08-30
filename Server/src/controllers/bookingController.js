import Booking from '../models/Booking.js'
import TailorProfile from '../models/TailorProfile.js'
import Notification from '../models/Notification.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'
import { isValidTransition, STATUS_LABELS } from '../utils/statusTransition.js'

export const createBooking = catchAsync(async (req, res, next) => {
  const {
    tailorId,
    serviceType,
    description,
    scheduledAt,
    timeSlot,
    price,
    totalAmount,
    items,
    fabricCost,
    stitchingCharge,
    homeVisitFee,
    deliveryFee,
    discountAmount,
    couponCode,
    shippingAddress,
    deliveryPreference,
    measurementProfileId,
    measurements,
    measurementNotes,
  } = req.body

  const resolvedPrice =
    price !== undefined
      ? Number(price)
      : totalAmount !== undefined
      ? Number(totalAmount)
      : items && items.length > 0 && items[0].price !== undefined
      ? Number(items[0].price)
      : undefined

  if (!tailorId || !serviceType || !scheduledAt || resolvedPrice === undefined || isNaN(resolvedPrice)) {
    return next(new AppError('Please provide tailorId, serviceType, scheduledAt and valid price/totalAmount', 400))
  }

  const tailorProfile = await TailorProfile.findById(tailorId)
  if (!tailorProfile) {
    return next(new AppError('Selected tailor profile does not exist', 404))
  }

  // Initial timeline entry
  const initialTimeline = [
    {
      status: 'pending',
      previousStatus: null,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'customer',
      note: 'Order placed by customer',
      timestamp: new Date(),
    },
  ]

  // Calculate estimated delivery
  const estDays = tailorProfile.deliveryDays || 7
  const estimatedDeliveryDate = new Date(scheduledAt)
  estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estDays)

  const booking = await Booking.create({
    customer: req.user._id,
    tailor: tailorProfile.user,
    tailorProfile: tailorProfile._id,
    serviceType,
    description: description || '',
    items: items && items.length > 0 ? items : [{ name: serviceType, price: resolvedPrice, quantity: 1 }],
    scheduledAt: new Date(scheduledAt),
    timeSlot: timeSlot || '10:00 AM - 01:00 PM',
    status: 'pending',
    timeline: initialTimeline,
    price: resolvedPrice,
    fabricCost: Number(fabricCost || 0),
    stitchingCharge: Number(stitchingCharge || resolvedPrice),
    homeVisitFee: Number(homeVisitFee || 99),
    deliveryFee: Number(deliveryFee || 49),
    discountAmount: Number(discountAmount || 0),
    couponCode: couponCode || '',
    shippingAddress: shippingAddress || {
      fullName: req.user.name,
      phone: req.user.phone || '',
      city: req.user.city || tailorProfile.city || '',
      address: req.user.address || '',
      pincode: req.user.pincode || '',
    },
    deliveryPreference: deliveryPreference || 'standard',
    measurementProfileId: measurementProfileId || null,
    measurements: measurements || [],
    measurementNotes: measurementNotes || '',
    estimatedDeliveryDate,
  })

  // Create in-app notification for tailor
  await Notification.create({
    recipient: tailorProfile.user,
    sender: req.user._id,
    title: 'New Booking Request',
    message: `${req.user.name} booked ${serviceType} for ${new Date(scheduledAt).toLocaleDateString()}.`,
    type: 'booking_created',
    link: `/tailor`,
    metadata: { bookingId: booking._id },
  })

  const populated = await Booking.findById(booking._id)
    .populate('customer', 'name email phone avatar city')
    .populate('tailor', 'name email phone')
    .populate('tailorProfile', 'shopName city basePrice ratingAverage')

  res.status(201).json({
    status: 'success',
    data: populated,
  })
})

export const getCustomerBookings = catchAsync(async (req, res, next) => {
  const { status } = req.query
  const query = { customer: req.user._id }
  if (status) query.status = status

  const bookings = await Booking.find(query)
    .populate('tailor', 'name phone email avatar')
    .populate('tailorProfile', 'shopName city ratingAverage basePrice')
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: 'success',
    count: bookings.length,
    data: bookings,
  })
})

export const getTailorBookings = catchAsync(async (req, res, next) => {
  const { status } = req.query
  const query = { tailor: req.user._id }
  if (status) query.status = status

  const bookings = await Booking.find(query)
    .populate('customer', 'name email phone city address pincode avatar')
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: 'success',
    count: bookings.length,
    data: bookings,
  })
})

export const getBookingById = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('customer', 'name email phone city address pincode avatar')
    .populate('tailor', 'name email phone avatar')
    .populate('tailorProfile', 'shopName city ratingAverage basePrice address')
    .populate('measurementProfileId')

  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  const isCustomer = booking.customer && booking.customer._id.toString() === req.user._id.toString()
  const isTailor = booking.tailor && booking.tailor._id.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isCustomer && !isTailor && !isAdmin) {
    return next(new AppError('You do not have permission to view this booking', 403))
  }

  res.status(200).json({
    status: 'success',
    data: booking,
  })
})

export const updateStatus = catchAsync(async (req, res, next) => {
  const { status, note } = req.body

  const booking = await Booking.findById(req.params.id)
  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  const isTailor = booking.tailor.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isTailor && !isAdmin) {
    return next(new AppError('Only the assigned tailor or admin can update order status', 403))
  }

  // Validate state machine transition
  if (!isValidTransition(booking.status, status, req.user.role)) {
    return next(
      new AppError(
        `Invalid status transition from '${booking.status}' to '${status}'.`,
        400,
      ),
    )
  }

  const previousStatus = booking.status
  booking.status = status

  // Log timeline event
  booking.timeline.push({
    status,
    previousStatus,
    updatedBy: req.user._id,
    updatedByName: req.user.name,
    role: req.user.role,
    note: note || `Status updated to ${STATUS_LABELS[status] || status}`,
    timestamp: new Date(),
  })

  // If delivered, update tailor's completed orders count
  if (status === 'delivered') {
    await TailorProfile.findOneAndUpdate(
      { user: booking.tailor },
      { $inc: { completedOrdersCount: 1 } },
    )
  }

  await booking.save()

  // Notify customer
  await Notification.create({
    recipient: booking.customer,
    sender: req.user._id,
    title: `Order Update: ${STATUS_LABELS[status] || status}`,
    message: `Your tailoring order #${booking.orderNumber || booking._id} is now ${STATUS_LABELS[status] || status}.`,
    type: status === 'ready' ? 'order_ready' : status === 'delivered' ? 'order_delivered' : 'status_updated',
    link: `/bookings/${booking._id}`,
    metadata: { bookingId: booking._id, status },
  })

  const updated = await Booking.findById(booking._id)
    .populate('customer', 'name email phone')
    .populate('tailor', 'name email phone')
    .populate('tailorProfile', 'shopName city')

  res.status(200).json({
    status: 'success',
    data: updated,
  })
})

export const saveMeasurements = catchAsync(async (req, res, next) => {
  const { measurements, measurementNotes } = req.body

  const booking = await Booking.findOne({
    _id: req.params.id,
    tailor: req.user._id,
  })

  if (!booking) {
    return next(new AppError('Booking not found or you are not assigned to it', 404))
  }

  booking.measurements = measurements || []
  if (measurementNotes !== undefined) booking.measurementNotes = measurementNotes

  // If status was pending / measurement_required, progress it
  if (booking.status === 'measurement_required' || booking.status === 'accepted') {
    const prev = booking.status
    booking.status = 'in_progress'
    booking.timeline.push({
      status: 'in_progress',
      previousStatus: prev,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      role: 'tailor',
      note: 'Measurements taken and recorded during home visit',
      timestamp: new Date(),
    })
  }

  await booking.save()

  res.status(200).json({
    status: 'success',
    message: 'Measurements recorded successfully',
    data: booking,
  })
})

export const cancelBooking = catchAsync(async (req, res, next) => {
  const { reason } = req.body
  const booking = await Booking.findById(req.params.id)

  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  const isCustomer = booking.customer.toString() === req.user._id.toString()
  const isTailor = booking.tailor.toString() === req.user._id.toString()
  const isAdmin = req.user.role === 'admin'

  if (!isCustomer && !isTailor && !isAdmin) {
    return next(new AppError('You do not have permission to cancel this booking', 403))
  }

  if (booking.status === 'delivered') {
    return next(new AppError('Delivered orders cannot be cancelled', 400))
  }

  const prev = booking.status
  booking.status = 'cancelled'
  booking.timeline.push({
    status: 'cancelled',
    previousStatus: prev,
    updatedBy: req.user._id,
    updatedByName: req.user.name,
    role: req.user.role,
    note: reason || `Cancelled by ${req.user.role}`,
    timestamp: new Date(),
  })

  await booking.save()

  // Notify opposite party
  const notifyRecipient = isCustomer ? booking.tailor : booking.customer
  await Notification.create({
    recipient: notifyRecipient,
    sender: req.user._id,
    title: 'Order Cancelled',
    message: `Order #${booking.orderNumber || booking._id} was cancelled. Reason: ${reason || 'Not specified'}.`,
    type: 'status_updated',
    link: isCustomer ? '/tailor' : `/bookings/${booking._id}`,
    metadata: { bookingId: booking._id },
  })

  res.status(200).json({
    status: 'success',
    message: 'Booking cancelled successfully',
    data: booking,
  })
})

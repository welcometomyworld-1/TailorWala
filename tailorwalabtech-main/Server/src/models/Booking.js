import mongoose from 'mongoose'
import { ORDER_STATUSES } from '../utils/statusTransition.js'

const measurementFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String, default: 'inch' },
  },
  { _id: false },
)

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['stitching', 'fabric', 'alteration', 'home_visit'], default: 'stitching' },
    category: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, default: 1 },
    fabricMeters: { type: Number, default: 0 },
    customizationNotes: { type: String, default: '' },
    fabricId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cloth' },
  },
  { _id: false },
)

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
    },
    previousStatus: {
      type: String,
      enum: [...ORDER_STATUSES, null],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedByName: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'system',
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
)

const bookingSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tailorProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TailorProfile',
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    items: [orderItemSchema],
    scheduledAt: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      default: '10:00 AM - 01:00 PM',
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'pending',
    },
    timeline: [statusHistorySchema],
    price: {
      type: Number,
      required: true,
    },
    fabricCost: {
      type: Number,
      default: 0,
    },
    stitchingCharge: {
      type: Number,
      default: 0,
    },
    homeVisitFee: {
      type: Number,
      default: 99,
    },
    deliveryFee: {
      type: Number,
      default: 49,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: '',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'cod', 'mock'],
      default: 'upi',
    },
    paymentTransactionId: {
      type: String,
      default: '',
    },
    paidAt: {
      type: Date,
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    deliveryPreference: {
      type: String,
      enum: ['standard', 'express'],
      default: 'standard',
    },
    measurementProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MeasurementProfile',
    },
    measurements: [measurementFieldSchema],
    measurementNotes: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    reviewComment: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    estimatedDeliveryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

// Pre-save to assign human-readable orderNumber
bookingSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
    this.orderNumber = `TW-${dateStr}-${randomSuffix}`
  }
  if (typeof next === 'function') next()
})

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

export default Booking

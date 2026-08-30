import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    provider: {
      type: String,
      enum: ['mock', 'razorpay', 'stripe', 'cod'],
      default: 'mock',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'returned', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cod'],
      default: 'upi',
    },
    providerOrderId: {
      type: String,
      default: '',
    },
    providerPaymentId: {
      type: String,
      default: '',
    },
    providerSignature: {
      type: String,
      default: '',
    },
    receiptNumber: {
      type: String,
      default: '',
    },
    failureReason: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

export default Payment

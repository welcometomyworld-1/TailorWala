import mongoose from 'mongoose'

const paymentAccountSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
      default: 'TailorWala Bespoke Services',
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
      default: 'TailorWala Enterprise Pvt Ltd',
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
      default: 'HDFC Bank',
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
      default: '50200084729184',
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: 'HDFC0001234',
    },
    upiId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      default: 'tailorwala@icici',
    },
    businessPhone: {
      type: String,
      trim: true,
      default: '+91 8789682127',
    },
    businessEmail: {
      type: String,
      trim: true,
      default: 'billing@tailorwala.com',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const PaymentAccount =
  mongoose.models.PaymentAccount || mongoose.model('PaymentAccount', paymentAccountSchema)

export default PaymentAccount

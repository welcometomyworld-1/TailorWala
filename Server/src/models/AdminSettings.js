import mongoose from 'mongoose'

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pincodes: [{ type: String, trim: true }],
    normalCharge: { type: Number, default: 49 },
    expressCharge: { type: Number, default: 149 },
    estimatedDays: { type: Number, default: 7 },
    expressDays: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
)

const adminSettingsSchema = new mongoose.Schema(
  {
    codEnabled: {
      type: Boolean,
      default: true,
    },
    upiEnabled: {
      type: Boolean,
      default: true,
    },
    cardEnabled: {
      type: Boolean,
      default: true,
    },
    qrEnabled: {
      type: Boolean,
      default: true,
    },
    deliveryCharge: {
      type: Number,
      default: 49,
      min: 0,
    },
    expressDeliveryCharge: {
      type: Number,
      default: 149,
      min: 0,
    },
    standardDeliveryDays: {
      type: Number,
      default: 7,
      min: 1,
    },
    expressDeliveryDays: {
      type: Number,
      default: 3,
      min: 1,
    },
    servicedPincodes: [
      {
        type: String,
        trim: true,
      },
    ],
    deliveryZones: [deliveryZoneSchema],
    codCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    homeVisitFee: {
      type: Number,
      default: 99,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 199,
      min: 0,
    },
    maxCodAmount: {
      type: Number,
      default: 10000,
      min: 0,
    },
    taxRatePercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 28,
    },
    platformCommissionPercent: {
      type: Number,
      default: 15,
      min: 0,
      max: 50,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const AdminSettings =
  mongoose.models.AdminSettings || mongoose.model('AdminSettings', adminSettingsSchema)

export default AdminSettings

import mongoose from 'mongoose'

const serviceItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Men', 'Women', 'Kids', 'Wedding', 'Alteration', 'General'],
      default: 'General',
    },
    price: { type: Number, required: true, min: 0 },
    turnaroundDays: { type: Number, default: 7 },
    description: { type: String, trim: true, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { _id: true },
)

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, default: 'General' },
    imageUrl: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: true },
)

const fabricItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Cotton', 'Linen', 'Silk', 'Wool', 'Velvet', 'Denim', 'Rayon', 'Blend', 'Other'],
      default: 'Cotton',
    },
    color: { type: String, trim: true, default: '' },
    pattern: {
      type: String,
      enum: ['Plain', 'Checks', 'Striped', 'Printed', 'Textured', 'Embroidered', 'Jacquard'],
      default: 'Plain',
    },
    quantityMeters: { type: Number, default: 25, min: 0 },
    pricePerMeter: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: '' },
    suitableFor: [{ type: String, trim: true }],
    badge: { type: String, trim: true, default: 'Premium' },
    image: { type: String, default: '' },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    isVisible: { type: Boolean, default: true },
  },
  { _id: true, timestamps: true },
)

const tailorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      trim: true,
      sparse: true,
    },
    shopName: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    specializations: [
      {
        type: String,
        trim: true,
      },
    ],
    basePrice: {
      type: Number,
      default: 299,
      min: 0,
    },
    servicesOffered: [serviceItemSchema],
    portfolio: [portfolioItemSchema],
    fabrics: [fabricItemSchema],
    workConditions: {
      homeVisitAvailable: { type: Boolean, default: true },
      shopVisitAvailable: { type: Boolean, default: true },
      customMeasurements: { type: Boolean, default: true },
      customStitching: { type: Boolean, default: true },
      expressDelivery: { type: Boolean, default: true },
      normalDelivery: { type: Boolean, default: true },
      alterationAvailable: { type: Boolean, default: true },
      fabricProvided: { type: Boolean, default: true },
      customerFabricAccepted: { type: Boolean, default: true },
      pickupAvailable: { type: Boolean, default: true },
      deliveryAvailable: { type: Boolean, default: true },
    },
    workingHours: {
      start: { type: String, default: '09:00 AM' },
      end: { type: String, default: '08:30 PM' },
      days: { type: String, default: 'Monday - Saturday' },
    },
    homeVisitRadiusKm: {
      type: Number,
      default: 15,
      min: 1,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    serviceArea: {
      type: String,
      trim: true,
      default: '',
    },
    vacationMessage: {
      type: String,
      trim: true,
      default: '',
    },
    photos: [
      {
        type: String,
      },
    ],
    ratingAverage: {
      type: Number,
      default: 4.8,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      trim: true,
      default: 'Delhi',
    },
    area: {
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
    homeVisitAvailable: {
      type: Boolean,
      default: true,
    },
    homeVisitFee: {
      type: Number,
      default: 99,
    },
    deliveryDays: {
      type: Number,
      default: 7,
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    completedOrdersCount: {
      type: Number,
      default: 0,
    },
    availableSlots: [
      {
        type: String,
        default: ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:30 PM'],
      },
    ],
  },
  {
    timestamps: true,
  },
)

const TailorProfile =
  mongoose.models.TailorProfile || mongoose.model('TailorProfile', tailorProfileSchema)

export default TailorProfile

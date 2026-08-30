import mongoose from 'mongoose'

const measurementFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: Number, required: true },
    unit: { type: String, enum: ['inch', 'cm'], default: 'inch' },
  },
  { _id: false },
)

const measurementProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    profileName: {
      type: String,
      required: [true, 'Please provide a profile name (e.g. My Formal Suit, Wedding Lehenga)'],
      trim: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'kids', 'unisex'],
      default: 'male',
    },
    garmentCategory: {
      type: String,
      required: [true, 'Please select garment category'],
      enum: [
        'Shirt',
        'Pant',
        'Suit',
        'Kurta',
        'Sherwani',
        'Blouse',
        'Lehenga',
        'Dress',
        'Kurti',
        'Other',
      ],
    },
    measurements: [measurementFieldSchema],
    height: {
      type: Number, // in cm
    },
    weight: {
      type: Number, // in kg
    },
    fitPreference: {
      type: String,
      enum: ['slim', 'regular', 'relaxed', 'tailored'],
      default: 'regular',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const MeasurementProfile =
  mongoose.models.MeasurementProfile ||
  mongoose.model('MeasurementProfile', measurementProfileSchema)

export default MeasurementProfile

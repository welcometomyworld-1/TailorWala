import mongoose from 'mongoose'

const clothSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide fabric name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide fabric description'],
    },
    pricePerMeter: {
      type: Number,
      required: [true, 'Please provide price per meter'],
      min: 0,
    },
    category: {
      type: String,
      enum: ['Men', 'Women', 'Kids', 'Unstitched', 'Fabric', 'Premium', 'Silk', 'Cotton', 'Linen', 'Wool'],
      default: 'Fabric',
    },
    image: {
      type: String,
      required: [true, 'Please provide fabric image URL'],
    },
    stock: {
      type: Number,
      default: 50,
      min: 0,
    },
    color: {
      type: String,
      default: '',
    },
    material: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Cloth = mongoose.models.Cloth || mongoose.model('Cloth', clothSchema)

export default Cloth

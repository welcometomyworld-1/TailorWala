import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per completed booking
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
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    comment: {
      type: String,
      required: [true, 'Please write a brief review'],
      trim: true,
    },
    photos: [
      {
        type: String,
      },
    ],
    tailorReply: {
      comment: { type: String, trim: true, default: '' },
      repliedAt: { type: Date },
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema)

export default Review

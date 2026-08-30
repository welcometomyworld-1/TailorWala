import Review from '../models/Review.js'
import Booking from '../models/Booking.js'
import TailorProfile from '../models/TailorProfile.js'
import Notification from '../models/Notification.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const createReview = catchAsync(async (req, res, next) => {
  const { bookingId, rating, title, comment, photos } = req.body

  if (!bookingId || !rating || !comment) {
    return next(new AppError('Please provide bookingId, rating (1-5), and review comment', 400))
  }

  const booking = await Booking.findById(bookingId)
  if (!booking) {
    return next(new AppError('Booking not found', 404))
  }

  if (booking.customer.toString() !== req.user._id.toString()) {
    return next(new AppError('You can only review your own bookings', 403))
  }

  if (booking.status !== 'delivered') {
    return next(new AppError('You can only review orders that have been successfully delivered', 400))
  }

  const existingReview = await Review.findOne({ booking: booking._id })
  if (existingReview) {
    return next(new AppError('You have already submitted a review for this order', 400))
  }

  const numRating = Number(rating)
  if (numRating < 1 || numRating > 5) {
    return next(new AppError('Rating must be between 1 and 5 stars', 400))
  }

  const review = await Review.create({
    booking: booking._id,
    customer: req.user._id,
    tailor: booking.tailor,
    tailorProfile: booking.tailorProfile,
    rating: numRating,
    title: title || '',
    comment,
    photos: photos || [],
  })

  // Update booking with review snapshot
  booking.rating = numRating
  booking.reviewComment = comment
  booking.reviewedAt = new Date()
  await booking.save()

  // Recalculate tailor profile rating
  if (booking.tailorProfile) {
    const allReviews = await Review.find({
      tailorProfile: booking.tailorProfile,
      isApproved: true,
    })

    const totalStars = allReviews.reduce((sum, r) => sum + r.rating, 0)
    const ratingCount = allReviews.length
    const ratingAverage = ratingCount > 0 ? Math.round((totalStars / ratingCount) * 10) / 10 : 5.0

    await TailorProfile.findByIdAndUpdate(booking.tailorProfile, {
      ratingAverage,
      ratingCount,
    })
  }

  // Notify tailor
  await Notification.create({
    recipient: booking.tailor,
    sender: req.user._id,
    title: 'New Customer Review',
    message: `${req.user.name} rated you ${numRating} stars: "${comment.slice(0, 60)}..."`,
    type: 'review_received',
    link: `/tailor`,
    metadata: { reviewId: review._id },
  })

  res.status(201).json({
    status: 'success',
    data: review,
  })
})

export const getReviewsForTailor = catchAsync(async (req, res, next) => {
  const { tailorId } = req.params
  const reviews = await Review.find({ tailorProfile: tailorId, isApproved: true })
    .populate('customer', 'name avatar city')
    .sort({ createdAt: -1 })

  res.status(200).json({
    status: 'success',
    count: reviews.length,
    data: reviews,
  })
})

export const replyToReview = catchAsync(async (req, res, next) => {
  const { comment } = req.body
  if (!comment) {
    return next(new AppError('Please provide a reply message', 400))
  }

  const review = await Review.findById(req.params.id)
  if (!review) {
    return next(new AppError('Review not found', 404))
  }

  if (review.tailor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return next(new AppError('You can only reply to reviews on your own profile', 403))
  }

  review.tailorReply = {
    comment,
    repliedAt: new Date(),
  }

  await review.save()

  res.status(200).json({
    status: 'success',
    message: 'Reply posted successfully',
    data: review,
  })
})

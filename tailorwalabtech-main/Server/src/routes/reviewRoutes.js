import express from 'express'
import {
  createReview,
  getReviewsForTailor,
  replyToReview,
} from '../controllers/reviewController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.get('/tailor/:tailorId', getReviewsForTailor)
router.post('/', protect, restrictTo('customer', 'admin'), createReview)
router.post('/:id/reply', protect, restrictTo('tailor', 'admin'), replyToReview)

export default router

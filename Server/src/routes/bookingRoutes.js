import express from 'express'
import {
  createBooking,
  getCustomerBookings,
  getTailorBookings,
  getBookingById,
  updateStatus,
  saveMeasurements,
  cancelBooking,
} from '../controllers/bookingController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.post('/', protect, restrictTo('customer', 'admin'), createBooking)
router.get('/my', protect, restrictTo('customer', 'admin'), getCustomerBookings)
router.get('/tailor', protect, restrictTo('tailor', 'admin'), getTailorBookings)
router.get('/:id', protect, getBookingById)
router.patch('/:id/status', protect, updateStatus)
router.post('/:id/measurements', protect, restrictTo('tailor', 'admin'), saveMeasurements)
router.post('/:id/cancel', protect, cancelBooking)

export default router

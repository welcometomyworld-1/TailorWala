import express from 'express'
import {
  createPaymentOrder,
  verifyPayment,
  createCODPayment,
  getPaymentHistory,
  applyCoupon,
  getReceivingAccount,
} from '../controllers/paymentController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.post('/apply-coupon', applyCoupon)
router.post('/coupon', applyCoupon)
router.get('/receiving-account', getReceivingAccount)

router.use(protect)

router.post('/create-order', createPaymentOrder)
router.post('/verify', verifyPayment)
router.post('/cod', createCODPayment)
router.get('/history', getPaymentHistory)
router.get('/my', getPaymentHistory)

export default router

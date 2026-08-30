import express from 'express'
import {
  getAdminStats,
  getAllUsers,
  updateUserStatus,
  getAllTailors,
  approveTailor,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  getAllPayments,
  getPaymentsOverview,
  verifyCODPayment,
  refundPayment,
  updatePaymentStatus,
  getAdminSettings,
  updateAdminSettings,
  getPaymentAccount,
  savePaymentAccount,
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  resetEmployeePassword,
  getActivityLogs,
  getAllAdminServices,
  createAdminService,
  updateAdminService,
  deleteAdminService,
  getAllReviews,
  deleteReview,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
} from '../controllers/adminController.js'
import { protect, restrictTo, requirePermission } from '../middleware/auth.js'

const router = express.Router()

// Restrict all admin routes to authenticated admin, super_admin, or employee
router.use(protect)
router.use(restrictTo('admin', 'super_admin', 'employee'))

// Statistics & Overviews
router.get('/stats', requirePermission('dashboard'), getAdminStats)

// User Management
router.get('/users', requirePermission('users', 'customers'), getAllUsers)
router.patch('/users/:id', requirePermission('users', 'customers'), updateUserStatus)

// Tailor Profile Moderation
router.get('/tailors', requirePermission('tailors'), getAllTailors)
router.patch('/tailors/:id', requirePermission('tailors'), approveTailor)

// Booking / Order Management
router.get('/bookings', requirePermission('orders'), getAllBookings)
router.get('/bookings/:id', requirePermission('orders'), getBookingById)
router.patch('/bookings/:id', requirePermission('orders'), updateBookingStatus)

// Payment Management
router.get('/payments', requirePermission('payments'), getAllPayments)
router.get('/payments/overview', requirePermission('payments'), getPaymentsOverview)
router.put('/payments/:id/mark-paid', requirePermission('payments'), verifyCODPayment)
router.put('/payments/:id/verify-cod', requirePermission('payments'), verifyCODPayment)
router.post('/payments/:id/refund', requirePermission('payments'), refundPayment)
router.patch('/payments/:id/status', requirePermission('payments'), updatePaymentStatus)

// Platform System Settings
router.route('/settings')
  .get(requirePermission('payment_settings', 'delivery_settings', 'settings'), getAdminSettings)
  .put(requirePermission('payment_settings', 'delivery_settings', 'settings'), updateAdminSettings)

// Business Payment Receiving Account
router.route('/payment-account')
  .get(requirePermission('payment_settings', 'settings'), getPaymentAccount)
  .post(requirePermission('payment_settings', 'settings'), savePaymentAccount)
  .put(requirePermission('payment_settings', 'settings'), savePaymentAccount)

// Employee Management (Restricted to Admin / Super Admin only)
router.get('/employees', requirePermission('employees'), getEmployees)
router.post('/employees', requirePermission('employees'), createEmployee)
router.patch('/employees/:id', requirePermission('employees'), updateEmployee)
router.delete('/employees/:id', requirePermission('employees'), deleteEmployee)
router.post('/employees/:id/reset-password', requirePermission('employees'), resetEmployeePassword)

// Audit Activity Logs
router.get('/activity-logs', requirePermission('activity_logs'), getActivityLogs)

// Tailoring Services Catalog Management
router.route('/services')
  .get(requirePermission('services'), getAllAdminServices)
  .post(requirePermission('services'), createAdminService)

router.route('/services/:id')
  .patch(requirePermission('services'), updateAdminService)
  .delete(requirePermission('services'), deleteAdminService)

// Reviews Moderation
router.route('/reviews').get(requirePermission('reviews'), getAllReviews)
router.delete('/reviews/:id', requirePermission('reviews'), deleteReview)

// Coupon Management
router.route('/coupons').get(requirePermission('coupons'), getAllCoupons).post(requirePermission('coupons'), createCoupon)
router.delete('/coupons/:id', requirePermission('coupons'), deleteCoupon)

export default router

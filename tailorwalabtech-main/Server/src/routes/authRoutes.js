import express from 'express'
import {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  logoutAllSessions,
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  verifyIDCard,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/verify-id/:idNumber', verifyIDCard)
router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:token', resetPassword)
router.post('/logout-all', protect, logoutAllSessions)
router.post('/change-password', protect, changePassword)
router.post('/2fa/setup', protect, setup2FA)
router.post('/2fa/verify', protect, verify2FA)
router.post('/2fa/disable', protect, disable2FA)

export default router

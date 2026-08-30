import express from 'express'
import {
  listTailors,
  getTailorById,
  getMyProfile,
  createOrUpdateProfile,
  getEarnings,
} from '../controllers/tailorController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.get('/', listTailors)
router.get('/profile/me', protect, restrictTo('tailor'), getMyProfile)
router.post('/profile', protect, restrictTo('tailor'), createOrUpdateProfile)
router.put('/profile', protect, restrictTo('tailor'), createOrUpdateProfile)
router.get('/earnings', protect, restrictTo('tailor'), getEarnings)
router.get('/:id', getTailorById)

export default router

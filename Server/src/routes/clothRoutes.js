import express from 'express'
import {
  getCloths,
  getClothById,
  createCloth,
  seedCloths,
} from '../controllers/clothController.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.get('/', getCloths)
router.get('/seed', seedCloths)
router.get('/:id', getClothById)
router.post('/', protect, restrictTo('admin'), createCloth)

export default router

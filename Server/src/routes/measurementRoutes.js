import express from 'express'
import {
  getMeasurementProfiles,
  getMeasurementProfileById,
  createMeasurementProfile,
  updateMeasurementProfile,
  deleteMeasurementProfile,
  duplicateMeasurementProfile,
  getTemplates,
} from '../controllers/measurementController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/templates', getTemplates)
router.get('/', protect, getMeasurementProfiles)
router.get('/:id', protect, getMeasurementProfileById)
router.post('/', protect, createMeasurementProfile)
router.put('/:id', protect, updateMeasurementProfile)
router.delete('/:id', protect, deleteMeasurementProfile)
router.post('/:id/duplicate', protect, duplicateMeasurementProfile)

export default router

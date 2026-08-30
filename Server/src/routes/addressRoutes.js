import express from 'express'
import {
  getMyAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/addressController.js'
import protect from '../middleware/auth.js'

const router = express.Router()

router.use(protect) // All address operations require authentication

router.route('/').get(getMyAddresses).post(createAddress)

router
  .route('/:id')
  .get(getAddressById)
  .put(updateAddress)
  .delete(deleteAddress)

router.patch('/:id/default', setDefaultAddress)

export default router

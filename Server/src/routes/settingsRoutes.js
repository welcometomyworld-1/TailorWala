import express from 'express'
import AdminSettings from '../models/AdminSettings.js'
import catchAsync from '../utils/catchAsync.js'

const router = express.Router()

// Public endpoint for checkout and client configuration
router.get('/', catchAsync(async (req, res) => {
  let settings = await AdminSettings.findOne().select(
    'codEnabled upiEnabled cardEnabled qrEnabled deliveryCharge codCharge homeVisitFee minOrderAmount maxCodAmount taxRatePercent -_id',
  )

  if (!settings) {
    settings = {
      codEnabled: true,
      upiEnabled: true,
      cardEnabled: true,
      qrEnabled: true,
      deliveryCharge: 49,
      codCharge: 0,
      homeVisitFee: 99,
      minOrderAmount: 199,
      maxCodAmount: 10000,
      taxRatePercent: 0,
    }
  }

  res.status(200).json({
    status: 'success',
    data: settings,
  })
}))

export default router

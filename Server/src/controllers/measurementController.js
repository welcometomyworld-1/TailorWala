import MeasurementProfile from '../models/MeasurementProfile.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const GARMENT_TEMPLATES = {
  male: {
    Shirt: [
      { name: 'Collar / Neck', unit: 'inch', defaultValue: 15.5 },
      { name: 'Chest', unit: 'inch', defaultValue: 40 },
      { name: 'Waist', unit: 'inch', defaultValue: 34 },
      { name: 'Shoulder Width', unit: 'inch', defaultValue: 18 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 25 },
      { name: 'Bicep / Armhole', unit: 'inch', defaultValue: 15 },
      { name: 'Shirt Length', unit: 'inch', defaultValue: 30 },
      { name: 'Wrist / Cuff', unit: 'inch', defaultValue: 9 },
    ],
    Pant: [
      { name: 'Waist', unit: 'inch', defaultValue: 34 },
      { name: 'Hips / Seat', unit: 'inch', defaultValue: 41 },
      { name: 'Thigh Circumference', unit: 'inch', defaultValue: 24 },
      { name: 'Inseam Length', unit: 'inch', defaultValue: 32 },
      { name: 'Outseam Length', unit: 'inch', defaultValue: 42 },
      { name: 'Crotch / Rise', unit: 'inch', defaultValue: 11 },
      { name: 'Bottom Hem Width', unit: 'inch', defaultValue: 15 },
    ],
    Suit: [
      { name: 'Chest', unit: 'inch', defaultValue: 40 },
      { name: 'Waist (Jacket)', unit: 'inch', defaultValue: 36 },
      { name: 'Shoulder Width', unit: 'inch', defaultValue: 18.5 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 25.5 },
      { name: 'Jacket Length', unit: 'inch', defaultValue: 30 },
      { name: 'Trouser Waist', unit: 'inch', defaultValue: 34 },
      { name: 'Trouser Length', unit: 'inch', defaultValue: 42 },
    ],
    Kurta: [
      { name: 'Chest', unit: 'inch', defaultValue: 41 },
      { name: 'Waist', unit: 'inch', defaultValue: 37 },
      { name: 'Shoulder Width', unit: 'inch', defaultValue: 18 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 25 },
      { name: 'Kurta Length', unit: 'inch', defaultValue: 42 },
      { name: 'Neck / Collar', unit: 'inch', defaultValue: 16 },
    ],
    Sherwani: [
      { name: 'Chest', unit: 'inch', defaultValue: 42 },
      { name: 'Waist', unit: 'inch', defaultValue: 38 },
      { name: 'Shoulder Width', unit: 'inch', defaultValue: 19 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 26 },
      { name: 'Sherwani Length', unit: 'inch', defaultValue: 44 },
      { name: 'Collar Circumference', unit: 'inch', defaultValue: 16.5 },
    ],
  },
  female: {
    Blouse: [
      { name: 'Upper Bust', unit: 'inch', defaultValue: 34 },
      { name: 'Full Bust', unit: 'inch', defaultValue: 36 },
      { name: 'Under Bust', unit: 'inch', defaultValue: 30 },
      { name: 'Blouse Length', unit: 'inch', defaultValue: 14.5 },
      { name: 'Shoulder Width', unit: 'inch', defaultValue: 14 },
      { name: 'Front Neck Depth', unit: 'inch', defaultValue: 7 },
      { name: 'Back Neck Depth', unit: 'inch', defaultValue: 9 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 10 },
      { name: 'Armhole', unit: 'inch', defaultValue: 15 },
    ],
    Suit: [
      { name: 'Bust', unit: 'inch', defaultValue: 36 },
      { name: 'Waist', unit: 'inch', defaultValue: 30 },
      { name: 'Hips', unit: 'inch', defaultValue: 39 },
      { name: 'Shoulder Width', unit: 'inch', defaultValue: 14.5 },
      { name: 'Kameez / Kurti Length', unit: 'inch', defaultValue: 42 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 17 },
      { name: 'Salwar / Pant Length', unit: 'inch', defaultValue: 38 },
      { name: 'Salwar Waist / Elastic', unit: 'inch', defaultValue: 30 },
    ],
    Lehenga: [
      { name: 'Blouse Bust', unit: 'inch', defaultValue: 36 },
      { name: 'Blouse Waist', unit: 'inch', defaultValue: 30 },
      { name: 'Blouse Length', unit: 'inch', defaultValue: 14.5 },
      { name: 'Lehenga Waist', unit: 'inch', defaultValue: 32 },
      { name: 'Lehenga Hip', unit: 'inch', defaultValue: 40 },
      { name: 'Lehenga Length / Height', unit: 'inch', defaultValue: 43 },
      { name: 'Flair Preference', unit: 'inch', defaultValue: 120 },
    ],
    Dress: [
      { name: 'Bust', unit: 'inch', defaultValue: 36 },
      { name: 'Waist', unit: 'inch', defaultValue: 29 },
      { name: 'Hips', unit: 'inch', defaultValue: 39 },
      { name: 'Shoulder to Waist', unit: 'inch', defaultValue: 15 },
      { name: 'Total Dress Length', unit: 'inch', defaultValue: 52 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 22 },
    ],
    Kurti: [
      { name: 'Bust', unit: 'inch', defaultValue: 36 },
      { name: 'Waist', unit: 'inch', defaultValue: 31 },
      { name: 'Hips', unit: 'inch', defaultValue: 40 },
      { name: 'Kurti Length', unit: 'inch', defaultValue: 40 },
      { name: 'Sleeve Length', unit: 'inch', defaultValue: 18 },
    ],
  },
}

export const getTemplates = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: GARMENT_TEMPLATES,
  })
})

export const getMeasurementProfiles = catchAsync(async (req, res, next) => {
  const profiles = await MeasurementProfile.find({ user: req.user._id }).sort({
    isDefault: -1,
    updatedAt: -1,
  })

  res.status(200).json({
    status: 'success',
    count: profiles.length,
    data: profiles,
  })
})

export const getMeasurementProfileById = catchAsync(async (req, res, next) => {
  const profile = await MeasurementProfile.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!profile) {
    return next(new AppError('Measurement profile not found', 404))
  }

  res.status(200).json({
    status: 'success',
    data: profile,
  })
})

export const createMeasurementProfile = catchAsync(async (req, res, next) => {
  const {
    profileName,
    gender,
    garmentCategory,
    measurements,
    height,
    weight,
    fitPreference,
    notes,
    isDefault,
  } = req.body

  if (!profileName || !garmentCategory) {
    return next(new AppError('Please provide a profile name and garment category', 400))
  }

  if (isDefault) {
    // Unset other defaults
    await MeasurementProfile.updateMany(
      { user: req.user._id },
      { isDefault: false },
    )
  }

  const newProfile = await MeasurementProfile.create({
    user: req.user._id,
    profileName,
    gender: gender || 'male',
    garmentCategory,
    measurements: measurements || [],
    height: height ? Number(height) : undefined,
    weight: weight ? Number(weight) : undefined,
    fitPreference: fitPreference || 'regular',
    notes: notes || '',
    isDefault: !!isDefault,
  })

  res.status(201).json({
    status: 'success',
    data: newProfile,
  })
})

export const updateMeasurementProfile = catchAsync(async (req, res, next) => {
  const {
    profileName,
    gender,
    garmentCategory,
    measurements,
    height,
    weight,
    fitPreference,
    notes,
    isDefault,
  } = req.body

  if (isDefault) {
    await MeasurementProfile.updateMany(
      { user: req.user._id, _id: { $ne: req.params.id } },
      { isDefault: false },
    )
  }

  const updated = await MeasurementProfile.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    {
      ...(profileName && { profileName }),
      ...(gender && { gender }),
      ...(garmentCategory && { garmentCategory }),
      ...(measurements && { measurements }),
      ...(height !== undefined && { height: Number(height) }),
      ...(weight !== undefined && { weight: Number(weight) }),
      ...(fitPreference && { fitPreference }),
      ...(notes !== undefined && { notes }),
      ...(isDefault !== undefined && { isDefault }),
    },
    { new: true, runValidators: true },
  )

  if (!updated) {
    return next(new AppError('Measurement profile not found', 404))
  }

  res.status(200).json({
    status: 'success',
    data: updated,
  })
})

export const deleteMeasurementProfile = catchAsync(async (req, res, next) => {
  const deleted = await MeasurementProfile.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!deleted) {
    return next(new AppError('Measurement profile not found', 404))
  }

  res.status(200).json({
    status: 'success',
    message: 'Measurement profile deleted successfully',
  })
})

export const duplicateMeasurementProfile = catchAsync(async (req, res, next) => {
  const existing = await MeasurementProfile.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!existing) {
    return next(new AppError('Measurement profile not found', 404))
  }

  const duplicate = await MeasurementProfile.create({
    user: req.user._id,
    profileName: `${existing.profileName} (Copy)`,
    gender: existing.gender,
    garmentCategory: existing.garmentCategory,
    measurements: existing.measurements,
    height: existing.height,
    weight: existing.weight,
    fitPreference: existing.fitPreference,
    notes: existing.notes,
    isDefault: false,
  })

  res.status(201).json({
    status: 'success',
    data: duplicate,
  })
})

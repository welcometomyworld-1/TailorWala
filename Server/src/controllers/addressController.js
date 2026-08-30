import Address from '../models/Address.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const getMyAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  })

  res.status(200).json({
    status: 'success',
    count: addresses.length,
    data: addresses,
  })
})

export const getAddressById = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!address) {
    return next(new AppError('Address not found', 404))
  }

  res.status(200).json({
    status: 'success',
    data: address,
  })
})

export const createAddress = catchAsync(async (req, res, next) => {
  const {
    fullName,
    phone,
    houseNumber,
    street,
    area,
    landmark,
    city,
    state,
    pincode,
    addressType,
    isDefault,
  } = req.body

  if (!fullName || !phone || !street || !city || !pincode) {
    return next(
      new AppError(
        'Please provide full recipient name, contact phone, street, city and pincode',
        400,
      ),
    )
  }

  // If user has no existing addresses, make this the default
  const count = await Address.countDocuments({ user: req.user._id })
  const shouldBeDefault = count === 0 ? true : !!isDefault

  const address = await Address.create({
    user: req.user._id,
    fullName: fullName.trim(),
    phone: phone.trim(),
    houseNumber: houseNumber ? houseNumber.trim() : '',
    street: street.trim(),
    area: area ? area.trim() : '',
    landmark: landmark ? landmark.trim() : '',
    city: city.trim(),
    state: state ? state.trim() : 'Delhi NCR',
    pincode: pincode.trim(),
    addressType: addressType || 'Home',
    isDefault: shouldBeDefault,
  })

  res.status(201).json({
    status: 'success',
    message: 'Address saved successfully',
    data: address,
  })
})

export const updateAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!address) {
    return next(new AppError('Address not found', 404))
  }

  const allowedUpdates = [
    'fullName',
    'phone',
    'houseNumber',
    'street',
    'area',
    'landmark',
    'city',
    'state',
    'pincode',
    'addressType',
    'isDefault',
  ]

  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      address[field] = req.body[field]
    }
  })

  await address.save()

  res.status(200).json({
    status: 'success',
    message: 'Address updated successfully',
    data: address,
  })
})

export const deleteAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!address) {
    return next(new AppError('Address not found', 404))
  }

  // If deleted address was default, set the latest remaining address as default
  if (address.isDefault) {
    const remaining = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 })
    if (remaining) {
      remaining.isDefault = true
      await remaining.save()
    }
  }

  res.status(200).json({
    status: 'success',
    message: 'Address deleted successfully',
  })
})

export const setDefaultAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id,
  })

  if (!address) {
    return next(new AppError('Address not found', 404))
  }

  address.isDefault = true
  await address.save()

  const addresses = await Address.find({ user: req.user._id }).sort({
    isDefault: -1,
    createdAt: -1,
  })

  res.status(200).json({
    status: 'success',
    message: 'Default delivery address updated',
    data: addresses,
  })
})

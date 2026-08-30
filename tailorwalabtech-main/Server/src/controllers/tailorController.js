import TailorProfile from '../models/TailorProfile.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const listTailors = catchAsync(async (req, res, next) => {
  const {
    search,
    q,
    specialization,
    city,
    area,
    pincode,
    category,
    minPrice,
    maxPrice,
    price,
    minRating,
    rating,
    homeVisit,
    sort,
    page = 1,
    limit = 12,
  } = req.query

  const query = { isApproved: true }

  // 1. Text Search (Matches tailor user name, shop name, services, fabrics, category, bio, city, area, pincode)
  const rawSearch = (search || q || specialization || '').trim()
  if (rawSearch) {
    const escaped = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const safeRegex = new RegExp(escaped, 'i')
    const words = rawSearch.split(/\s+/).filter(Boolean).map((w) => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))

    // Find user IDs whose real personal name or unique number matches
    const matchedUsers = await User.find({
      $or: [
        { name: safeRegex },
        { email: safeRegex },
        { uniqueNumber: safeRegex },
        { tailorId: safeRegex },
      ],
      role: 'tailor',
    }).select('_id')
    const matchedUserIds = matchedUsers.map((u) => u._id)

    query.$or = [
      { shopName: safeRegex },
      { bio: safeRegex },
      { specializations: { $in: [safeRegex, ...words] } },
      { 'servicesOffered.name': { $in: [safeRegex, ...words] } },
      { 'servicesOffered.description': safeRegex },
      { 'servicesOffered.category': safeRegex },
      { 'fabrics.name': { $in: [safeRegex, ...words] } },
      { 'fabrics.category': safeRegex },
      { 'fabrics.color': safeRegex },
      { 'fabrics.description': safeRegex },
      { city: safeRegex },
      { area: safeRegex },
      { pincode: safeRegex },
      ...(matchedUserIds.length > 0 ? [{ user: { $in: matchedUserIds } }] : []),
    ]
  }

  // 2. City Filter (Case-insensitive)
  if (city && city.trim() && city.trim().toLowerCase() !== 'all cities') {
    query.city = { $regex: new RegExp(`^${city.trim()}`, 'i') }
  }

  // 3. Area Filter
  if (area && area.trim()) {
    query.area = { $regex: new RegExp(area.trim(), 'i') }
  }

  // 4. Pincode Filter
  if (pincode && pincode.trim()) {
    query.pincode = pincode.trim()
  }

  // 5. Category Filter
  if (category && category.trim()) {
    const catRegex = new RegExp(category.trim(), 'i')
    query.$and = query.$and || []
    query.$and.push({
      $or: [
        { 'servicesOffered.category': catRegex },
        { specializations: { $in: [catRegex] } },
      ],
    })
  }

  // 6. Price Filtering
  const effectiveMinPrice = minPrice || (price && !maxPrice ? price : null)
  const effectiveMaxPrice = maxPrice

  if (effectiveMinPrice || effectiveMaxPrice) {
    query.basePrice = {}
    if (effectiveMinPrice) query.basePrice.$gte = Number(effectiveMinPrice)
    if (effectiveMaxPrice) query.basePrice.$lte = Number(effectiveMaxPrice)
  }

  // 7. Rating Filtering
  const targetRating = minRating || rating
  if (targetRating) {
    query.ratingAverage = { $gte: Number(targetRating) }
  }

  // 8. Home Visit Availability
  if (homeVisit === 'true' || homeVisit === true) {
    query.homeVisitAvailable = true
  }

  // 9. Sorting
  let sortOption = { ratingAverage: -1, completedOrdersCount: -1 }
  if (sort === 'rating') sortOption = { ratingAverage: -1, ratingCount: -1 }
  else if (sort === 'price_asc') sortOption = { basePrice: 1 }
  else if (sort === 'price_desc') sortOption = { basePrice: -1 }
  else if (sort === 'delivery_fast') sortOption = { deliveryDays: 1, ratingAverage: -1 }
  else if (sort === 'popular') sortOption = { completedOrdersCount: -1, ratingAverage: -1 }

  const pageNum = Math.max(1, parseInt(page, 10) || 1)
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12))
  const skip = (pageNum - 1) * limitNum

  const total = await TailorProfile.countDocuments(query)
  const tailors = await TailorProfile.find(query)
    .populate('user', 'name email phone avatar city pincode')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)

  res.status(200).json({
    status: 'success',
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    count: tailors.length,
    data: tailors,
  })
})

export const getTailorById = catchAsync(async (req, res, next) => {
  const { id } = req.params
  let profile = null

  if (!id || typeof id !== 'string') {
    return next(new AppError('Tailor profile ID required', 400))
  }

  const cleanId = id.trim()

  // 1. Try finding by MongoDB ObjectId if valid
  if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
    profile = await TailorProfile.findById(cleanId).populate(
      'user',
      'name email phone avatar city address pincode uniqueNumber tailorId',
    )
    if (!profile) {
      profile = await TailorProfile.findOne({ user: cleanId }).populate(
        'user',
        'name email phone avatar city address pincode uniqueNumber tailorId',
      )
    }
  }

  // 2. Try finding by User's tailorId / uniqueNumber / slug
  if (!profile) {
    const matchedUser = await User.findOne({
      $or: [
        { tailorId: cleanId },
        { uniqueNumber: cleanId },
        { email: cleanId.toLowerCase() },
      ],
      role: 'tailor',
    })

    if (matchedUser) {
      profile = await TailorProfile.findOne({ user: matchedUser._id }).populate(
        'user',
        'name email phone avatar city address pincode uniqueNumber tailorId',
      )
    }
  }

  // 3. Try finding by slug or city alias
  if (!profile) {
    profile = await TailorProfile.findOne({ slug: cleanId }).populate(
      'user',
      'name email phone avatar city address pincode uniqueNumber tailorId',
    )

    // Handle legacy test aliases (e.g. tlr-delhi-1, tlr-meerut-1)
    if (!profile) {
      const lowerId = cleanId.toLowerCase()
      if (lowerId.includes('meerut')) {
        profile = await TailorProfile.findOne({
          city: { $regex: /meerut/i },
          isApproved: true,
        }).populate('user', 'name email phone avatar city address pincode uniqueNumber tailorId')
      } else if (lowerId.includes('gzb') || lowerId.includes('ghaziabad')) {
        profile = await TailorProfile.findOne({
          city: { $regex: /ghaziabad/i },
          isApproved: true,
        }).populate('user', 'name email phone avatar city address pincode uniqueNumber tailorId')
      } else if (lowerId.includes('delhi')) {
        profile = await TailorProfile.findOne({
          city: { $regex: /delhi/i },
          isApproved: true,
        }).populate('user', 'name email phone avatar city address pincode uniqueNumber tailorId')
      }
    }
  }

  if (!profile) {
    return next(new AppError('Tailor profile not found', 404))
  }

  // Fetch verified reviews
  const reviews = await Review.find({ tailorProfile: profile._id, isApproved: true })
    .populate('customer', 'name avatar city')
    .sort({ createdAt: -1 })
    .limit(20)

  res.status(200).json({
    status: 'success',
    data: {
      ...profile.toObject(),
      reviews,
    },
  })
})

export const getMyProfile = catchAsync(async (req, res, next) => {
  let profile = await TailorProfile.findOne({ user: req.user._id }).populate(
    'user',
    'name email phone avatar city address pincode',
  )

  if (!profile) {
    profile = await TailorProfile.create({
      user: req.user._id,
      shopName: `${req.user.name}'s Bespoke Studio`,
      city: req.user.city || 'Delhi',
      address: req.user.address || '',
      pincode: req.user.pincode || '',
      specializations: ['Suits', 'Shirts', 'Traditional Wear'],
      basePrice: 499,
      servicesOffered: [
        { name: 'Custom Suit Stitching', category: 'Men', price: 1499, turnaroundDays: 7 },
        { name: 'Dress Shirt Stitching', category: 'Men', price: 499, turnaroundDays: 5 },
        { name: 'Designer Blouse', category: 'Women', price: 799, turnaroundDays: 5 },
      ],
      isApproved: true,
      isVerified: true,
    })
  }

  res.status(200).json({
    status: 'success',
    data: profile,
  })
})

export const createOrUpdateProfile = catchAsync(async (req, res, next) => {
  const {
    shopName,
    bio,
    experienceYears,
    specializations,
    basePrice,
    city,
    area,
    address,
    pincode,
    homeVisitAvailable,
    homeVisitFee,
    deliveryDays,
    servicesOffered,
    portfolio,
    fabrics,
    workConditions,
    workingHours,
    homeVisitRadiusKm,
    isAvailable,
    serviceArea,
    vacationMessage,
    photos,
  } = req.body

  const payload = {
    user: req.user._id,
    ...(shopName !== undefined && { shopName }),
    ...(bio !== undefined && { bio }),
    ...(experienceYears !== undefined && { experienceYears: Number(experienceYears) }),
    ...(specializations !== undefined && {
      specializations: Array.isArray(specializations)
        ? specializations
        : specializations.split(',').map((s) => s.trim()).filter(Boolean),
    }),
    ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
    ...(city !== undefined && { city }),
    ...(area !== undefined && { area }),
    ...(address !== undefined && { address }),
    ...(pincode !== undefined && { pincode }),
    ...(homeVisitAvailable !== undefined && { homeVisitAvailable }),
    ...(homeVisitFee !== undefined && { homeVisitFee: Number(homeVisitFee) }),
    ...(deliveryDays !== undefined && { deliveryDays: Number(deliveryDays) }),
    ...(servicesOffered !== undefined && { servicesOffered }),
    ...(portfolio !== undefined && { portfolio }),
    ...(fabrics !== undefined && { fabrics }),
    ...(workConditions !== undefined && { workConditions }),
    ...(workingHours !== undefined && { workingHours }),
    ...(homeVisitRadiusKm !== undefined && { homeVisitRadiusKm: Number(homeVisitRadiusKm) }),
    ...(isAvailable !== undefined && { isAvailable }),
    ...(serviceArea !== undefined && { serviceArea }),
    ...(vacationMessage !== undefined && { vacationMessage }),
    ...(photos !== undefined && { photos }),
  }

  const profile = await TailorProfile.findOneAndUpdate(
    { user: req.user._id },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true },
  ).populate('user', 'name email phone avatar city address pincode')

  res.status(200).json({
    status: 'success',
    data: profile,
  })
})

export const getEarnings = catchAsync(async (req, res, next) => {
  const COMMISSION_RATE = 0.15

  const deliveredBookings = await Booking.find({
    tailor: req.user._id,
    status: 'delivered',
    paymentStatus: 'paid',
  })
    .populate('customer', 'name email')
    .sort({ createdAt: -1 })

  const transactions = deliveredBookings.map((b) => {
    const fee = Math.round(b.price * COMMISSION_RATE * 100) / 100
    const net = Math.round((b.price - fee) * 100) / 100
    return {
      _id: b._id,
      orderNumber: b.orderNumber || `#TW-${b._id.toString().slice(-6)}`,
      date: b.updatedAt,
      customer: b.customer?.name || 'Customer',
      service: b.serviceType,
      amount: b.price,
      fee,
      netEarned: net,
    }
  })

  const totalEarnings = transactions.reduce((acc, t) => acc + t.netEarned, 0)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthTransactions = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const monthlyEarnings = thisMonthTransactions.reduce((acc, t) => acc + t.netEarned, 0)

  // In-progress pending payouts
  const pendingOrders = await Booking.find({
    tailor: req.user._id,
    status: {
      $in: [
        'accepted',
        'measurement_required',
        'fabric_selected',
        'in_progress',
        'stitching',
        'quality_check',
        'ready',
        'out_for_delivery',
      ],
    },
    paymentStatus: 'paid',
  })

  const pendingPayout = pendingOrders.reduce((acc, b) => {
    const fee = b.price * COMMISSION_RATE
    return acc + (b.price - fee)
  }, 0)

  // 7-day daily earnings distribution
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dayEarnings = transactions
      .filter((t) => new Date(t.date).toISOString().slice(0, 10) === dateStr)
      .reduce((sum, t) => sum + t.netEarned, 0)

    return { date: dateStr, day: dayName, amount: dayEarnings }
  })

  res.status(200).json({
    status: 'success',
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
    pendingPayout: Math.round(pendingPayout * 100) / 100,
    totalDeliveredCount: deliveredBookings.length,
    pendingOrdersCount: pendingOrders.length,
    weeklyData: last7Days,
    transactions,
  })
})

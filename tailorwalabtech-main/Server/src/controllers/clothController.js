import mongoose from 'mongoose'
import Cloth from '../models/Cloth.js'
import TailorProfile from '../models/TailorProfile.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const getCloths = catchAsync(async (req, res, next) => {
  const { category, search, q, city, color, minPrice, maxPrice } = req.query
  const rawSearch = (search || q || '').trim()

  // 1. Fetch platform catalog cloths
  const clothQuery = {}
  if (category && category.trim() && category.toLowerCase() !== 'all') {
    clothQuery.category = { $regex: new RegExp(`^${category.trim()}`, 'i') }
  }
  if (rawSearch) {
    clothQuery.$or = [
      { name: { $regex: rawSearch, $options: 'i' } },
      { description: { $regex: rawSearch, $options: 'i' } },
      { category: { $regex: rawSearch, $options: 'i' } },
      { color: { $regex: rawSearch, $options: 'i' } },
    ]
  }
  if (minPrice || maxPrice) {
    clothQuery.pricePerMeter = {}
    if (minPrice) clothQuery.pricePerMeter.$gte = Number(minPrice)
    if (maxPrice) clothQuery.pricePerMeter.$lte = Number(maxPrice)
  }

  const platformCloths = await Cloth.find(clothQuery).sort({ rating: -1, createdAt: -1 })

  // 2. Fetch approved tailor profiles with fabrics
  const tailorQuery = { isApproved: true }
  if (city && city.trim() && city.toLowerCase() !== 'all cities') {
    tailorQuery.city = { $regex: new RegExp(`^${city.trim()}`, 'i') }
  }

  const tailorProfiles = await TailorProfile.find(tailorQuery).populate(
    'user',
    'name email phone avatar city',
  )

  // Collect tailor studio fabrics
  const tailorFabrics = []
  tailorProfiles.forEach((tp) => {
    if (tp.fabrics && Array.isArray(tp.fabrics)) {
      tp.fabrics.forEach((fab) => {
        if (fab.isVisible === false) return

        // Apply category filter if requested
        if (category && category.trim() && category.toLowerCase() !== 'all') {
          if (!fab.category || !fab.category.toLowerCase().includes(category.trim().toLowerCase())) {
            return
          }
        }

        // Apply price filter
        if (minPrice && fab.pricePerMeter < Number(minPrice)) return
        if (maxPrice && fab.pricePerMeter > Number(maxPrice)) return

        // Apply text search
        if (rawSearch) {
          const match =
            (fab.name && fab.name.toLowerCase().includes(rawSearch.toLowerCase())) ||
            (fab.description && fab.description.toLowerCase().includes(rawSearch.toLowerCase())) ||
            (fab.category && fab.category.toLowerCase().includes(rawSearch.toLowerCase())) ||
            (fab.color && fab.color.toLowerCase().includes(rawSearch.toLowerCase())) ||
            (tp.shopName && tp.shopName.toLowerCase().includes(rawSearch.toLowerCase())) ||
            (tp.city && tp.city.toLowerCase().includes(rawSearch.toLowerCase()))

          if (!match) return
        }

        tailorFabrics.push({
          _id: fab._id,
          name: fab.name,
          category: fab.category || 'Cotton',
          color: fab.color || '',
          pattern: fab.pattern || 'Plain',
          pricePerMeter: fab.pricePerMeter,
          quantityMeters: fab.quantityMeters,
          description: fab.description,
          image: fab.image || 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
          badge: fab.badge || 'Studio Exclusive',
          suitableFor: fab.suitableFor || ['Shirt', 'Suit', 'Kurta'],
          isAvailable: fab.isAvailable !== false,
          tailorId: tp._id,
          tailorName: tp.shopName || tp.user?.name || 'Master Artisan',
          tailorCity: tp.city || tp.user?.city || 'Delhi NCR',
          tailorAvatar: tp.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
          tailorPhone: tp.user?.phone || '+91 8789682127',
        })
      })
    }
  })

  // Format platform cloths with default tailor info
  const formattedPlatformCloths = platformCloths.map((c) => ({
    _id: c._id,
    name: c.name,
    category: c.category,
    color: c.color,
    pattern: 'Premium Weave',
    pricePerMeter: c.pricePerMeter,
    quantityMeters: c.stock || 50,
    description: c.description,
    image: c.image,
    badge: c.isFeatured ? 'Curated Masterpiece' : 'Certified Pure',
    suitableFor: ['Bespoke Suit', 'Dress Shirt', 'Ethnic Kurta', 'Blouse'],
    isAvailable: (c.stock || 0) > 0,
    rating: c.rating || 4.9,
    tailorId: tailorProfiles[0]?._id || null,
    tailorName: tailorProfiles[0]?.shopName || 'TailorWala Central Studio',
    tailorCity: tailorProfiles[0]?.city || 'Delhi NCR',
    tailorAvatar: tailorProfiles[0]?.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    tailorPhone: '+91 8789682127',
  }))

  const allFabrics = [...tailorFabrics, ...formattedPlatformCloths]

  res.status(200).json({
    status: 'success',
    total: allFabrics.length,
    count: allFabrics.length,
    data: allFabrics,
  })
})

export const getClothById = catchAsync(async (req, res, next) => {
  const { id } = req.params

  // Validate ObjectId
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    // 1. Try finding in Cloth model
    const cloth = await Cloth.findById(id)
    if (cloth) {
      return res.status(200).json({
        status: 'success',
        data: cloth,
      })
    }

    // 2. Try finding in TailorProfile fabrics
    const tp = await TailorProfile.findOne({ 'fabrics._id': id }).populate('user', 'name phone avatar city')
    if (tp) {
      const fab = tp.fabrics.id(id)
      if (fab) {
        return res.status(200).json({
          status: 'success',
          data: {
            ...fab.toObject(),
            tailorId: tp._id,
            tailorName: tp.shopName || tp.user?.name,
            tailorCity: tp.city || tp.user?.city,
            tailorPhone: tp.user?.phone,
            tailorAvatar: tp.user?.avatar,
          },
        })
      }
    }
  }

  return next(new AppError('Fabric / Cloth material not found', 404))
})

export const createCloth = catchAsync(async (req, res, next) => {
  const { name, description, pricePerMeter, category, image, stock, material, color } = req.body

  if (!name || !pricePerMeter || !image) {
    return next(new AppError('Please provide fabric name, pricePerMeter, and image URL', 400))
  }

  const cloth = await Cloth.create({
    name,
    description: description || '',
    pricePerMeter: Number(pricePerMeter),
    category: category || 'Fabric',
    image,
    stock: stock !== undefined ? Number(stock) : 50,
    material: material || '',
    color: color || '',
  })

  res.status(201).json({
    status: 'success',
    data: cloth,
  })
})

export const seedCloths = catchAsync(async (req, res, next) => {
  const dummyCloths = [
    {
      name: 'Egyptian Giza Cotton',
      description: 'Ultra-soft, breathable long-staple cotton with a silky sheen. Perfect for bespoke business dress shirts and kurtas.',
      pricePerMeter: 850,
      category: 'Cotton',
      material: '100% Egyptian Cotton',
      color: 'Crisp White',
      image: 'https://images.unsplash.com/photo-1524385175510-72e2cf5e1e48?auto=format&fit=crop&q=80&w=800',
      stock: 60,
      rating: 4.9,
      numReviews: 24,
      isFeatured: true,
    },
    {
      name: 'Pure Banarasi Mulberry Silk',
      description: 'Handcrafted mulberry silk with subtle golden zari borders. Ideal for royal sherwanis, festive kurtas, and wedding blouses.',
      pricePerMeter: 3200,
      category: 'Silk',
      material: 'Pure Silk',
      color: 'Royal Maroon & Gold',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800',
      stock: 30,
      rating: 5.0,
      numReviews: 38,
      isFeatured: true,
    },
    {
      name: 'Italian Super 120s Cashmere Wool',
      description: 'Exceptionally fine wool woven with cashmere for tailored bespoke suits and blazers.',
      pricePerMeter: 4500,
      category: 'Wool',
      material: 'Wool & Cashmere Blend',
      color: 'Charcoal Navy',
      image: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f68e?auto=format&fit=crop&q=80&w=800',
      stock: 20,
      rating: 4.9,
      numReviews: 19,
      isFeatured: true,
    },
    {
      name: 'Belgian Washed Pure Linen',
      description: 'Sustainable, breathable linen with a relaxed drape and natural texture for summer shirts and trousers.',
      pricePerMeter: 1200,
      category: 'Linen',
      material: '100% Natural Linen',
      color: 'Sandy Beige',
      image: 'https://images.unsplash.com/photo-1594932224828-b4b059b6f68e?auto=format&fit=crop&q=80&w=800',
      stock: 45,
      rating: 4.8,
      numReviews: 15,
      isFeatured: true,
    },
    {
      name: 'French Embroidered Chantilly Lace',
      description: 'Delicate floral lace with eyelash scalloped borders. Perfect for designer blouse sleeves and lehenga dupattas.',
      pricePerMeter: 2800,
      category: 'Women',
      material: 'Nylon Silk Blend',
      color: 'Rose Quartz',
      image: 'https://images.unsplash.com/photo-1524385175510-72e2cf5e1e48?auto=format&fit=crop&q=80&w=800',
      stock: 25,
      rating: 4.9,
      numReviews: 29,
      isFeatured: true,
    },
  ]

  await Cloth.deleteMany()
  const created = await Cloth.insertMany(dummyCloths)

  res.status(200).json({
    status: 'success',
    message: 'Cloths seeded successfully',
    count: created.length,
    data: created,
  })
})

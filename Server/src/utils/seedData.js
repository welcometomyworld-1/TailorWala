import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from '../models/User.js'
import TailorProfile from '../models/TailorProfile.js'
import Cloth from '../models/Cloth.js'
import Booking from '../models/Booking.js'
import MeasurementProfile from '../models/MeasurementProfile.js'
import Review from '../models/Review.js'
import Coupon from '../models/Coupon.js'
import Address from '../models/Address.js'
import Payment from '../models/Payment.js'
import AdminSettings from '../models/AdminSettings.js'
import connectDB, { disconnectDB } from '../config/db.js'

dotenv.config()

export const seedDatabase = async () => {
  try {
    console.log('🌱 Starting comprehensive database seed for TailorWala...')
    if (mongoose.connection.readyState !== 1) {
      await connectDB()
    }

    // Clear existing collections safely
    await User.deleteMany()
    await TailorProfile.deleteMany()
    await Cloth.deleteMany()
    await Booking.deleteMany()
    await MeasurementProfile.deleteMany()
    await Review.deleteMany()
    await Coupon.deleteMany()
    await Address.deleteMany()
    await Payment.deleteMany()
    await AdminSettings.deleteMany()

    const salt = await bcrypt.genSalt(10)
    const adminPassword = await bcrypt.hash('admin123', salt)
    const tailorPassword = await bcrypt.hash('tailor123', salt)
    const customerPassword = await bcrypt.hash('customer123', salt)
    const employeePassword = await bcrypt.hash('employee123', salt)

    // 1. Create Super Admin
    const admin = await User.create({
      name: 'TailorWala Super Admin',
      email: 'admin@tailorwala.com',
      passwordHash: adminPassword,
      role: 'super_admin',
      phone: '+91 8789682127',
      city: 'Delhi',
      address: 'TailorWala Headquarters, Connaught Place',
      pincode: '110001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    })

    // 1b. Create Sample Employee Account
    const employee = await User.create({
      name: 'Vikas Malhotra',
      email: 'employee@tailorwala.com',
      employeeId: 'TW-EMP-0001',
      employeeDesignation: 'Senior Operations Executive',
      department: 'Order Fulfillment',
      passwordHash: employeePassword,
      role: 'employee',
      permissions: ['dashboard', 'orders', 'tailors', 'services', 'payments', 'reviews', 'coupons', 'activity_logs'],
      isTempPassword: false,
      mustChangePassword: false,
      phone: '+91 9876540001',
      city: 'Delhi',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    })

    // 1c. Create Business Receiving Payment Account
    const PaymentAccount = (await import('../models/PaymentAccount.js')).default
    await PaymentAccount.deleteMany()
    await PaymentAccount.create({
      businessName: 'TailorWala Bespoke Services',
      accountHolderName: 'TailorWala Enterprise Pvt Ltd',
      bankName: 'HDFC Bank',
      accountNumber: '50200084729184',
      ifscCode: 'HDFC0001234',
      upiId: 'tailorwala@icici',
      businessPhone: '+91 8789682127',
      businessEmail: 'billing@tailorwala.com',
      isActive: true,
      isDefault: true,
    })

    // 2. Initialize Platform System Settings with Delivery Zones
    await AdminSettings.create({
      codEnabled: true,
      upiEnabled: true,
      cardEnabled: true,
      qrEnabled: true,
      deliveryCharge: 49,
      expressDeliveryCharge: 149,
      standardDeliveryDays: 7,
      expressDeliveryDays: 3,
      servicedPincodes: ['110001', '110006', '110016', '201001', '201002', '250001', '250002'],
      deliveryZones: [
        { name: 'Delhi Central & South', pincodes: ['110001', '110006', '110016'], normalCharge: 49, expressCharge: 129, estimatedDays: 5, expressDays: 2 },
        { name: 'Meerut Metro Area', pincodes: ['250001', '250002', '250004'], normalCharge: 39, expressCharge: 99, estimatedDays: 4, expressDays: 2 },
        { name: 'Ghaziabad & Noida Hub', pincodes: ['201001', '201002', '201301'], normalCharge: 49, expressCharge: 139, estimatedDays: 5, expressDays: 2 },
      ],
      codCharge: 0,
      homeVisitFee: 99,
      minOrderAmount: 199,
      maxCodAmount: 10000,
      taxRatePercent: 0,
      platformCommissionPercent: 15,
      updatedBy: admin._id,
    })

    // 3. Create 15+ Master Tailors Across Delhi NCR, Meerut, Ghaziabad and Major Hubs
    const tailorData = [
      {
        name: 'Master Ustad Rafiq',
        email: 'tailor@tailorwala.com',
        phone: '+91 9811223344',
        city: 'Delhi',
        area: 'Chandni Chowk',
        address: 'Shop 14, Main Cloth Market, Chandni Chowk',
        pincode: '110006',
        shopName: 'Rafiq Master Bespoke & Sherwanis',
        bio: '4th-generation master craftsman specializing in bespoke 3-piece suits, royal wedding sherwanis, and handcrafted bandhgalas.',
        experienceYears: 24,
        basePrice: 599,
        ratingAverage: 4.9,
        ratingCount: 142,
        specializations: ['Bespoke Suits', 'Wedding Sherwani', 'Bandhgala', 'Tuxedos'],
        servicesOffered: [
          { name: 'Full 3-Piece Bespoke Suit', category: 'Men', price: 2999, turnaroundDays: 7, description: 'Hand-canvassed suit with customized lapels and personalized monogramming.' },
          { name: 'Royal Wedding Sherwani', category: 'Wedding', price: 4499, turnaroundDays: 10, description: 'Heavy zardozi embroidery with custom safa and stole.' },
          { name: 'Custom Italian Cut Blazer', category: 'Men', price: 1899, turnaroundDays: 6, description: 'Unstructured modern Italian blazer with horn buttons.' },
          { name: 'Designer Kurta Pajama', category: 'Men', price: 799, turnaroundDays: 4, description: 'Comfort-fit pure cotton or silk kurta with contrast piping.' },
        ],
        portfolio: [
          { title: 'Royal Navy Velvet Bandhgala', category: 'Wedding', imageUrl: '/images/port-sherwani.svg' },
          { title: 'Charcoal Italian Suit', category: 'Men', imageUrl: '/images/port-suit.svg' },
        ],
      },
      {
        name: 'Fatima Sultana',
        email: 'fatima.tailors@tailorwala.com',
        phone: '+91 9822334455',
        city: 'Delhi',
        area: 'Hauz Khas',
        address: 'Hauz Khas Village, Near Deer Park',
        pincode: '110016',
        shopName: 'Fatima Couture & Bridal Studio',
        bio: 'Specialist in haute couture lehengas, celebrity designer blouses, Anarkali suits, and Western formal evening gowns.',
        experienceYears: 16,
        basePrice: 699,
        ratingAverage: 4.9,
        ratingCount: 98,
        specializations: ['Bridal Lehengas', 'Designer Blouses', 'Anarkali Suits', 'Gowns'],
        servicesOffered: [
          { name: 'Bridal Heavy Lehenga Stitching', category: 'Wedding', price: 4999, turnaroundDays: 12, description: 'Double can-can, latkan styling, custom padding and blouse fitting.' },
          { name: 'Padded Designer Saree Blouse', category: 'Women', price: 999, turnaroundDays: 4, description: 'Princess cut, deep back, boat neck or custom neckline styling.' },
          { name: 'Floor-Length Anarkali Suit', category: 'Women', price: 1799, turnaroundDays: 7, description: 'Heavy flare with churidar and designer dupatta finishing.' },
        ],
        portfolio: [
          { title: 'Crimson Red Bridal Lehenga', category: 'Wedding', imageUrl: '/images/port-lehenga.svg' },
          { title: 'Rose Gold Sequin Blouse', category: 'Women', imageUrl: '/images/port-blazer.svg' },
        ],
      },
      {
        name: 'Gurpreet Singh',
        email: 'gurpreet.delhi@tailorwala.com',
        phone: '+91 9811998877',
        city: 'Delhi',
        area: 'Karol Bagh & Connaught Place',
        address: 'Pusa Road, Karol Bagh',
        pincode: '110005',
        shopName: 'Royal Heritage Master Tailors Delhi',
        bio: 'Premier bespoke tailoring for corporate CEOs, groom wedding tuxedos, blazer suits, and silk achkans with precision measurement visits.',
        experienceYears: 22,
        basePrice: 649,
        ratingAverage: 4.9,
        ratingCount: 124,
        specializations: ['Bespoke Suits', 'Tuxedos', 'Safari Suits', 'Wedding Achkan'],
        servicesOffered: [
          { name: 'Executive Business 2-Piece Suit', category: 'Men', price: 2799, turnaroundDays: 6, description: 'Fine wool blend with hand-stitched pick lapels.' },
          { name: 'Luxury Dinner Tuxedo', category: 'Men', price: 3499, turnaroundDays: 7, description: 'Satin shawl collar with bow tie matching fabric.' },
          { name: 'Classic Silk Bandhgala', category: 'Wedding', price: 2199, turnaroundDays: 5, description: 'Royal Indian formal evening jacket.' },
        ],
        portfolio: [
          { title: 'Classic Tuxedo Suit', category: 'Men', imageUrl: '/images/port-suit.svg' },
        ],
      },
      {
        name: 'Sunita Kapoor',
        email: 'sunita.lajpat@tailorwala.com',
        phone: '+91 9811445566',
        city: 'Delhi',
        area: 'Lajpat Nagar Central Market',
        address: 'Block K, Lajpat Nagar II',
        pincode: '110024',
        shopName: 'Sunita Boutique & Designer Studio',
        bio: 'Celebrity blouse designer, mirror work Anarkalis, sharara sets, and instant doorstep alteration services.',
        experienceYears: 15,
        basePrice: 449,
        ratingAverage: 4.8,
        ratingCount: 112,
        specializations: ['Designer Blouses', 'Sharara Sets', 'Salwar Suits', 'Kurtis'],
        servicesOffered: [
          { name: 'Designer Saree Blouse with Tassels', category: 'Women', price: 899, turnaroundDays: 3, description: 'Custom back cut with handcrafted latkans.' },
          { name: 'Partywear Sharara Suit Set', category: 'Women', price: 1599, turnaroundDays: 6, description: 'Flared tiered sharara with kurti and dupatta.' },
        ],
        portfolio: [
          { title: 'Golden Mirror Work Blouse', category: 'Women', imageUrl: '/images/port-blazer.svg' },
        ],
      },
      {
        name: 'Rameshwar Sharma',
        email: 'rameshwar@tailorwala.com',
        phone: '+91 9833445566',
        city: 'Meerut',
        area: 'Sadar Bazaar',
        address: 'Abu Lane, Sadar Bazaar',
        pincode: '250001',
        shopName: 'Rameshwar Sons Master Tailors Meerut',
        bio: 'Trusted heritage tailor for premium formal shirts, trousers, safari suits, and quick door-to-door alteration services.',
        experienceYears: 19,
        basePrice: 349,
        ratingAverage: 4.8,
        ratingCount: 86,
        specializations: ['Formal Shirts', 'Trousers', 'Safari Suits', 'Express Alterations'],
        servicesOffered: [
          { name: 'Formal Dress Shirt', category: 'Men', price: 449, turnaroundDays: 3, description: 'Fused collar, French cuffs, and personalized fit.' },
          { name: 'Tailored Formal Trousers', category: 'Men', price: 499, turnaroundDays: 4, description: 'Pleated or flat front with custom waist adjusters.' },
          { name: 'Express Alteration & Tapering', category: 'Alteration', price: 199, turnaroundDays: 2, description: 'Sleeve shortening, waist alteration, length hem.' },
        ],
        portfolio: [
          { title: 'Classic White Egyptian Cotton Shirt', category: 'Men', imageUrl: '/images/mat-cotton.svg' },
        ],
      },
      {
        name: 'Mohammad Zafar',
        email: 'zafar.meerut@tailorwala.com',
        phone: '+91 9833778899',
        city: 'Meerut',
        area: 'Begum Bridge',
        address: 'Begum Bridge Road, Near City Plaza',
        pincode: '250002',
        shopName: 'Zafar Bespoke & Traditional Sherwani House',
        bio: 'Renowned Meerut craftsman for groom sherwanis, nawabi kurta pajamas, pathani suits, and coat-pant stitching.',
        experienceYears: 21,
        basePrice: 499,
        ratingAverage: 4.9,
        ratingCount: 94,
        specializations: ['Wedding Sherwani', 'Pathani Suits', 'Coat Pant', 'Kurta Pajama'],
        servicesOffered: [
          { name: 'Wedding Groom Sherwani', category: 'Wedding', price: 3999, turnaroundDays: 8, description: 'Hand embroidered with inner lining and matching dupatta.' },
          { name: 'Designer Pathani Suit', category: 'Men', price: 899, turnaroundDays: 4, description: 'Classic collar with shoulder flaps and patch pockets.' },
        ],
        portfolio: [
          { title: 'Royal Maroon Wedding Sherwani', category: 'Wedding', imageUrl: '/images/port-sherwani.svg' },
        ],
      },
      {
        name: 'Rekha Tyagi',
        email: 'rekha.meerut@tailorwala.com',
        phone: '+91 9833112233',
        city: 'Meerut',
        area: 'Shastri Nagar',
        address: 'Sector 3, Shastri Nagar',
        pincode: '250004',
        shopName: 'Shree Radha Rani Designer Boutique Meerut',
        bio: 'Boutique specialist in bridal lehengas, Anarkali suits, velvet blouses, and festive family matching outfits.',
        experienceYears: 13,
        basePrice: 399,
        ratingAverage: 4.8,
        ratingCount: 72,
        specializations: ['Bridal Lehengas', 'Designer Blouses', 'Salwar Suits', 'Gowns'],
        servicesOffered: [
          { name: 'Festive Lehenga Choli Stitching', category: 'Wedding', price: 2799, turnaroundDays: 7, description: 'Heavy cancan and border work.' },
          { name: 'Padded Boat Neck Blouse', category: 'Women', price: 699, turnaroundDays: 3, description: 'Custom neckline with back tie-ups.' },
        ],
        portfolio: [
          { title: 'Embroidered Pink Lehenga', category: 'Wedding', imageUrl: '/images/port-lehenga.svg' },
        ],
      },
      {
        name: 'Kavita Verma',
        email: 'kavita.creations@tailorwala.com',
        phone: '+91 9844556677',
        city: 'Ghaziabad',
        area: 'Raj Nagar',
        address: 'RDC Raj Nagar, Sector 15',
        pincode: '201002',
        shopName: 'Kavita Designer Boutique Ghaziabad',
        bio: 'Contemporary ethnic designer crafting stylish daily wear kurtis, palazzo sets, party wear suits, and kids festive wear.',
        experienceYears: 12,
        basePrice: 399,
        ratingAverage: 4.7,
        ratingCount: 64,
        specializations: ['Daily Wear Kurtis', 'Palazzo Sets', 'Partywear', 'Kids Wear'],
        servicesOffered: [
          { name: 'Straight Kurti & Palazzo Set', category: 'Women', price: 799, turnaroundDays: 5, description: 'Comfortable cotton or rayon stitching with pocket addition.' },
          { name: 'Kids Ethnic Kurta / Dhoti Set', category: 'Kids', price: 599, turnaroundDays: 4, description: 'Gentle lining and soft borders for child comfort.' },
        ],
        portfolio: [
          { title: 'Indigo Block Print Kurti Set', category: 'Women', imageUrl: '/images/mat-linen.svg' },
        ],
      },
      {
        name: 'Alok Pandey Master Tailor',
        email: 'alok.ghaziabad@tailorwala.com',
        phone: '+91 9844889900',
        city: 'Ghaziabad',
        area: 'Turab Nagar & Ambedkar Road',
        address: 'Main Market, Turab Nagar',
        pincode: '201001',
        shopName: 'Alok Men’s Bespoke Studio Ghaziabad',
        bio: 'Master tailor in Ghaziabad for formal suits, office trousers, custom blazers, and doorstep measurements.',
        experienceYears: 17,
        basePrice: 449,
        ratingAverage: 4.8,
        ratingCount: 88,
        specializations: ['Formal Suits', 'Office Trousers', 'Blazers', 'Custom Shirts'],
        servicesOffered: [
          { name: 'Formal 2-Piece Suit', category: 'Men', price: 2399, turnaroundDays: 6, description: 'Structured jacket with matching straight fit trousers.' },
          { name: 'Tailored Formal Shirt', category: 'Men', price: 429, turnaroundDays: 3, description: 'Premium cotton fabric bespoke cut.' },
        ],
        portfolio: [
          { title: 'Navy Blue Corporate Suit', category: 'Men', imageUrl: '/images/port-suit.svg' },
        ],
      },
      {
        name: 'Meenakshi Gupta',
        email: 'meenakshi.indirapuram@tailorwala.com',
        phone: '+91 9844223344',
        city: 'Ghaziabad',
        area: 'Indirapuram & Vaishali',
        address: 'Vaibhav Khand, Indirapuram',
        pincode: '201014',
        shopName: 'Meenakshi Bridal Couture & Tailors',
        bio: 'Specialist in bridal trousseau, cocktail gowns, padded designer blouses, and Pakistani suits in Indirapuram & Noida.',
        experienceYears: 14,
        basePrice: 549,
        ratingAverage: 4.9,
        ratingCount: 96,
        specializations: ['Bridal Trousseau', 'Cocktail Gowns', 'Padded Blouses', 'Pakistani Suits'],
        servicesOffered: [
          { name: 'Pakistani Long Cut Suit', category: 'Women', price: 1499, turnaroundDays: 5, description: 'Intricate lace detailing and organza dupatta hem.' },
          { name: 'Designer Saree Blouse', category: 'Women', price: 849, turnaroundDays: 3, description: 'Deep V-neck with pearl beadings.' },
        ],
        portfolio: [
          { title: 'Emerald Green Velvet Blouse', category: 'Women', imageUrl: '/images/port-blazer.svg' },
        ],
      },
      {
        name: 'Arjun Master Tailor',
        email: 'arjun.mumbai@tailorwala.com',
        phone: '+91 9855667788',
        city: 'Mumbai',
        area: 'Bandra West',
        address: 'Hill Road, Near Bandra Station',
        pincode: '400050',
        shopName: 'Arjun Bespoke Studio Mumbai',
        bio: 'Celebrity stylist and bespoke tailor crafting red-carpet tuxedos, Italian linen suits, and modern trench coats.',
        experienceYears: 15,
        basePrice: 799,
        ratingAverage: 4.9,
        ratingCount: 110,
        specializations: ['Tuxedos', 'Italian Linen Suits', 'Blazers', 'Formal Trousers'],
        servicesOffered: [
          { name: 'Satin Lapel Tuxedo', category: 'Men', price: 3499, turnaroundDays: 7, description: 'Single-button dinner jacket with grosgrain silk lapels.' },
          { name: 'Summer Linen 2-Piece Suit', category: 'Men', price: 2499, turnaroundDays: 5, description: 'Lightweight unlined Belgian linen construction.' },
        ],
        portfolio: [
          { title: 'Midnight Blue Tuxedo', category: 'Men', imageUrl: '/images/port-suit.svg' },
        ],
      },
      {
        name: 'Lakshmi Narayana',
        email: 'lakshmi.blr@tailorwala.com',
        phone: '+91 9866778899',
        city: 'Bengaluru',
        area: 'Indiranagar',
        address: '100 Feet Road, Indiranagar',
        pincode: '560038',
        shopName: 'Silk Route Couture & Blouses',
        bio: 'Silk saree blouse specialist with temple zardozi embroidery, boat neck cuts, and traditional South Indian silk tailoring.',
        experienceYears: 18,
        basePrice: 549,
        ratingAverage: 4.9,
        ratingCount: 92,
        specializations: ['Kanjivaram Blouses', 'Silk Kurtas', 'Pattu Pavadai', 'Embroidery'],
        servicesOffered: [
          { name: 'Kanjivaram Bridal Maggam Blouse', category: 'Wedding', price: 2199, turnaroundDays: 6, description: 'Handcrafted zari and stone embroidery work.' },
          { name: 'Pure Silk Dhoti & Kurta Set', category: 'Men', price: 1199, turnaroundDays: 4, description: 'Traditional angavastram tailored fit.' },
        ],
        portfolio: [
          { title: 'Temple Gold Maggam Work Blouse', category: 'Wedding', imageUrl: '/images/mat-silk.svg' },
        ],
      },
      {
        name: 'Nawab Irfan Ali',
        email: 'irfan.lucknow@tailorwala.com',
        phone: '+91 9877889900',
        city: 'Lucknow',
        area: 'Hazratganj',
        address: 'Janpath Market, Hazratganj',
        pincode: '226001',
        shopName: 'Awadh Chikankari & Royal Tailors',
        bio: 'Preserving the heritage of royal Awadhi Chikankari kurtas, angrakhas, achkans, and pathani suits.',
        experienceYears: 28,
        basePrice: 449,
        ratingAverage: 4.8,
        ratingCount: 78,
        specializations: ['Chikankari Kurtas', 'Angrakha', 'Achkan', 'Pathani Suit'],
        servicesOffered: [
          { name: 'Hand-Embroidered Chikan Kurta', category: 'Men', price: 999, turnaroundDays: 5, description: 'Finest mulmul cotton with shadow work embroidery.' },
          { name: 'Royal Nawabi Achkan', category: 'Wedding', price: 3499, turnaroundDays: 9, description: 'Structured achkan with antique metal buttons.' },
        ],
        portfolio: [
          { title: 'White Mulmul Chikan Kurta', category: 'Men', imageUrl: '/images/port-kurta.svg' },
        ],
      },
      {
        name: 'Pooja Rawat',
        email: 'pooja.jaipur@tailorwala.com',
        phone: '+91 9888990011',
        city: 'Jaipur',
        area: 'MI Road',
        address: 'Jayanti Market, MI Road',
        pincode: '302001',
        shopName: 'Rajputana Heritage Boutique',
        bio: 'Master in authentic Rajasthani poshak, Gota Patti work, bandhani kurtis, and royal bridal ensembles.',
        experienceYears: 14,
        basePrice: 499,
        ratingAverage: 4.8,
        ratingCount: 70,
        specializations: ['Rajasthani Poshak', 'Gota Patti Suits', 'Bandhani Kurtis', 'Lehengas'],
        servicesOffered: [
          { name: 'Traditional Rajputi Poshak', category: 'Wedding', price: 2999, turnaroundDays: 8, description: 'Complete kanchali, kurti, lehenga and odhana.' },
          { name: 'Gota Patti Salwar Suit', category: 'Women', price: 1299, turnaroundDays: 5, description: 'Rich border detailing on pure georgette.' },
        ],
        portfolio: [
          { title: 'Royal Pink Rajputi Poshak', category: 'Wedding', imageUrl: '/images/port-lehenga.svg' },
        ],
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.pune@tailorwala.com',
        phone: '+91 9899001122',
        city: 'Pune',
        area: 'FC Road',
        address: 'Fergusson College Road, Shivajinagar',
        pincode: '411004',
        shopName: 'Joshi Masters Bespoke Studio',
        bio: 'Specializing in corporate attire, safari suits, blazers, and custom shirts for professionals.',
        experienceYears: 20,
        basePrice: 399,
        ratingAverage: 4.7,
        ratingCount: 82,
        specializations: ['Formal Shirts', 'Corporate Suits', 'Safari Suits', 'Trouser Fitting'],
        servicesOffered: [
          { name: 'Executive Business Shirt', category: 'Men', price: 449, turnaroundDays: 3, description: 'Cutaway collar with fused cuffs.' },
          { name: '2-Piece Executive Suit', category: 'Men', price: 2199, turnaroundDays: 6, description: 'Poly-viscose or wool blend tailoring.' },
        ],
        portfolio: [
          { title: 'Navy Blue Formal Blazer', category: 'Men', imageUrl: '/images/port-blazer.svg' },
        ],
      },
      {
        name: 'Ananya Mukherjee',
        email: 'ananya.kolkata@tailorwala.com',
        phone: '+91 9900112233',
        city: 'Kolkata',
        area: 'Gariahat',
        address: 'Gariahat Market, South Kolkata',
        pincode: '700019',
        shopName: 'Shree Boutique & Bengali Couture',
        bio: 'Famous for designer Kantha stitch blouses, Bengali dhuti-panjabi sets, and silk cotton kurtis.',
        experienceYears: 17,
        basePrice: 429,
        ratingAverage: 4.9,
        ratingCount: 88,
        specializations: ['Kantha Stitch Blouse', 'Dhuti Panjabi', 'Silk Kurtis', 'Tant Saree Fitting'],
        servicesOffered: [
          { name: 'Handmade Kantha Work Blouse', category: 'Women', price: 899, turnaroundDays: 5, description: 'Pure silk base with handcrafted motifs.' },
          { name: 'Bengali Dhuti Panjabi Set', category: 'Men', price: 1099, turnaroundDays: 4, description: 'Traditional festive tailoring.' },
        ],
        portfolio: [
          { title: 'Kantha Stitch Blouse', category: 'Women', imageUrl: '/images/port-kurta.svg' },
        ],
      },
    ]

    const tailorAvatarList = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
    ]

    const createdTailors = []

    for (let i = 0; i < tailorData.length; i++) {
      const t = tailorData[i]
      const u = await User.create({
        name: t.name,
        email: t.email,
        passwordHash: tailorPassword,
        role: 'tailor',
        phone: t.phone,
        city: t.city,
        address: t.address,
        pincode: t.pincode,
        avatar: tailorAvatarList[i % tailorAvatarList.length],
      })

      const profile = await TailorProfile.create({
        user: u._id,
        shopName: t.shopName,
        bio: t.bio,
        experienceYears: t.experienceYears,
        basePrice: t.basePrice,
        ratingAverage: t.ratingAverage,
        ratingCount: t.ratingCount,
        specializations: t.specializations,
        servicesOffered: t.servicesOffered,
        portfolio: [
          { title: 'Royal Silk Sherwani', category: 'Wedding', imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800' },
          { title: 'Bespoke Italian Suit', category: 'Men', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800' },
          { title: 'Bridal Couture Lehenga', category: 'Wedding', imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800' },
        ],
        city: t.city,
        area: t.area,
        address: t.address,
        pincode: t.pincode,
        homeVisitAvailable: true,
        homeVisitFee: 99,
        deliveryDays: 7,
        isApproved: true,
        isVerified: true,
        completedOrdersCount: t.ratingCount,
      })

      createdTailors.push({ user: u, profile })
    }

    // 4. Create 10 Customers with Realistic Indian Locations
    const customerList = [
      { name: 'Aarav Sharma', email: 'customer@tailorwala.com', phone: '+91 9988776655', city: 'Delhi', area: 'Green Park', street: 'Flat 402, Green Park Extension', pincode: '110016' },
      { name: 'Priya Mehra', email: 'priya@tailorwala.com', phone: '+91 9977665544', city: 'Delhi', area: 'GK 1', street: 'B-12, Greater Kailash 1', pincode: '110048' },
      { name: 'Rohan Gupta', email: 'rohan.gupta@example.com', phone: '+91 9966554433', city: 'Meerut', area: 'Civil Lines', street: 'House 88, Civil Lines', pincode: '250001' },
      { name: 'Sneha Patel', email: 'sneha.patel@example.com', phone: '+91 9955443322', city: 'Mumbai', area: 'Bandra', street: '14 Sunshine Apts, Turner Road', pincode: '400050' },
      { name: 'Karthik Rao', email: 'karthik.rao@example.com', phone: '+91 9944332211', city: 'Bengaluru', area: 'Koramangala', street: '72, 4th Cross, 5th Block', pincode: '560034' },
      { name: 'Simran Kaur', email: 'simran.kaur@example.com', phone: '+91 9933221100', city: 'Delhi', area: 'Lajpat Nagar', street: 'E-45, Lajpat Nagar 2', pincode: '110024' },
      { name: 'Aditya Deshmukh', email: 'aditya.d@example.com', phone: '+91 9922110099', city: 'Pune', area: 'Kothrud', street: '102 Nilayam Heights, Kothrud', pincode: '411038' },
      { name: 'Meera Sengupta', email: 'meera.s@example.com', phone: '+91 9911009988', city: 'Kolkata', area: 'Salt Lake', street: 'Block CJ-18, Sector 2, Salt Lake', pincode: '700091' },
      { name: 'Vikramaditya Rathore', email: 'vikram.rathore@example.com', phone: '+91 9900998877', city: 'Jaipur', area: 'Vaishali Nagar', street: 'Plot 45, Amrapali Circle', pincode: '302021' },
      { name: 'Fatima Zohra', email: 'fatima.z@example.com', phone: '+91 9899887766', city: 'Lucknow', area: 'Gomti Nagar', street: '3/45 Vikas Khand, Gomti Nagar', pincode: '226010' },
    ]

    const createdCustomers = []

    for (let i = 0; i < customerList.length; i++) {
      const c = customerList[i]
      const u = await User.create({
        name: c.name,
        email: c.email,
        passwordHash: customerPassword,
        role: 'customer',
        phone: c.phone,
        city: c.city,
        address: c.street,
        pincode: c.pincode,
        avatar: tailorAvatarList[(i + 3) % tailorAvatarList.length],
      })

      // Add default address record
      await Address.create({
        user: u._id,
        fullName: c.name,
        phone: c.phone,
        houseNumber: c.street.split(',')[0] || '',
        street: c.street,
        area: c.area,
        city: c.city,
        state: 'Delhi NCR',
        pincode: c.pincode,
        addressType: 'Home',
        isDefault: true,
      })

      createdCustomers.push(u)
    }

    // 5. Create Measurement Profiles for Men and Women
    const suitProfile = await MeasurementProfile.create({
      user: createdCustomers[0]._id,
      profileName: 'My Bespoke Business Suit',
      gender: 'male',
      garmentCategory: 'Suit',
      measurements: [
        { name: 'Chest', value: 40, unit: 'inch' },
        { name: 'Waist (Jacket)', value: 34, unit: 'inch' },
        { name: 'Shoulder Width', value: 18.5, unit: 'inch' },
        { name: 'Sleeve Length', value: 25.5, unit: 'inch' },
        { name: 'Jacket Length', value: 30, unit: 'inch' },
        { name: 'Trouser Waist', value: 33, unit: 'inch' },
        { name: 'Trouser Length', value: 41.5, unit: 'inch' },
      ],
      height: 178,
      weight: 74,
      fitPreference: 'slim',
      notes: 'Slightly tapered trousers, no cuff, side vents on blazer.',
      isDefault: true,
    })

    const shirtProfile = await MeasurementProfile.create({
      user: createdCustomers[0]._id,
      profileName: 'Formal Oxford Shirt',
      gender: 'male',
      garmentCategory: 'Shirt',
      measurements: [
        { name: 'Chest', value: 40, unit: 'inch' },
        { name: 'Waist', value: 33, unit: 'inch' },
        { name: 'Collar', value: 15.5, unit: 'inch' },
        { name: 'Sleeve Length', value: 25, unit: 'inch' },
        { name: 'Shirt Length', value: 30, unit: 'inch' },
      ],
      height: 178,
      weight: 74,
      fitPreference: 'regular',
      notes: 'Fused semi-spread collar.',
      isDefault: false,
    })

    const lehengaProfile = await MeasurementProfile.create({
      user: createdCustomers[1]._id,
      profileName: 'Bridal Sangeet Lehenga',
      gender: 'female',
      garmentCategory: 'Lehenga',
      measurements: [
        { name: 'Blouse Bust', value: 36, unit: 'inch' },
        { name: 'Blouse Waist', value: 29, unit: 'inch' },
        { name: 'Blouse Length', value: 14.5, unit: 'inch' },
        { name: 'Lehenga Waist', value: 30, unit: 'inch' },
        { name: 'Lehenga Hip', value: 38, unit: 'inch' },
        { name: 'Lehenga Length / Height', value: 42, unit: 'inch' },
      ],
      height: 165,
      weight: 56,
      fitPreference: 'tailored',
      notes: 'Padded blouse, deep back with tie-up latkans.',
      isDefault: true,
    })

    // 6. Create Fabrics / Cloths (20+ Items) with Real HD Unsplash Photography
    await Cloth.insertMany([
      { name: 'Egyptian Giza Cotton', description: 'Ultra-soft, breathable long-staple cotton with a silky sheen. Perfect for bespoke dress shirts.', pricePerMeter: 850, category: 'Cotton', material: '100% Egyptian Cotton', color: 'Crisp White', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800', stock: 50, rating: 4.9, numReviews: 24, isFeatured: true },
      { name: 'Pure Mulberry Silk', description: 'The finest natural silk known for its royal luster and drape for wedding sherwanis and festive kurtas.', pricePerMeter: 3200, category: 'Silk', material: '100% Pure Silk', color: 'Royal Crimson & Gold', image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800', stock: 25, rating: 5.0, numReviews: 35, isFeatured: true },
      { name: 'Cashmere Italian Wool', description: 'Exceptionally warm and soft wool blend woven for bespoke business suits and blazers.', pricePerMeter: 4500, category: 'Wool', material: 'Cashmere Wool Blend', color: 'Charcoal Midnight', image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', stock: 15, rating: 4.9, numReviews: 18, isFeatured: true },
      { name: 'Belgian Washed Linen', description: 'Sustainable, breathable linen with crisp texture, ideal for summer suits and comfort shirts.', pricePerMeter: 1200, category: 'Linen', material: '100% Belgian Linen', color: 'Desert Sand', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800', stock: 40, rating: 4.8, numReviews: 22, isFeatured: true },
      { name: 'Raw Silk Tussar', description: 'Rich textured natural silk fabric with subtle dual-tone weave for kurtas and Nehru jackets.', pricePerMeter: 1800, category: 'Silk', material: 'Pure Tussar Silk', color: 'Mustard Gold', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', stock: 30, rating: 4.8, numReviews: 14, isFeatured: false },
      { name: 'Super 140s Merino Wool', description: 'High-thread count English merino wool for crease-resistant boardroom suits.', pricePerMeter: 5200, category: 'Wool', material: '100% Merino Wool', color: 'Navy Pinstripe', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800', stock: 12, rating: 5.0, numReviews: 28, isFeatured: true },
      { name: 'Pure Banarasi Brocade', description: 'Zari woven Banarasi silk fabric for royal bridal lehengas and festive blouses.', pricePerMeter: 2800, category: 'Silk', material: 'Banarasi Katan Silk', color: 'Emerald Green & Gold', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800', stock: 20, rating: 4.9, numReviews: 40, isFeatured: true },
      { name: 'Khadi Organic Cotton', description: 'Handspun eco-friendly khadi cotton for breathable summer kurtas.', pricePerMeter: 650, category: 'Cotton', material: '100% Handloom Cotton', color: 'Off-White Ivory', image: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800', stock: 60, rating: 4.7, numReviews: 19, isFeatured: false },
    ])

    // 7. Create Coupons
    await Coupon.insertMany([
      { code: 'FIRST20', title: 'New Customer Welcome', description: 'Get 20% flat discount on your first custom tailoring order.', discountType: 'percentage', discountValue: 20, minOrderValue: 500, maxDiscount: 500, isActive: true },
      { code: 'FEST300', title: 'Festive & Wedding Special', description: 'Flat ₹300 OFF on orders above ₹2,000.', discountType: 'flat', discountValue: 300, minOrderValue: 2000, isActive: true },
      { code: 'STITCH50', title: 'Weekend Tailoring Special', description: 'Flat ₹50 OFF on any home visit appointment.', discountType: 'flat', discountValue: 50, minOrderValue: 300, isActive: true },
      { code: 'SUMMER15', title: 'Summer Cotton Discount', description: '15% OFF on bespoke shirt stitching.', discountType: 'percentage', discountValue: 15, minOrderValue: 400, maxDiscount: 300, isActive: true },
    ])

    // 8. Create Sample Orders & Bookings with Full Timeline Lifecycle
    const tailor1 = createdTailors[0]
    const tailor2 = createdTailors[1]
    const tailor3 = createdTailors[2]

    // Booking 1: Delivered & Reviewed (Aarav with Rafiq - Online Paid)
    const booking1 = await Booking.create({
      orderNumber: 'TW-2026-001001',
      customer: createdCustomers[0]._id,
      tailor: tailor1.user._id,
      tailorProfile: tailor1.profile._id,
      serviceType: 'Full 3-Piece Bespoke Suit',
      description: 'Navy blue bespoke 3-piece suit with Italian cut blazer and tapered trousers.',
      scheduledAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      timeSlot: '11:30 AM - 01:30 PM',
      status: 'delivered',
      price: 3147,
      fabricCost: 0,
      stitchingCharge: 2999,
      homeVisitFee: 99,
      deliveryFee: 49,
      paymentStatus: 'paid',
      paymentMethod: 'upi',
      paymentTransactionId: 'TXN-99882211',
      paidAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      shippingAddress: {
        fullName: 'Aarav Sharma',
        phone: '+91 9988776655',
        street: 'Flat 402, Green Park Extension',
        city: 'Delhi',
        state: 'Delhi NCR',
        pincode: '110016',
      },
      measurementProfileId: suitProfile._id,
      measurements: suitProfile.measurements,
      rating: 5,
      reviewComment: 'Master Rafiq did an incredible job! The suit fits like a glove and the fabric drape is immaculate.',
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      timeline: [
        { status: 'pending', note: 'Order placed by customer', timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
        { status: 'accepted', note: 'Tailor confirmed appointment', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        { status: 'in_progress', note: 'Measurements verified during doorstep visit', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
        { status: 'stitching', note: 'Cutting & master stitching active', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { status: 'quality_check', note: 'Finishing and steam press', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { status: 'ready', note: 'Suit packed in garment bag', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'delivered', note: 'Delivered to doorstep and customer confirmed fit', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      ],
    })

    // Payment Record for Booking 1
    await Payment.create({
      transactionId: 'TXN-99882211',
      booking: booking1._id,
      user: createdCustomers[0]._id,
      amount: 3147,
      currency: 'INR',
      provider: 'razorpay',
      status: 'paid',
      paymentMethod: 'upi',
      receiptNumber: 'REC-2026-001',
    })

    // Review for Booking 1
    await Review.create({
      booking: booking1._id,
      customer: createdCustomers[0]._id,
      tailor: tailor1.user._id,
      tailorProfile: tailor1.profile._id,
      rating: 5,
      title: 'Perfection in Every Stitch!',
      comment: 'Master Rafiq did an incredible job! The suit fits like a glove and the fabric drape is immaculate. Doorstep measurement was very punctual.',
      tailorReply: {
        comment: 'Thank you so much Aarav ji! It was our pleasure crafting this suit for you.',
        repliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      isApproved: true,
    })

    // Booking 2: In-Progress Stitching (Priya with Fatima - Card Paid)
    const booking2 = await Booking.create({
      orderNumber: 'TW-2026-001002',
      customer: createdCustomers[1]._id,
      tailor: tailor2.user._id,
      tailorProfile: tailor2.profile._id,
      serviceType: 'Padded Designer Saree Blouse',
      description: 'Princess cut designer blouse with sweetheart neckline and latkan tie-backs.',
      scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      timeSlot: '02:00 PM - 04:00 PM',
      status: 'stitching',
      price: 1147,
      fabricCost: 0,
      stitchingCharge: 999,
      homeVisitFee: 99,
      deliveryFee: 49,
      paymentStatus: 'paid',
      paymentMethod: 'card',
      paymentTransactionId: 'TXN-77665544',
      paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      shippingAddress: {
        fullName: 'Priya Mehra',
        phone: '+91 9977665544',
        street: 'B-12, Greater Kailash 1',
        city: 'Delhi',
        state: 'Delhi NCR',
        pincode: '110048',
      },
      measurementProfileId: lehengaProfile._id,
      measurements: lehengaProfile.measurements,
      timeline: [
        { status: 'pending', note: 'Order placed by customer', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'accepted', note: 'Fatima accepted booking and scheduled visit', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'in_progress', note: 'Home visit completed and measurements taken', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: 'stitching', note: 'Pattern cutting and hand-stitching active', timestamp: new Date() },
      ],
    })

    await Payment.create({
      transactionId: 'TXN-77665544',
      booking: booking2._id,
      user: createdCustomers[1]._id,
      amount: 1147,
      currency: 'INR',
      provider: 'razorpay',
      status: 'paid',
      paymentMethod: 'card',
      receiptNumber: 'REC-2026-002',
    })

    // Booking 3: Pending Confirmation (Rohan with Rameshwar - Cash on Delivery)
    const booking3 = await Booking.create({
      orderNumber: 'TW-2026-001003',
      customer: createdCustomers[2]._id,
      tailor: tailor3.user._id,
      tailorProfile: tailor3.profile._id,
      serviceType: 'Formal Dress Shirt',
      description: 'Formal dress shirt in Egyptian cotton with cutaway collar.',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: '10:00 AM - 12:00 PM',
      status: 'pending',
      price: 597,
      stitchingCharge: 449,
      homeVisitFee: 99,
      deliveryFee: 49,
      paymentStatus: 'pending',
      paymentMethod: 'cod',
      paymentTransactionId: 'COD-2026-001003',
      shippingAddress: {
        fullName: 'Rohan Gupta',
        phone: '+91 9966554433',
        street: 'House 88, Civil Lines',
        city: 'Meerut',
        state: 'Uttar Pradesh',
        pincode: '250001',
      },
      timeline: [
        { status: 'pending', note: 'Cash on delivery order placed by customer', timestamp: new Date() },
      ],
    })

    await Payment.create({
      transactionId: 'COD-2026-001003',
      booking: booking3._id,
      user: createdCustomers[2]._id,
      amount: 597,
      currency: 'INR',
      provider: 'cod',
      status: 'pending',
      paymentMethod: 'cod',
      receiptNumber: 'COD-REC-001',
    })

    console.log('✅ TailorWala Database seeded successfully with full test datasets:')
    console.log('   👤 Admin:    admin@tailorwala.com / admin123')
    console.log('   ✂️ Tailor:   tailor@tailorwala.com / tailor123')
    console.log('   👔 Customer: customer@tailorwala.com / customer123')
    console.log(`   📊 Tailor Profiles: ${createdTailors.length} | Customers: ${createdCustomers.length} | Bookings: 3`)
  } catch (err) {
    console.error('❌ Seed error:', err)
  }
}

// Allow direct execution via CLI
if (process.argv[1]?.includes('seedData.js') || process.argv[1]?.includes('seed.js')) {
  connectDB()
    .then(() => seedDatabase())
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding process failed:', err)
      process.exit(1)
    })
}

export default seedDatabase

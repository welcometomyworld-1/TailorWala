import pptxgen from 'pptxgenjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootPath = path.resolve(__dirname, '../../..')
const pptxPath1 = path.join(rootPath, 'TAILORWALA_PROJECT_PRESENTATION.pptx')
const pptxPath2 = path.join(rootPath, 'tailorwalabtech-main', 'TAILORWALA_PROJECT_PRESENTATION.pptx')

const assetsDir = path.join(__dirname, '../assets/slides')

// Read images as base64 for reliable embedding
function getBase64Image(filename) {
  const filePath = path.join(assetsDir, filename)
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath)
    return `image/jpeg;base64,${data.toString('base64')}`
  }
  return null
}

const imgHero = getBase64Image('hero_bespoke_tailor.jpg')
const imgDoorstep = getBase64Image('doorstep_measure.jpg')
const imgIdBadge = getBase64Image('id_badge_qr.jpg')
const imgDashboard = getBase64Image('platform_dashboard.jpg')
const imgAiScan = getBase64Image('ai_3d_scanning.jpg')

console.log('Generating Enhanced TailorWala 10-Slide Visual Presentation...')

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9' // 13.33 x 7.5 inches
pres.author = 'Aryan Kumar & Sushant Kumar'
pres.company = 'TailorWala Bespoke Services'
pres.title = 'TailorWala — On-Demand Custom Tailoring Platform'
pres.subject = 'Final Year Major Project Presentation'

// Theme Colors
const C_DARK_BG = '0A0F1D' // Deep Navy Slate
const C_CARD_DARK = '151E32' // Slate Dark
const C_LIGHT_BG = 'F8FAFC' // Clean Slate 50
const C_PRIMARY = '1D4ED8' // Royal Blue 700
const C_PRIMARY_LIGHT = '3B82F6' // Blue 500
const C_GOLD = 'F59E0B' // Amber Gold
const C_GOLD_DARK = 'D97706'
const C_WHITE = 'FFFFFF'
const C_TEXT_DARK = '0F172A' // Slate 900
const C_TEXT_MUTED = '64748B' // Slate 500
const C_GREEN = '059669' // Emerald 600
const C_GREEN_BG = 'ECFDF5'
const C_RED = 'DC2626' // Red 600
const C_RED_BG = 'FEF2F2'
const C_BLUE_BG = 'EFF6FF'
const C_PURPLE = '7C3AED' // Purple 600
const C_PURPLE_BG = 'F5F3FF'
const C_BORDER = 'E2E8F0'

// Helper: Standard Slide Header
function addSlideHeader(slide, title, subtitle, isDark = false) {
  // Top branding bar
  slide.addShape(pres.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.1,
    fill: { color: C_GOLD },
  })

  // Title
  slide.addText(title, {
    x: 0.8,
    y: 0.35,
    w: 9.5,
    h: 0.45,
    fontSize: 20,
    fontFace: 'Arial',
    bold: true,
    color: isDark ? C_WHITE : C_DARK_BG,
  })

  // Subtitle
  slide.addText(subtitle, {
    x: 0.8,
    y: 0.8,
    w: 9.5,
    h: 0.3,
    fontSize: 10.5,
    fontFace: 'Arial',
    color: isDark ? '94A3B8' : C_TEXT_MUTED,
  })

  // Top Right Mini Logo Badge
  slide.addShape(pres.ShapeType.roundRect, {
    x: 10.7,
    y: 0.35,
    w: 1.8,
    h: 0.38,
    rectRadius: 0.08,
    fill: { color: isDark ? '1E293B' : 'E2E8F0' },
  })
  slide.addText('✂️ TAILORWALA', {
    x: 10.7,
    y: 0.35,
    w: 1.8,
    h: 0.38,
    fontSize: 8.5,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: isDark ? C_GOLD : C_PRIMARY,
  })
}

// Helper: Standard Slide Footer
function addSlideFooter(slide, slideNum, isDark = false) {
  slide.addText('TailorWala Project Presentation • Aryan Kumar & Sushant Kumar', {
    x: 0.8,
    y: 7.05,
    w: 8.0,
    h: 0.25,
    fontSize: 8,
    fontFace: 'Arial',
    color: isDark ? '64748B' : '94A3B8',
  })

  slide.addText(`Slide ${slideNum} / 10`, {
    x: 10.7,
    y: 7.05,
    w: 1.8,
    h: 0.25,
    fontSize: 8,
    fontFace: 'Arial',
    bold: true,
    align: 'right',
    color: isDark ? C_GOLD : C_PRIMARY,
  })
}

// ==========================================
// SLIDE 1: TITLE & HERO COVER SLIDE
// ==========================================
const slide1 = pres.addSlide()
slide1.background = { color: C_DARK_BG }

// Top Ribbon
slide1.addShape(pres.ShapeType.rect, {
  x: 0,
  y: 0,
  w: '100%',
  h: 0.12,
  fill: { color: C_GOLD },
})

// Left Content Column
slide1.addShape(pres.ShapeType.roundRect, {
  x: 0.8,
  y: 0.8,
  w: 3.4,
  h: 0.35,
  rectRadius: 0.06,
  fill: { color: '1E3A8A' },
})
slide1.addText('FINAL YEAR MAJOR PROJECT', {
  x: 0.8,
  y: 0.8,
  w: 3.4,
  h: 0.35,
  fontSize: 9,
  fontFace: 'Arial',
  bold: true,
  align: 'center',
  color: C_WHITE,
})

slide1.addText('TAILORWALA', {
  x: 0.8,
  y: 1.3,
  w: 6.0,
  h: 0.9,
  fontSize: 42,
  fontFace: 'Arial Black',
  bold: true,
  color: C_GOLD,
})

slide1.addText('On-Demand Doorstep Custom Tailoring & Bespoke Couture Platform', {
  x: 0.8,
  y: 2.25,
  w: 6.0,
  h: 0.65,
  fontSize: 14,
  fontFace: 'Arial',
  bold: true,
  color: C_WHITE,
})

slide1.addText(
  'A modern multi-tier web application connecting customers with master artisan tailors for home measurement visits, custom garment creation, live order tracking, and QR ID security verification.',
  {
    x: 0.8,
    y: 2.95,
    w: 6.0,
    h: 0.8,
    fontSize: 10,
    fontFace: 'Arial',
    color: '94A3B8',
    lineSpacing: 14,
  },
)

// Presenter Box
slide1.addShape(pres.ShapeType.roundRect, {
  x: 0.8,
  y: 4.1,
  w: 6.0,
  h: 1.8,
  rectRadius: 0.12,
  fill: { color: C_CARD_DARK },
  line: { color: '334155', width: 1 },
})

slide1.addText('PROJECT DEVELOPERS:', {
  x: 1.1,
  y: 4.25,
  w: 5.4,
  h: 0.25,
  fontSize: 9,
  fontFace: 'Arial',
  bold: true,
  color: C_GOLD,
})

// Presenter 1
slide1.addText('👤 Aryan Kumar', {
  x: 1.1,
  y: 4.6,
  w: 2.6,
  h: 0.3,
  fontSize: 11,
  fontFace: 'Arial',
  bold: true,
  color: C_WHITE,
})
slide1.addText('Full-Stack Architecture & Security', {
  x: 1.1,
  y: 4.9,
  w: 2.6,
  h: 0.25,
  fontSize: 8,
  fontFace: 'Arial',
  color: '94A3B8',
})

// Presenter 2
slide1.addText('👤 Sushant Kumar', {
  x: 3.8,
  y: 4.6,
  w: 2.6,
  h: 0.3,
  fontSize: 11,
  fontFace: 'Arial',
  bold: true,
  color: C_WHITE,
})
slide1.addText('UI/UX Design & System Testing', {
  x: 3.8,
  y: 4.9,
  w: 2.6,
  h: 0.25,
  fontSize: 8,
  fontFace: 'Arial',
  color: '94A3B8',
})

// Tech Stack Tag
slide1.addText('React 19 • Node.js • Express • MongoDB • RBAC Security', {
  x: 1.1,
  y: 5.4,
  w: 5.4,
  h: 0.3,
  fontSize: 8.5,
  fontFace: 'Arial',
  bold: true,
  color: C_PRIMARY_LIGHT,
})

// Right Side: Hero Visual Photo
if (imgHero) {
  slide1.addImage({
    data: imgHero,
    x: 7.2,
    y: 0.8,
    w: 5.3,
    h: 5.9,
    rounding: true,
  })

  // Floating Image Badge
  slide1.addShape(pres.ShapeType.roundRect, {
    x: 7.5,
    y: 6.0,
    w: 4.7,
    h: 0.5,
    rectRadius: 0.1,
    fill: { color: '0F172A', transparency: 15 },
    line: { color: C_GOLD, width: 1 },
  })
  slide1.addText('✨ Master Artisan Tailoring & Doorstep Fit Assurance', {
    x: 7.5,
    y: 6.08,
    w: 4.7,
    h: 0.35,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: C_GOLD,
  })
}

addSlideFooter(slide1, 1, true)

// ==========================================
// SLIDE 2: INTRODUCTION & VALUE PROPOSITION
// ==========================================
const slide2 = pres.addSlide()
slide2.background = { color: C_LIGHT_BG }
addSlideHeader(slide2, 'Introduction to TailorWala', 'Project Background, Purpose, Target Users, and Value Proposition')
addSlideFooter(slide2, 2)

// Left 4 Cards
const introCards = [
  {
    icon: '🏢',
    title: 'What is TailorWala?',
    desc: 'An end-to-end bespoke tailoring platform connecting customers with master tailoring artisans for home measurement visits, custom stitching, and delivery.',
    bg: C_BLUE_BG,
    border: 'BFDBFE',
    accent: C_PRIMARY,
  },
  {
    icon: '🎯',
    title: 'Core Purpose',
    desc: 'To digitize the unorganized tailoring sector, eliminating inconvenient shop trips, paper sizing errors, and delayed deliveries with modern automation.',
    bg: 'FEF3C7',
    border: 'FDE68A',
    accent: C_GOLD_DARK,
  },
  {
    icon: '👥',
    title: 'Target Audience',
    desc: '• Customers: Doorstep bookings & tracking\n• Master Tailors: Order queue & digital portfolio\n• Staff & Admins: RBAC governance & audit logs',
    bg: C_GREEN_BG,
    border: 'A7F3D0',
    accent: C_GREEN,
  },
  {
    icon: '💡',
    title: 'Value Proposition',
    desc: 'Guarantees flawless custom fitting without leaving home, supports local tailor economies, and ensures safety with verified ID badges.',
    bg: C_PURPLE_BG,
    border: 'DDD6FE',
    accent: C_PURPLE,
  },
]

introCards.forEach((c, idx) => {
  const col = idx % 2
  const row = Math.floor(idx / 2)
  const x = 0.8 + col * 3.3
  const y = 1.35 + row * 2.65

  slide2.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 3.15,
    h: 2.5,
    rectRadius: 0.12,
    fill: { color: c.bg },
    line: { color: c.border, width: 1.2 },
  })

  slide2.addText(`${c.icon}  ${c.title}`, {
    x: x + 0.2,
    y: y + 0.2,
    w: 2.75,
    h: 0.35,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: c.accent,
  })

  slide2.addText(c.desc, {
    x: x + 0.2,
    y: y + 0.6,
    w: 2.75,
    h: 1.7,
    fontSize: 8.5,
    fontFace: 'Arial',
    color: C_TEXT_DARK,
    lineSpacing: 12,
  })
})

// Right Visual: Doorstep Measurement Image
if (imgDoorstep) {
  slide2.addImage({
    data: imgDoorstep,
    x: 7.7,
    y: 1.35,
    w: 4.8,
    h: 4.5,
    rounding: true,
  })

  slide2.addShape(pres.ShapeType.roundRect, {
    x: 7.7,
    y: 6.0,
    w: 4.8,
    h: 0.75,
    rectRadius: 0.1,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 },
  })
  slide2.addText('🚪 Doorstep Measurement Consultation: Master tailors visit clients with digital tablet measurement recording.', {
    x: 7.85,
    y: 6.08,
    w: 4.5,
    h: 0.6,
    fontSize: 8,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
    lineSpacing: 11,
  })
}

// ==========================================
// SLIDE 3: PROBLEM STATEMENT
// ==========================================
const slide3 = pres.addSlide()
slide3.background = { color: C_LIGHT_BG }
addSlideHeader(slide3, 'Problem Statement & Industry Gaps', 'Critical Challenges Plaguing Traditional Custom Tailoring')
addSlideFooter(slide3, 3)

const problems = [
  {
    num: '01',
    icon: '🚶‍♂️',
    title: 'Inconvenient Physical Store Visits',
    desc: 'Customers must travel 3 to 4 times for measurement, fabric drop-off, trial fitting, and final pickup—wasting valuable time and fuel.',
  },
  {
    num: '02',
    icon: '📏',
    title: 'Measurement & Sizing Errors',
    desc: 'Manual paper notes and disorganized notebooks lead to ill-fitting garments, lost alterations instructions, and costly rework.',
  },
  {
    num: '03',
    icon: '🔍',
    title: 'Limited Artisan Discovery',
    desc: 'Highly skilled master tailors lack online visibility, digital portfolios, or booking tools, confining their earnings to walk-in footfall.',
  },
  {
    num: '04',
    icon: '💸',
    title: 'Opaque Pricing & No Tracking',
    desc: 'Zero real-time progress visibility, unpredictable delivery timelines, unstandardized pricing, and absence of formal digital receipts.',
  },
]

problems.forEach((p, idx) => {
  const col = idx % 2
  const row = Math.floor(idx / 2)
  const x = 0.8 + col * 5.9
  const y = 1.35 + row * 2.5

  slide3.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 5.6,
    h: 2.3,
    rectRadius: 0.12,
    fill: { color: C_RED_BG },
    line: { color: 'FECACA', width: 1.2 },
  })

  // Number Badge
  slide3.addShape(pres.ShapeType.roundRect, {
    x: x + 0.25,
    y: y + 0.25,
    w: 0.6,
    h: 0.35,
    rectRadius: 0.06,
    fill: { color: C_RED },
  })
  slide3.addText(p.num, {
    x: x + 0.25,
    y: y + 0.25,
    w: 0.6,
    h: 0.35,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: C_WHITE,
  })

  slide3.addText(`${p.icon}  ${p.title}`, {
    x: x + 1.0,
    y: y + 0.25,
    w: 4.3,
    h: 0.35,
    fontSize: 11.5,
    fontFace: 'Arial',
    bold: true,
    color: '991B1B',
  })

  slide3.addText(p.desc, {
    x: x + 0.25,
    y: y + 0.75,
    w: 5.1,
    h: 1.3,
    fontSize: 9,
    fontFace: 'Arial',
    color: C_TEXT_DARK,
    lineSpacing: 13,
  })
})

// Bottom Root Cause Banner
slide3.addShape(pres.ShapeType.roundRect, {
  x: 0.8,
  y: 6.4,
  w: 11.7,
  h: 0.5,
  rectRadius: 0.08,
  fill: { color: '1E293B' },
})
slide3.addText('🚨 THE ROOT CAUSE: Lack of an organized digital platform connecting customer sizing, order tracking & master craftsmen.', {
  x: 0.8,
  y: 6.48,
  w: 11.7,
  h: 0.35,
  fontSize: 8.5,
  fontFace: 'Arial',
  bold: true,
  align: 'center',
  color: C_GOLD,
})

// ==========================================
// SLIDE 4: PROPOSED SOLUTION & IMPACT
// ==========================================
const slide4 = pres.addSlide()
slide4.background = { color: C_LIGHT_BG }
addSlideHeader(slide4, 'Proposed Solution & Impact', 'How TailorWala Digitizes the End-to-End Tailoring Workflow')
addSlideFooter(slide4, 4)

const solPillars = [
  {
    title: 'TRADITIONAL ISSUES',
    subtitle: 'Pain Points',
    bg: C_RED_BG,
    border: 'FECACA',
    textColor: '991B1B',
    points: [
      'Multiple store trips required',
      'Lost paper measurement slips',
      'Unpredictable delivery dates',
      'No digital receipts or tracking',
      'Tailors limited to footfall',
    ],
  },
  {
    title: 'TAILORWALA SOLUTION',
    subtitle: 'Core Innovations',
    bg: C_BLUE_BG,
    border: 'BFDBFE',
    textColor: C_PRIMARY,
    points: [
      'Doorstep measurement visits',
      'Cloud measurement profile vault',
      'Real-time order pipeline tracker',
      'Multi-channel payment gateway',
      'Artisan digital portfolios',
    ],
  },
  {
    title: 'MEASURABLE IMPACT',
    subtitle: 'Proven Results',
    bg: C_GREEN_BG,
    border: 'A7F3D0',
    textColor: '065F46',
    points: [
      '100% Doorstep convenience',
      'Zero sizing & fit errors',
      'Guaranteed 3-7 day turnaround',
      'Safe payments & live receipts',
      'Sustainable artisan revenue growth',
    ],
  },
]

solPillars.forEach((col, idx) => {
  const x = 0.8 + idx * 4.0
  const y = 1.35

  slide4.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 3.7,
    h: 4.4,
    rectRadius: 0.12,
    fill: { color: col.bg },
    line: { color: col.border, width: 1.2 },
  })

  slide4.addText(col.title, {
    x: x + 0.2,
    y: y + 0.2,
    w: 3.3,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: col.textColor,
  })

  slide4.addText(col.subtitle, {
    x: x + 0.2,
    y: y + 0.5,
    w: 3.3,
    h: 0.25,
    fontSize: 8.5,
    fontFace: 'Arial',
    align: 'center',
    color: C_TEXT_MUTED,
  })

  let pY = y + 0.95
  col.points.forEach((pt) => {
    slide4.addText(`✓  ${pt}`, {
      x: x + 0.3,
      y: pY,
      w: 3.1,
      h: 0.55,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: C_TEXT_DARK,
      lineSpacing: 12,
    })
    pY += 0.65
  })
})

// Bottom 4 Feature Badges
const bottomBadges = [
  '🏠 Zero Travel Needed',
  '☁️ Cloud Sizing Vault',
  '⚡ 3-7 Day Fast Turnaround',
  '🛡️ Live QR ID Badges',
]
bottomBadges.forEach((badge, idx) => {
  const bx = 0.8 + idx * 3.0
  slide4.addShape(pres.ShapeType.roundRect, {
    x: bx,
    y: 6.0,
    w: 2.7,
    h: 0.65,
    rectRadius: 0.08,
    fill: { color: C_PRIMARY },
  })
  slide4.addText(badge, {
    x: bx,
    y: 6.12,
    w: 2.7,
    h: 0.4,
    fontSize: 8.5,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: C_WHITE,
  })
})

// ==========================================
// SLIDE 5: KEY FEATURES & SECURITY STUDIO
// ==========================================
const slide5 = pres.addSlide()
slide5.background = { color: C_LIGHT_BG }
addSlideHeader(slide5, 'Core Features & Security Studio', 'High-Impact Capabilities for Customers, Tailors, and Staff')
addSlideFooter(slide5, 5)

const featuresLeft = [
  { icon: '📍', title: 'Location-Based Search', desc: 'Find accredited tailors in Delhi NCR with distance radius filters & reviews.' },
  { icon: '📐', title: 'Cloud Measurements Vault', desc: 'Save male & female body profiles for 1-click doorstep reorders.' },
  { icon: '📦', title: 'Live Order Tracking', desc: 'Real-time pipeline from fabric pickup to tailoring & delivery.' },
  { icon: '💳', title: 'Multi-Channel Payments', desc: 'COD verification, UPI, Card, NetBanking, and Dynamic QR.' },
  { icon: '🔐', title: '12-Module Staff RBAC', desc: 'Granular permissions matrix with 1-click Select All/Clear All.' },
  { icon: '⭐', title: 'Public Live QR Verification', desc: 'Anti-fraud staff validation via live QR scanner at /verify-id.' },
]

featuresLeft.forEach((f, idx) => {
  const col = idx % 2
  const row = Math.floor(idx / 2)
  const x = 0.8 + col * 3.1
  const y = 1.35 + row * 1.75

  slide5.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 2.95,
    h: 1.6,
    rectRadius: 0.1,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 },
  })

  // Top color strip
  slide5.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 2.95,
    h: 0.06,
    rectRadius: 0.03,
    fill: { color: C_PRIMARY },
  })

  slide5.addText(`${f.icon}  ${f.title}`, {
    x: x + 0.15,
    y: y + 0.15,
    w: 2.65,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  })

  slide5.addText(f.desc, {
    x: x + 0.15,
    y: y + 0.52,
    w: 2.65,
    h: 0.95,
    fontSize: 7.5,
    fontFace: 'Arial',
    color: C_TEXT_MUTED,
    lineSpacing: 11,
  })
})

// Right Side: ID Badge Security Image
if (imgIdBadge) {
  slide5.addImage({
    data: imgIdBadge,
    x: 7.3,
    y: 1.35,
    w: 5.2,
    h: 4.4,
    rounding: true,
  })

  slide5.addShape(pres.ShapeType.roundRect, {
    x: 7.3,
    y: 5.9,
    w: 5.2,
    h: 0.85,
    rectRadius: 0.1,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 },
  })
  slide5.addText('🪪 Enterprise ID Studio & Live QR Verification: Double-sided printable badges with holographic security seals and real-time public authenticity check.', {
    x: 7.45,
    y: 5.98,
    w: 4.9,
    h: 0.7,
    fontSize: 7.5,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
    lineSpacing: 11,
  })
}

// ==========================================
// SLIDE 6: TECHNOLOGIES & LANGUAGES USED
// ==========================================
const slide6 = pres.addSlide()
slide6.background = { color: C_LIGHT_BG }
addSlideHeader(slide6, 'Technologies & Languages Used', 'Enterprise Modern Web Architecture & Development Stack')
addSlideFooter(slide6, 6)

const techColumns = [
  {
    title: 'FRONTEND STACK',
    icon: '🌐',
    color: C_PRIMARY,
    bg: C_BLUE_BG,
    border: 'BFDBFE',
    items: [
      { name: 'React 19', role: 'Component-driven Single Page UI' },
      { name: 'JavaScript ES6+', role: 'Modern async logic & hooks' },
      { name: 'Tailwind CSS & Bootstrap', role: 'Responsive design tokens' },
      { name: 'Vite 7', role: 'Ultra-fast HMR & bundler' },
    ],
  },
  {
    title: 'BACKEND ENGINE',
    icon: '⚙️',
    color: C_GREEN,
    bg: C_GREEN_BG,
    border: 'A7F3D0',
    items: [
      { name: 'Node.js (v18+)', role: 'Event-driven server runtime' },
      { name: 'Express.js 4', role: 'REST API routing & controllers' },
      { name: 'PDFKit', role: 'Documentation & badge engine' },
      { name: 'Dotenv & CORS', role: 'Security & cross-origin pipeline' },
    ],
  },
  {
    title: 'DATABASE & AUTH',
    icon: '🗄️',
    color: C_PURPLE,
    bg: C_PURPLE_BG,
    border: 'DDD6FE',
    items: [
      { name: 'MongoDB', role: 'NoSQL document data store' },
      { name: 'Mongoose 8 ODM', role: 'Schema validation & indexing' },
      { name: 'JWT Tokens', role: 'Stateless Bearer token auth' },
      { name: 'BcryptJS (10 Salt)', role: 'Salted password encryption' },
    ],
  },
  {
    title: 'SERVICES & TESTS',
    icon: '🛠️',
    color: C_GOLD_DARK,
    bg: 'FEF3C7',
    border: 'FDE68A',
    items: [
      { name: 'In-Memory MongoDB', role: 'Automated test suite fallback' },
      { name: 'Dynamic QR Engine', role: 'Badge verification QR builder' },
      { name: 'WhatsApp API', role: 'Direct hotline integration' },
      { name: 'Node Test Runner', role: '10/10 passing integration tests' },
    ],
  },
]

techColumns.forEach((col, idx) => {
  const x = 0.8 + idx * 2.95
  const y = 1.35

  slide6.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 2.75,
    h: 5.35,
    rectRadius: 0.12,
    fill: { color: col.bg },
    line: { color: col.border, width: 1.2 },
  })

  slide6.addText(`${col.icon} ${col.title}`, {
    x: x + 0.15,
    y: y + 0.2,
    w: 2.45,
    h: 0.35,
    fontSize: 9.5,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: col.color,
  })

  let iY = y + 0.65
  col.items.forEach((item) => {
    slide6.addShape(pres.ShapeType.roundRect, {
      x: x + 0.15,
      y: iY,
      w: 2.45,
      h: 1.0,
      rectRadius: 0.08,
      fill: { color: C_WHITE },
      line: { color: col.border, width: 1 },
    })

    slide6.addText(item.name, {
      x: x + 0.25,
      y: iY + 0.12,
      w: 2.25,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: C_DARK_BG,
    })

    slide6.addText(item.role, {
      x: x + 0.25,
      y: iY + 0.42,
      w: 2.25,
      h: 0.48,
      fontSize: 7.5,
      fontFace: 'Arial',
      color: C_TEXT_MUTED,
      lineSpacing: 10,
    })

    iY += 1.12
  })
})

// ==========================================
// SLIDE 7: SYSTEM ARCHITECTURE & UI DASHBOARD
// ==========================================
const slide7 = pres.addSlide()
slide7.background = { color: C_LIGHT_BG }
addSlideHeader(slide7, 'System Architecture & Interface', '4-Tier Micro-Modular Architecture with Cloud Database & Dashboard')
addSlideFooter(slide7, 7)

// Left: 4 Tiers
const archTiers = [
  {
    tier: 'TIER 1: ACTORS & CLIENTS',
    items: '👤 Customers • 👔 Master Tailors • 🔐 Staff & Admins • 🪪 QR Scanners',
    bg: C_BLUE_BG,
    color: C_PRIMARY,
  },
  {
    tier: 'TIER 2: FRONTEND PRESENTATION (React 19)',
    items: 'AuthContext • Tailor Filters • Measurement Vault • RBAC Studio',
    bg: 'F0F9FF',
    color: '0284C7',
  },
  {
    tier: 'TIER 3: BACKEND API LAYER (Express 4)',
    items: 'authController • bookingPipeline • adminRBAC • tailorPortfolio',
    bg: C_GREEN_BG,
    color: C_GREEN,
  },
  {
    tier: 'TIER 4: DATABASE & INTEGRATIONS',
    items: 'MongoDB (Mongoose) • In-Memory Tests • QR Engine • WhatsApp API',
    bg: C_PURPLE_BG,
    color: C_PURPLE,
  },
]

let tierY = 1.35
archTiers.forEach((t) => {
  slide7.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: tierY,
    w: 5.6,
    h: 1.15,
    rectRadius: 0.1,
    fill: { color: t.bg },
    line: { color: C_BORDER, width: 1 },
  })

  slide7.addText(t.tier, {
    x: 1.0,
    y: tierY + 0.12,
    w: 5.2,
    h: 0.25,
    fontSize: 8.5,
    fontFace: 'Arial',
    bold: true,
    color: t.color,
  })

  slide7.addText(t.items, {
    x: 1.0,
    y: tierY + 0.45,
    w: 5.2,
    h: 0.55,
    fontSize: 8,
    fontFace: 'Arial',
    color: C_TEXT_DARK,
    lineSpacing: 11,
  })

  tierY += 1.3
})

// Right: Live Dashboard Mockup Photo
if (imgDashboard) {
  slide7.addImage({
    data: imgDashboard,
    x: 6.8,
    y: 1.35,
    w: 5.7,
    h: 4.4,
    rounding: true,
  })

  slide7.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 5.9,
    w: 5.7,
    h: 0.85,
    rectRadius: 0.1,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 },
  })
  slide7.addText('🖥️ TailorWala Live SaaS Dashboard: Dynamic measurement vault, live order status pipelines, tailor directory, and business analytics.', {
    x: 6.95,
    y: 5.98,
    w: 5.4,
    h: 0.7,
    fontSize: 7.5,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
    lineSpacing: 11,
  })
}

// ==========================================
// SLIDE 8: WORKFLOW JOURNEY (9 STAGES)
// ==========================================
const slide8 = pres.addSlide()
slide8.background = { color: C_LIGHT_BG }
addSlideHeader(slide8, 'End-to-End Operational Workflow', 'The 9-Stage Customer & Artisan Journey from Discovery to Doorstep Delivery')
addSlideFooter(slide8, 8)

const workflow = [
  { step: '1', title: 'Register / Sign In', desc: 'JWT login & profile setup' },
  { step: '2', title: 'Discover Tailor', desc: 'Filter by city, rating & skills' },
  { step: '3', title: 'Select Garment', desc: 'Custom suit, kurta, or dress' },
  { step: '4', title: 'Measurements', desc: 'Doorstep visit or saved vault' },
  { step: '5', title: 'Delivery & Address', desc: 'Standard (7d) or Express (3d)' },
  { step: '6', title: 'Secure Payment', desc: 'COD, UPI, Card, or QR code' },
  { step: '7', title: 'Order Verified', desc: 'Live booking timeline tracking' },
  { step: '8', title: 'Master Stitching', desc: 'Artisan crafts custom garment' },
  { step: '9', title: 'Doorstep Delivery', desc: 'Quality-checked final delivery' },
]

workflow.forEach((ws, idx) => {
  const row = Math.floor(idx / 3)
  const col = idx % 3
  const x = 0.8 + col * 4.0
  const y = 1.35 + row * 1.75

  slide8.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w: 3.7,
    h: 1.55,
    rectRadius: 0.1,
    fill: { color: C_WHITE },
    line: { color: C_BORDER, width: 1 },
  })

  // Step Number Badge
  slide8.addShape(pres.ShapeType.roundRect, {
    x: x + 0.2,
    y: y + 0.2,
    w: 0.55,
    h: 0.4,
    rectRadius: 0.06,
    fill: { color: C_PRIMARY },
  })
  slide8.addText(ws.step, {
    x: x + 0.2,
    y: y + 0.22,
    w: 0.55,
    h: 0.35,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: C_WHITE,
  })

  slide8.addText(ws.title, {
    x: x + 0.9,
    y: y + 0.22,
    w: 2.6,
    h: 0.35,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: C_DARK_BG,
  })

  slide8.addText(ws.desc, {
    x: x + 0.9,
    y: y + 0.6,
    w: 2.6,
    h: 0.75,
    fontSize: 8,
    fontFace: 'Arial',
    color: C_TEXT_MUTED,
    lineSpacing: 11,
  })
})

// Bottom Flow Indicator
slide8.addShape(pres.ShapeType.roundRect, {
  x: 0.8,
  y: 6.6,
  w: 11.7,
  h: 0.35,
  rectRadius: 0.06,
  fill: { color: 'F1F5F9' },
})
slide8.addText('Discovery ➔ Measurement Visit ➔ Cloud Sizing ➔ Fabric Collection ➔ Artisan Stitching ➔ Quality Trial ➔ Doorstep Delivery', {
  x: 0.8,
  y: 6.65,
  w: 11.7,
  h: 0.25,
  fontSize: 8,
  fontFace: 'Arial',
  bold: true,
  align: 'center',
  color: C_TEXT_MUTED,
})

// ==========================================
// SLIDE 9: BENEFITS & FUTURE INNOVATION
// ==========================================
const slide9 = pres.addSlide()
slide9.background = { color: C_LIGHT_BG }
addSlideHeader(slide9, 'Benefits & Future Innovation', 'Platform Impact and Cutting-Edge Technological Horizon')
addSlideFooter(slide9, 9)

// Left: Benefits
slide9.addShape(pres.ShapeType.roundRect, {
  x: 0.8,
  y: 1.35,
  w: 5.6,
  h: 5.35,
  rectRadius: 0.12,
  fill: { color: C_GREEN_BG },
  line: { color: 'A7F3D0', width: 1.2 },
})

slide9.addText('🌟 KEY BENEFITS & IMPACT', {
  x: 1.1,
  y: 1.6,
  w: 5.0,
  h: 0.35,
  fontSize: 11.5,
  fontFace: 'Arial',
  bold: true,
  color: '065F46',
})

const benefitsList = [
  '100% Doorstep Convenience: No travel or waiting in shops.',
  'Accredited Master Tailors: Verified artisans with ratings.',
  'Cloud Measurement Vault: Eliminates paper note errors.',
  'Transparent Pricing: Fixed rates & clear delivery fees.',
  'Multi-Channel Payments: COD, UPI, Card & Dynamic QR.',
  '12-Module Staff RBAC: Granular control & immutable logs.',
  'Live QR Authenticity: Anti-fraud official ID verification.',
]

let bY = 2.05
benefitsList.forEach((b) => {
  slide9.addText(`✓  ${b}`, {
    x: 1.1,
    y: bY,
    w: 5.0,
    h: 0.55,
    fontSize: 8.5,
    fontFace: 'Arial',
    color: C_TEXT_DARK,
    lineSpacing: 11,
  })
  bY += 0.58
})

// Right: AI Scanning Image & Future Scope
if (imgAiScan) {
  slide9.addImage({
    data: imgAiScan,
    x: 6.8,
    y: 1.35,
    w: 5.7,
    h: 3.2,
    rounding: true,
  })

  // Future Scope Card below image
  slide9.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 4.75,
    w: 5.7,
    h: 1.95,
    rectRadius: 0.1,
    fill: { color: C_BLUE_BG },
    line: { color: 'BFDBFE', width: 1.2 },
  })

  slide9.addText('🚀 FUTURE INNOVATION ROADMAP', {
    x: 7.0,
    y: 4.88,
    w: 5.3,
    h: 0.25,
    fontSize: 9.5,
    fontFace: 'Arial',
    bold: true,
    color: C_PRIMARY,
  })

  const futureItems = [
    '📱 AI 3D Camera Body Scanning for instant smartphone sizing',
    '🗺️ Live GPS Agent Tracking for doorstep artisan visits',
    '👗 3D Virtual AR Fabric Try-On & Multilingual Voice Booking',
    '🤖 Automated WhatsApp AI Booking & Status Concierge Bot',
  ]

  let fY = 5.2
  futureItems.forEach((f) => {
    slide9.addText(`➔  ${f}`, {
      x: 7.0,
      y: fY,
      w: 5.3,
      h: 0.35,
      fontSize: 7.5,
      fontFace: 'Arial',
      color: C_TEXT_DARK,
    })
    fY += 0.35
  })
}

// ==========================================
// SLIDE 10: CONCLUSION & THANK YOU
// ==========================================
const slide10 = pres.addSlide()
slide10.background = { color: C_DARK_BG }

// Top Ribbon
slide10.addShape(pres.ShapeType.rect, {
  x: 0,
  y: 0,
  w: '100%',
  h: 0.12,
  fill: { color: C_GOLD },
})

// Main Card
slide10.addShape(pres.ShapeType.roundRect, {
  x: 1.5,
  y: 0.8,
  w: 10.33,
  h: 5.9,
  rectRadius: 0.18,
  fill: { color: C_CARD_DARK },
  line: { color: '334155', width: 1.2 },
})

slide10.addText('THANK YOU', {
  x: 1.8,
  y: 1.2,
  w: 9.7,
  h: 0.7,
  fontSize: 34,
  fontFace: 'Arial Black',
  bold: true,
  align: 'center',
  color: C_GOLD,
})

slide10.addText('Reimagining the Bespoke Tailoring Experience for the Modern Digital Era', {
  x: 1.8,
  y: 1.95,
  w: 9.7,
  h: 0.4,
  fontSize: 13,
  fontFace: 'Arial',
  bold: true,
  align: 'center',
  color: C_WHITE,
})

// 3 Metric Badges in Middle
const sumMetrics = [
  { val: '100%', label: 'Doorstep Convenience' },
  { val: '12-Module', label: 'Enterprise RBAC' },
  { val: 'Live QR', label: 'Anti-Fraud ID Security' },
]

sumMetrics.forEach((m, idx) => {
  const mx = 2.4 + idx * 3.0
  slide10.addShape(pres.ShapeType.roundRect, {
    x: mx,
    y: 2.55,
    w: 2.5,
    h: 1.1,
    rectRadius: 0.1,
    fill: { color: '0A0F1D' },
    line: { color: '3B82F6', width: 1 },
  })

  slide10.addText(m.val, {
    x: mx,
    y: 2.65,
    w: 2.5,
    h: 0.45,
    fontSize: 14,
    fontFace: 'Arial',
    bold: true,
    align: 'center',
    color: C_GOLD,
  })

  slide10.addText(m.label, {
    x: mx,
    y: 3.1,
    w: 2.5,
    h: 0.35,
    fontSize: 8.5,
    fontFace: 'Arial',
    align: 'center',
    color: C_WHITE,
  })
})

// Contact & Team Credits Box
slide10.addShape(pres.ShapeType.roundRect, {
  x: 2.4,
  y: 3.9,
  w: 8.5,
  h: 1.8,
  rectRadius: 0.1,
  fill: { color: '0A0F1D' },
  line: { color: '334155', width: 1 },
})

slide10.addText('PROJECT CONTRIBUTORS & OFFICIAL CONTACT', {
  x: 2.6,
  y: 4.05,
  w: 8.1,
  h: 0.25,
  fontSize: 8.5,
  fontFace: 'Arial',
  bold: true,
  align: 'center',
  color: C_GOLD,
})

slide10.addText('👤 Aryan Kumar — Full-Stack Architecture & Backend Security\n👤 Sushant Kumar — UI/UX Design & Quality Assurance', {
  x: 2.6,
  y: 4.35,
  w: 8.1,
  h: 0.65,
  fontSize: 9.5,
  fontFace: 'Arial',
  bold: true,
  align: 'center',
  color: C_WHITE,
  lineSpacing: 14,
})

slide10.addText('📞 WhatsApp Hotline: +91 8789682127  •  🌐 TailorWala Bespoke Services  •  Questions & Discussion Welcome', {
  x: 2.6,
  y: 5.15,
  w: 8.1,
  h: 0.35,
  fontSize: 8.5,
  fontFace: 'Arial',
  align: 'center',
  color: '94A3B8',
})

addSlideFooter(slide10, 10, true)

// ==========================================
// SAVE PRESENTATION
// ==========================================
console.log('Writing PowerPoint file to paths...')

pres
  .writeFile({ fileName: pptxPath1 })
  .then(() => {
    console.log(`Successfully generated PPTX at: ${pptxPath1}`)
    fs.copyFileSync(pptxPath1, pptxPath2)
    console.log(`Copied PPTX to: ${pptxPath2}`)
  })
  .catch((err) => {
    console.error('Error generating PPTX:', err)
  })

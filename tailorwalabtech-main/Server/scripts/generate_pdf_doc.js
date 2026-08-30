import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rootPath = path.resolve(__dirname, '../../..')
const pdfPath1 = path.join(rootPath, 'TAILORWALA_COMPLETE_DOCUMENTATION.pdf')
const pdfPath2 = path.join(rootPath, 'tailorwalabtech-main', 'TAILORWALA_COMPLETE_DOCUMENTATION.pdf')

const assetsDir = path.join(__dirname, '../assets/slides')
const imgHeroPath = path.join(assetsDir, 'hero_bespoke_tailor.jpg')
const imgDoorstepPath = path.join(assetsDir, 'doorstep_measure.jpg')
const imgIdBadgePath = path.join(assetsDir, 'id_badge_qr.jpg')
const imgDashboardPath = path.join(assetsDir, 'platform_dashboard.jpg')
const imgAiScanPath = path.join(assetsDir, 'ai_3d_scanning.jpg')

console.log('Generating TailorWala Complete Enterprise Visual Documentation PDF...')

const doc = new PDFDocument({
  margin: 40,
  size: 'A4', // 595.28 x 841.89 points
  bufferPages: true,
  info: {
    Title: 'TailorWala Platform — Complete Enterprise Technical Documentation & Specification Manual',
    Author: 'Aryan Kumar & Sushant Kumar',
    Subject: 'Architecture, APIs, Data Models, RBAC, ID Verification, and Workflows',
    Keywords: 'TailorWala, React 19, Node.js, Express, MongoDB, RBAC, Tailoring, API, PDF Documentation',
  },
})

const stream1 = fs.createWriteStream(pdfPath1)
doc.pipe(stream1)

// Professional Theme Colors
const PRIMARY = '#1E3A8A' // Deep Royal Navy
const PRIMARY_DARK = '#0F172A' // Slate 900
const SECONDARY = '#0284C7' // Sky Blue
const GOLD = '#D97706' // Amber Gold
const TEXT_DARK = '#1E293B' // Slate 800
const TEXT_MUTED = '#64748B' // Slate 500
const LIGHT_BG = '#F8FAFC' // Slate 50
const CARD_BG = '#F1F5F9' // Slate 100
const BORDER = '#CBD5E1' // Slate 300
const GREEN = '#059669' // Emerald
const RED = '#DC2626' // Red

// Helper: Standard Section Header
function drawSectionHeading(number, text) {
  if (doc.y > 700) doc.addPage()
  doc.moveDown(1.2)
  const y = doc.y
  doc.rect(40, y, 515, 26).fill(LIGHT_BG)
  doc.rect(40, y, 4, 26).fill(PRIMARY)
  doc.fillColor(PRIMARY).fontSize(12).font('Helvetica-Bold').text(`${number}. ${text}`, 52, y + 7)
  doc.y = y + 34
}

// Helper: Subheading
function drawSubHeading(text) {
  if (doc.y > 720) doc.addPage()
  doc.moveDown(0.6)
  doc.fillColor(PRIMARY_DARK).fontSize(10.5).font('Helvetica-Bold').text(text)
  doc.moveDown(0.3)
}

// Helper: Paragraph
function drawParagraph(text) {
  if (doc.y > 730) doc.addPage()
  doc.fillColor(TEXT_DARK).fontSize(8.5).font('Helvetica').text(text, { align: 'justify', lineGap: 3 })
  doc.moveDown(0.4)
}

// Helper: Bullet Point
function drawBullet(title, desc) {
  if (doc.y > 735) doc.addPage()
  doc.fillColor(PRIMARY).fontSize(8.5).font('Helvetica-Bold').text(`•  ${title}: `, { continued: true })
  doc.fillColor(TEXT_DARK).font('Helvetica').text(desc, { lineGap: 2.5 })
  doc.moveDown(0.3)
}

// Helper: Callout Box
function drawCallout(title, text, borderColor = GOLD, bgColor = '#FFFBEB') {
  if (doc.y > 710) doc.addPage()
  doc.moveDown(0.5)
  const y = doc.y
  doc.rect(40, y, 515, 38).fill(bgColor)
  doc.rect(40, y, 4, 38).fill(borderColor)
  doc.fillColor(borderColor).fontSize(8.5).font('Helvetica-Bold').text(title, 52, y + 6)
  doc.fillColor(TEXT_DARK).fontSize(7.8).font('Helvetica').text(text, 52, y + 18, { width: 495 })
  doc.y = y + 46
}

// Helper: Table
function drawTable(headers, rows, colWidths) {
  if (doc.y > 670) doc.addPage()
  const startX = 40
  let currentY = doc.y

  // Header row
  doc.rect(startX, currentY, 515, 20).fill(PRIMARY)
  doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')

  let curX = startX
  headers.forEach((h, i) => {
    doc.text(h, curX + 5, currentY + 6, { width: colWidths[i] - 10, align: 'left' })
    curX += colWidths[i]
  })

  currentY += 20

  // Rows
  rows.forEach((row, rIdx) => {
    if (currentY > 740) {
      doc.addPage()
      currentY = 50
    }
    const bg = rIdx % 2 === 0 ? '#FFFFFF' : LIGHT_BG
    doc.rect(startX, currentY, 515, 17).fill(bg)
    doc.rect(startX, currentY, 515, 17).stroke(BORDER)
    doc.fillColor(TEXT_DARK).fontSize(7.5).font('Helvetica')

    curX = startX
    row.forEach((cell, cIdx) => {
      doc.text(String(cell), curX + 5, currentY + 4, { width: colWidths[cIdx] - 10, align: 'left' })
      curX += colWidths[cIdx]
    })
    currentY += 17
  })

  doc.y = currentY + 12
}

// ==========================================
// PAGE 1: COVER PAGE WITH EMBEDDED HERO IMAGE
// ==========================================

// Top Navy Hero Box
doc.rect(40, 40, 515, 180).fill(PRIMARY_DARK)
doc.rect(40, 40, 515, 4).fill(GOLD)

doc.fillColor(GOLD).fontSize(10).font('Helvetica-Bold').text('OFFICIAL ENTERPRISE SYSTEM SPECIFICATION • 2026', 60, 60)
doc.fillColor('#FFFFFF').fontSize(26).font('Helvetica-Bold').text('TAILORWALA PLATFORM', 60, 80)
doc.fontSize(12).font('Helvetica').text('On-Demand Doorstep Custom Tailoring & Bespoke Couture Architecture', 60, 115)
doc.fontSize(8.5).font('Helvetica-Oblique').text('Comprehensive Reference Manual: Code Modules, APIs, RBAC, Database & ID Studio', 60, 140)

// Project Metadata Pill inside Banner
doc.rect(60, 170, 475, 30).fill('#1E293B')
doc.fillColor(GOLD).fontSize(8.5).font('Helvetica-Bold').text('PROJECT CONTRIBUTORS: ', 75, 180, { continued: true })
doc.fillColor('#FFFFFF').font('Helvetica').text('Aryan Kumar (Full-Stack/Security)  •  Sushant Kumar (UI/UX/Testing)', { continued: false })

doc.y = 235

// Embedded Hero Image on Cover
if (fs.existsSync(imgHeroPath)) {
  doc.image(imgHeroPath, 40, doc.y, { width: 515, height: 210 })
  doc.y += 220
}

drawSectionHeading('1', 'EXECUTIVE SYSTEM SUMMARY & PURPOSE')
drawParagraph(
  'TailorWala is an innovative, end-to-end bespoke tailoring e-commerce and on-demand artisan platform. The platform bridges discerning customers seeking perfect-fitting garments with master artisan tailors who provide doorstep measurement visits, bespoke cutting and stitching, alteration services, fabric pickup/delivery, and live order tracking. The system features 12-module granular Role-Based Access Control (RBAC), printable double-sided security ID cards with live QR verification, dynamic payment tracking, and WhatsApp customer hotline integration (+91 8789682127).'
)

drawCallout(
  '🌟 CORE ENTERPRISE VALUE PROPOSITION',
  '100% Doorstep Convenience (Zero Shop Visits) + Cloud Measurement Vault (Zero Paper Sizing Errors) + Accredited Master Tailors + Anti-Fraud Live QR ID Badges.',
  PRIMARY,
  '#EFF6FF'
)

// ==========================================
// PAGE 2: TECHNOLOGY STACK & ARCHITECTURE
// ==========================================
doc.addPage()

drawSectionHeading('2', 'TECHNOLOGY STACK & PROGRAMMING LANGUAGES')
drawParagraph(
  'The platform is built on modern, scalable, and type-safe open web standards using JavaScript across the entire full-stack ecosystem.'
)

const techHeaders = ['Layer / Component', 'Technologies & Tools', 'Version', 'Role & Description']
const techRows = [
  ['Frontend UI', 'React 19, JavaScript ES6+, JSX', '19.0.0', 'Component-driven Single Page Application with dynamic context state'],
  ['Build Engine', 'Vite 7, Tailwind CSS v4, BS5', '7.0.0', 'Ultra-fast HMR, glassmorphism design tokens & responsive grids'],
  ['Backend Server', 'Node.js, Express.js 4', 'v18+ / 4.21', 'Asynchronous event-driven REST API routing & middleware controllers'],
  ['Database ODM', 'MongoDB, Mongoose 8 ODM', '8.x / 9.x', 'Document database schema modeling, indexing, and transactional integrity'],
  ['Security & Auth', 'JWT (Bearer Tokens), BcryptJS', '9.0 / 3.0', 'Stateless token authentication & salted password encryption (10 rounds)'],
  ['Document Engine', 'PDFKit, PPTXGenJS', '0.20 / 4.0', 'Automated PDF specification generator & 16:9 presentation builder'],
  ['Automated Testing', 'Node.js Test Runner, In-Memory Mongo', 'v18+ / 11.2', '10/10 automated unit & integration test suites with zero external setup'],
]
drawTable(techHeaders, techRows, [85, 125, 55, 250])

// Doorstep Measurement Image
if (fs.existsSync(imgDoorstepPath)) {
  const curY = doc.y
  doc.image(imgDoorstepPath, 40, curY, { width: 245, height: 165 })
  doc.rect(295, curY, 260, 165).fill(LIGHT_BG)
  doc.rect(295, curY, 260, 165).stroke(BORDER)
  doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold').text('DOORSTEP TAILORING WORKFLOW', 308, curY + 12)
  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica').text(
    '1. Customer books visit online via interactive schedule picker.\n2. Master tailor arrives at customer doorstep with digital tablet.\n3. Precise body dimensions are logged directly to Cloud Vault.\n4. Fabric is collected with instant digital receipt.\n5. Garment is crafted by master artisan in 3-7 days.\n6. Quality-checked trial and final doorstep handover.',
    308,
    curY + 30,
    { width: 235, lineGap: 3 }
  )
  doc.y = curY + 180
}

// ==========================================
// PAGE 3: USER ROLES, RBAC & ID VERIFICATION
// ==========================================
drawSectionHeading('3', 'USER ROLES, RBAC & SECURITY VERIFICATION')
drawParagraph(
  'TailorWala implements strict role isolation ensuring system integrity. Super Admins hold immutable root access, while Admin and Employee accounts operate under granular 12-module permission matrices.'
)

const roleHeaders = ['Role Name', 'Access Scope', 'Primary Capabilities', 'Immutability / Security']
const roleRows = [
  ['Super Admin', 'Root System Director', 'All modules, staff creation, financial accounts, settings', 'Immutable — cannot be deleted/suspended'],
  ['Admin', 'Platform Director', 'Full management of users, tailors, bookings, payments, staff', 'Configured by Super Admin'],
  ['Employee', 'Operational Staff', 'Granular 12-module access (Orders, Tailors, Services, etc.)', 'Matrix permissions, temporary pass reset'],
  ['Master Tailor', 'Artisan Partner', 'Workshop profile, custom designs showcase, order queue, payouts', 'Subject to Admin moderation approval'],
  ['Customer', 'Public Buyer', 'Doorstep visit booking, custom measurements, cart, reviews', 'Self-service registration & profiles'],
]
drawTable(roleHeaders, roleRows, [80, 95, 220, 120])

// ID Badge & QR Visual
if (fs.existsSync(imgIdBadgePath)) {
  if (doc.y > 600) doc.addPage()
  const curY = doc.y
  doc.image(imgIdBadgePath, 40, curY, { width: 245, height: 165 })
  doc.rect(295, curY, 260, 165).fill('#F0FDF4')
  doc.rect(295, curY, 260, 165).stroke('#BBF7D0')
  doc.fillColor(GREEN).fontSize(10).font('Helvetica-Bold').text('LIVE ANTI-FRAUD ID QR VERIFICATION', 308, curY + 12)
  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica').text(
    '• Official ID badges are printable double-sided (CR-80 standard).\n• Front side displays photo, employee number, department & chip.\n• Back side contains holographic security badge & dynamic QR code.\n• Anyone scanning the QR code is routed to /verify-id/:id.\n• Resolves live server status (Active, Verified, Suspended).\n• Eliminates impersonation fraud during home visits.',
    308,
    curY + 30,
    { width: 235, lineGap: 3 }
  )
  doc.y = curY + 180
}

// ==========================================
// PAGE 4: BACKEND CONTROLLERS & DATA FLOW
// ==========================================
if (doc.y > 600) doc.addPage()

drawSectionHeading('4', 'BACKEND API CONTROLLERS & BUSINESS LOGIC')

drawSubHeading('4.1 Authentication Controller (authController.js)')
drawBullet('register(req, res)', 'Validates email/phone, hashes password with bcrypt (10 salt rounds), creates User document, and returns signed JWT token.')
drawBullet('login(req, res)', 'Accepts Email or Employee ID (TW-EMP-XXXX), compares salted hash, verifies active status, and updates lastLogin timestamp.')
drawBullet('getMe(req, res)', 'Hydrates active user session, roles, and granular permissions matrix from validated Bearer JWT token.')
drawBullet('verifyIDCard(req, res)', 'PUBLIC endpoint resolving ID numbers across Users and TailorProfiles to return authentic verification badges.')

drawSubHeading('4.2 Admin Controller (adminController.js)')
drawBullet('getStats(req, res)', 'Calculates total revenue, pending COD verifications, active tailors, customer counts, and order pipeline states.')
drawBullet('getEmployees & createEmployee', 'Generates unique sequential Employee ID, sets temporary password, and assigns initial 12-module permission matrix.')
drawBullet('updateEmployee(req, res)', 'Updates designation, department, permissions, avatar, password, and active/suspended ID status.')
drawBullet('updatePaymentStatus(req, res)', 'Allows marking payments as paid, refunded, returned, or reverted with activity audit logging.')

drawSubHeading('4.3 Booking & Order Controller (bookingController.js)')
drawBullet('createBooking(req, res)', 'Creates order with items, custom measurements, delivery address, turnaround days (3d express / 7d standard), and COD status.')
drawBullet('getMyBookings(req, res)', 'Fetches customer order history sorted by most recent with live status tracker.')
drawBullet('updateBookingStatus(req, res)', 'Progresses order state (pending -> accepted -> fabric_collected -> in_stitching -> trial -> delivered).')

// ==========================================
// PAGE 5: FRONTEND ARCHITECTURE & SAAS UI
// ==========================================
if (doc.y > 600) doc.addPage()

drawSectionHeading('5', 'FRONTEND ARCHITECTURE & SAAS DASHBOARD')

// Dashboard Image Visual
if (fs.existsSync(imgDashboardPath)) {
  doc.image(imgDashboardPath, 40, doc.y, { width: 515, height: 180 })
  doc.y += 190
}

drawSubHeading('5.1 State Management Contexts')
drawBullet('AuthContext (useAuth)', 'Stores JWT in localStorage, maintains user profile state, exports login, register, logout, and updateUserProfile.')
drawBullet('CartContext (useCart)', 'Manages persistent cart items, service addons, promo coupons, subtotal, discount, delivery fee, and grand total.')
drawBullet('ToastContext (useToast)', 'Provides reactive toast banners: success(), error(), info() with auto-dismiss.')

drawSubHeading('5.2 Tailor Showcase & Custom Designs (TailorProfile.jsx)')
drawBullet('Work Conditions Grid', 'Displays Home Visit, Shop Visit, Custom Measurement, Customer Fabric Accepted, Express Delivery, Fabric Provided.')
drawBullet('Previous Work Showcase', 'Enables tailors to upload creation photos with categories (Men, Women, Wedding), turnaround days, and descriptions.')

// ==========================================
// PAGE 6: REST API ENDPOINTS TABLE
// ==========================================
if (doc.y > 600) doc.addPage()

drawSectionHeading('6', 'COMPLETE REST API ENDPOINT SPECIFICATION')

const apiHeaders = ['Method', 'Endpoint Route', 'Access Level', 'Purpose / Operation']
const apiRows = [
  ['POST', '/api/auth/register', 'Public', 'Register customer or tailor partner account'],
  ['POST', '/api/auth/login', 'Public', 'Authenticate email/employeeId & return JWT'],
  ['GET', '/api/auth/me', 'Protected', 'Hydrate active authenticated user profile'],
  ['GET', '/api/auth/verify-id/:id', 'Public', 'Public verification of Employee/Tailor ID QR code'],
  ['GET', '/api/tailors', 'Public', 'Search tailor partners by query, city, and radius'],
  ['GET', '/api/tailors/:id', 'Public', 'Get tailor details, work conditions & designs portfolio'],
  ['POST', '/api/tailors/profile', 'Tailor', 'Create or update workshop profile & portfolio'],
  ['POST', '/api/bookings', 'Customer', 'Place new tailoring booking / COD order'],
  ['GET', '/api/bookings/my', 'Customer', 'Get logged-in customer booking history'],
  ['PATCH', '/api/bookings/:id/status', 'Staff/Tailor', 'Update order progress workflow state'],
  ['GET', '/api/admin/stats', 'Staff/Admin', 'Fetch revenue, pending orders, and system metrics'],
  ['GET', '/api/admin/employees', 'Admin', 'List all employee staff accounts with permissions'],
  ['POST', '/api/admin/employees', 'Admin', 'Create employee account with auto ID & temporary pass'],
  ['PATCH', '/api/admin/employees/:id', 'Admin', 'Update employee details, permissions, ID status'],
  ['DELETE', '/api/admin/employees/:id', 'Admin', 'Remove non-super-admin employee account'],
  ['GET', '/api/admin/payments', 'Staff/Admin', 'Fetch transaction ledger and COD orders'],
  ['PATCH', '/api/admin/payments/:id/status', 'Admin', 'Mark paid, refund, return, or cancel payment'],
  ['GET', '/api/admin/activity-logs', 'Staff/Admin', 'Fetch immutable audit logs with filter parameters'],
  ['POST', '/api/admin/settings', 'Admin', 'Configure delivery fees, days, and commission %'],
]
drawTable(apiHeaders, apiRows, [45, 150, 75, 245])

// ==========================================
// PAGE 7: FUTURE ROADMAP & VERIFICATION CERTIFICATE
// ==========================================
if (doc.y > 550) doc.addPage()

drawSectionHeading('7', 'FUTURE ROADMAP & AI INNOVATIONS')

if (fs.existsSync(imgAiScanPath)) {
  const curY = doc.y
  doc.image(imgAiScanPath, 40, curY, { width: 220, height: 150 })
  doc.rect(270, curY, 285, 150).fill('#EFF6FF')
  doc.rect(270, curY, 285, 150).stroke('#BFDBFE')
  doc.fillColor(PRIMARY).fontSize(10).font('Helvetica-Bold').text('AI 3D BODY SCANNING & ROADMAP', 282, curY + 12)
  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica').text(
    '• AI 3D Camera Body Scanning: Instant smartphone sizing.\n• AI Matchmaking: Tailor recommendation based on fabric & style.\n• Native Mobile Apps: iOS & Android React Native editions.\n• Live GPS Agent Tracking: Real-time map for doorstep tailors.\n• 3D Virtual Fabric Try-On: Augmented reality garment preview.\n• Multilingual Voice Booking: Hindi & English conversational AI.\n• WhatsApp AI Concierge: Automated order status bot.',
    282,
    curY + 30,
    { width: 260, lineGap: 3 }
  )
  doc.y = curY + 165
}

drawSectionHeading('8', 'SYSTEM VERIFICATION & CERTIFICATE OF ASSURANCE')
drawBullet('Server Integration Tests (10/10 Passed)', 'Verified with native Node test runner on all auth, booking, and tailor endpoints.')
drawBullet('Client Production Build (0 Errors)', 'Verified with Vite 7 production bundle analyzer.')
drawBullet('Official WhatsApp Hotline', 'Pre-configured with direct customer communication channel: +91 8789682127')

doc.moveDown(0.8)
const certY = doc.y
doc.rect(40, certY, 515, 48).fill('#F0FDF4')
doc.rect(40, certY, 515, 48).stroke(GREEN)
doc.fillColor(GREEN).fontSize(9).font('Helvetica-Bold').text('TAILORWALA PLATFORM — ENTERPRISE ASSURANCE CERTIFICATE', 52, certY + 10)
doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica').text(
  'This document certifies that all platform subsystems (Frontend, REST APIs, MongoDB Models, 12-Module RBAC, ID Card Studio, and Live QR Verification) have passed all automated validation suites and meet enterprise specifications.',
  52,
  certY + 24,
  { width: 490 }
)

// Global Footer on all pages
const range = doc.bufferedPageRange()
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i)
  doc.fillColor(TEXT_MUTED).fontSize(7.5).font('Helvetica')
  doc.text(`TailorWala Enterprise Technical Documentation • Aryan Kumar & Sushant Kumar • Page ${i + 1} of ${range.count}`, 40, 810, {
    align: 'center',
    width: 515,
  })
}

doc.end()

stream1.on('finish', () => {
  console.log(`Successfully generated updated PDF at: ${pdfPath1}`)
  try {
    fs.copyFileSync(pdfPath1, pdfPath2)
    console.log(`Successfully copied updated PDF to: ${pdfPath2}`)
  } catch (err) {
    console.error('Error copying PDF:', err)
  }
})

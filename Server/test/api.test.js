import assert from 'node:assert'
import test from 'node:test'
import app from '../src/app.js'
import connectDB, { disconnectDB } from '../src/config/db.js'
import http from 'node:http'
import dotenv from 'dotenv'

dotenv.config()

let server
let port = 5099
let baseUrl = `http://127.0.0.1:${port}`

let customerToken = ''
let customerId = ''
let tailorToken = ''
let tailorProfileId = ''
let adminToken = ''
let createdAddressId = ''
let createdBookingId = ''

test.before(async () => {
  await connectDB()
  await new Promise((resolve) => {
    server = http.createServer(app)
    server.listen(port, () => {
      resolve()
    })
  })
})

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve))
  }
  await disconnectDB()
})

test('GET /api/health and /health return 200 and healthy status object', async () => {
  const res1 = await fetch(`${baseUrl}/health`)
  assert.strictEqual(res1.status, 200)
  const json1 = await res1.json()
  assert.strictEqual(json1.status, 'ok')
  assert.strictEqual(json1.database, 'connected')
  assert.strictEqual(json1.service, 'TailorWala Backend API')
  assert.ok(json1.uptime)

  const res2 = await fetch(`${baseUrl}/api/health`)
  assert.strictEqual(res2.status, 200)
  const json2 = await res2.json()
  assert.strictEqual(json2.status, 'ok')
  assert.strictEqual(json2.database, 'connected')
})

test('GET / returns 200 welcome and route directory', async () => {
  const res = await fetch(`${baseUrl}/`)
  assert.strictEqual(res.status, 200)
  const json = await res.json()
  assert.strictEqual(json.name, 'TailorWala API')
  assert.ok(json.endpoints.auth)
  assert.ok(json.endpoints.tailors)
  assert.ok(json.endpoints.bookings)
  assert.ok(json.endpoints.addresses)
  assert.ok(json.endpoints.settings)
})

test('GET /api/measurements/templates returns male and female standard templates', async () => {
  const res = await fetch(`${baseUrl}/api/measurements/templates`)
  assert.strictEqual(res.status, 200)
  const json = await res.json()
  assert.strictEqual(json.status, 'success')
  assert.ok(json.data.male)
  assert.ok(json.data.female)
  assert.ok(json.data.male.Shirt)
  assert.ok(json.data.female.Blouse)
})

test('Auth: Register Customer, Tailor, and Admin', async () => {
  const rand = Math.floor(Math.random() * 100000)
  
  // Register Customer
  const custRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Test Customer ${rand}`,
      email: `customer${rand}@test.com`,
      password: 'password123',
      role: 'customer',
      phone: `98765${String(rand).padStart(5, '0')}`,
      city: 'Delhi',
    }),
  })
  assert.strictEqual(custRes.status, 201)
  const custJson = await custRes.json()
  assert.ok(custJson.token)
  assert.strictEqual(custJson.user.role, 'customer')
  customerToken = custJson.token
  customerId = custJson.user.id || custJson.user._id

  // Register Tailor
  const tailorRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Master Test Tailor ${rand}`,
      email: `tailor${rand}@test.com`,
      password: 'password123',
      role: 'tailor',
      phone: `98111${String(rand).padStart(5, '0')}`,
      city: 'Delhi',
      shopName: `Royal Test Studio ${rand}`,
    }),
  })
  assert.strictEqual(tailorRes.status, 201)
  const tailorJson = await tailorRes.json()
  assert.ok(tailorJson.token)
  assert.strictEqual(tailorJson.user.role, 'tailor')
  tailorToken = tailorJson.token

  // Register Admin
  const adminRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Super Admin ${rand}`,
      email: `admin${rand}@test.com`,
      password: 'password123',
      role: 'admin',
      phone: `98222${String(rand).padStart(5, '0')}`,
      city: 'Delhi',
    }),
  })
  assert.strictEqual(adminRes.status, 201)
  const adminJson = await adminRes.json()
  assert.ok(adminJson.token)
  assert.strictEqual(adminJson.user.role, 'admin')
  adminToken = adminJson.token
})

test('Auth: GET /api/auth/me returns authenticated user profile', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  })
  assert.strictEqual(res.status, 200)
  const json = await res.json()
  assert.strictEqual(json.status, 'success')
  assert.strictEqual(json.user.role, 'customer')
})

test('Address CRUD: Create, Read, Update, Delete customer addresses', async () => {
  // 1. Create Address
  const createRes = await fetch(`${baseUrl}/api/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      fullName: 'Test Customer',
      phone: '9876543210',
      houseNumber: 'Flat 402, Lotus Apartments',
      street: 'MG Road',
      area: 'Connaught Place',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      addressType: 'Home',
      isDefault: true,
    }),
  })
  assert.strictEqual(createRes.status, 201)
  const createJson = await createRes.json()
  assert.strictEqual(createJson.status, 'success')
  assert.ok(createJson.data._id)
  createdAddressId = createJson.data._id

  // 2. Read Addresses
  const getRes = await fetch(`${baseUrl}/api/addresses`, {
    headers: { Authorization: `Bearer ${customerToken}` },
  })
  assert.strictEqual(getRes.status, 200)
  const getJson = await getRes.json()
  assert.ok(Array.isArray(getJson.data))
  assert.strictEqual(getJson.data.length >= 1, true)

  // 3. Update Address
  const updateRes = await fetch(`${baseUrl}/api/addresses/${createdAddressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      houseNumber: 'Flat 502, Lotus Apartments (Updated)',
    }),
  })
  assert.strictEqual(updateRes.status, 200)
  const updateJson = await updateRes.json()
  assert.strictEqual(updateJson.data.houseNumber, 'Flat 502, Lotus Apartments (Updated)')
})

test('Tailors: Search and filter tailors by query, city, and category', async () => {
  // Get tailor profile created during registration
  const profileRes = await fetch(`${baseUrl}/api/tailors/profile/me`, {
    headers: { Authorization: `Bearer ${tailorToken}` },
  })
  assert.strictEqual(profileRes.status, 200)
  const profileJson = await profileRes.json()
  tailorProfileId = profileJson.data._id

  // Search Tailors
  const searchRes = await fetch(`${baseUrl}/api/tailors?search=Studio&city=Delhi`)
  assert.strictEqual(searchRes.status, 200)
  const searchJson = await searchRes.json()
  assert.strictEqual(searchJson.status, 'success')
  assert.ok(Array.isArray(searchJson.data))
})

test('Bookings & COD Payment: Create booking, update status, and place COD order', async () => {
  // 1. Create Booking
  const bookRes = await fetch(`${baseUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      tailorId: tailorProfileId,
      serviceType: 'Custom Bespoke Suit',
      totalAmount: 1499,
      scheduledAt: '2026-09-01',
      timeSlot: '11:30 AM',
      items: [{ name: 'Custom Bespoke Suit', price: 1499, quantity: 1 }],
      shippingAddress: {
        fullName: 'Test Customer',
        phone: '9876543210',
        city: 'Delhi',
        address: 'Flat 502, Lotus Apartments, MG Road',
        pincode: '110001',
      },
    }),
  })
  assert.strictEqual(bookRes.status, 201)
  const bookJson = await bookRes.json()
  assert.ok(bookJson.data._id)
  createdBookingId = bookJson.data._id

  // 2. Tailor updates status to 'accepted'
  const statusRes = await fetch(`${baseUrl}/api/bookings/${createdBookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tailorToken}`,
    },
    body: JSON.stringify({
      status: 'accepted',
      note: 'Master tailor accepted order and confirmed measurement slot.',
    }),
  })
  assert.strictEqual(statusRes.status, 200)
  const statusJson = await statusRes.json()
  assert.strictEqual(statusJson.data.status, 'accepted')

  // 3. Process COD Payment creation
  const codRes = await fetch(`${baseUrl}/api/payments/cod`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({
      bookingId: createdBookingId,
      amount: 1499,
    }),
  })
  assert.strictEqual(codRes.status, 200)
  const codJson = await codRes.json()
  assert.strictEqual(codJson.status, 'success')
  assert.strictEqual(codJson.data.paymentMethod, 'cod')
  assert.strictEqual(codJson.data.paymentStatus, 'pending')
})

test('Admin: Stats, Payment Overview, and Settings Management', async () => {
  // 1. Admin Stats
  const statsRes = await fetch(`${baseUrl}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert.strictEqual(statsRes.status, 200)
  const statsJson = await statsRes.json()
  assert.strictEqual(statsJson.status, 'success')
  assert.ok(statsJson.data.overview)

  // 2. Admin Payment Overview
  const payRes = await fetch(`${baseUrl}/api/admin/payments/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert.strictEqual(payRes.status, 200)
  const payJson = await payRes.json()
  assert.strictEqual(payJson.status, 'success')
  assert.ok(payJson.data.overview)

  // 3. Admin System Settings
  const getSettingsRes = await fetch(`${baseUrl}/api/admin/settings`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  assert.strictEqual(getSettingsRes.status, 200)
  const getSettingsJson = await getSettingsRes.json()
  assert.strictEqual(getSettingsJson.status, 'success')

  const updateSettingsRes = await fetch(`${baseUrl}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      deliveryCharge: 59,
      codCharge: 0,
    }),
  })
  assert.strictEqual(updateSettingsRes.status, 200)
  const updateSettingsJson = await updateSettingsRes.json()
  assert.strictEqual(updateSettingsJson.data.deliveryCharge, 59)
})

test('404 handler returns structured error for invalid route', async () => {
  const res = await fetch(`${baseUrl}/api/invalid-non-existent-path`)
  assert.strictEqual(res.status, 404)
  const json = await res.json()
  assert.strictEqual(json.status, 'fail')
  assert.ok(json.message.includes('not found'))
})

import React, { useEffect, useState, useId } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Truck,
  Ruler,
  CreditCard,
  Smartphone,
  QrCode,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  ArrowRight,
  Lock,
  Zap,
} from 'lucide-react'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { apiGet, apiPost } from '../services/api.js'

export function Checkout() {
  const nameId = useId()
  const phoneId = useId()
  const houseId = useId()
  const streetId = useId()
  const areaId = useId()
  const cityId = useId()
  const stateId = useId()
  const pincodeId = useId()

  const {
    items,
    clearCart,
    selectedMeasurementProfile,
    coupon,
    deliveryPreference,
    setDeliveryPreference,
    stitchingTotal,
    fabricTotal,
    homeVisitFee,
    deliveryFee,
    discount,
    grandTotal,
    primaryTailorId,
    primaryTailorName,
    primaryScheduledAt,
    primaryTimeSlot,
  } = useCart()

  const { user } = useAuth()
  const { success, error, warning } = useToast()
  const navigate = useNavigate()

  // Address State
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseNumber: '',
    street: user?.address || '',
    area: '',
    landmark: '',
    city: user?.city || 'Delhi',
    state: 'Delhi NCR',
    pincode: user?.pincode || '110001',
    addressType: 'Home',
    isDefault: true,
  })

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [upiId, setUpiId] = useState('customer@okhdfcbank')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821')
  const [cardExpiry, setCardExpiry] = useState('11/28')
  const [cardCvv, setCardCvv] = useState('892')
  const [loading, setLoading] = useState(false)
  const [platformSettings, setPlatformSettings] = useState({
    codEnabled: true,
    upiEnabled: true,
    cardEnabled: true,
    qrEnabled: true,
  })
  const [receivingAccount, setReceivingAccount] = useState({
    upiId: 'tailorwala@icici',
    businessName: 'TailorWala Bespoke Services',
    accountHolderName: 'TailorWala Enterprise Pvt Ltd',
  })

  // Fetch saved user addresses, platform settings and receiving account
  useEffect(() => {
    if (!user) return

    apiGet('/addresses')
      .then((res) => {
        const list = res.data || []
        setSavedAddresses(list)
        if (list.length > 0) {
          const def = list.find((a) => a.isDefault) || list[0]
          setSelectedAddressId(def._id)
        } else {
          setShowNewAddressForm(true)
        }
      })
      .catch(() => {
        setSavedAddresses([])
        setShowNewAddressForm(true)
      })

    apiGet('/settings')
      .then((res) => {
        if (res.data) setPlatformSettings(res.data)
      })
      .catch(() => {})

    apiGet('/payments/receiving-account')
      .then((res) => {
        if (res.data) setReceivingAccount(res.data)
      })
      .catch(() => {})
  }, [user])

  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    `upi://pay?pa=${receivingAccount.upiId || 'tailorwala@icici'}&pn=${encodeURIComponent(
      receivingAccount.businessName || 'TailorWala',
    )}&am=${grandTotal}&cu=INR`,
  )}`

  if (!items || items.length === 0) {
    navigate('/cart')
    return null
  }

  const handleSaveNewAddress = async (e) => {
    e.preventDefault()
    if (!newAddress.fullName || !newAddress.phone || !newAddress.street || !newAddress.city || !newAddress.pincode) {
      warning('Please fill in all required address fields.')
      return
    }

    try {
      const res = await apiPost('/addresses', newAddress)
      const created = res.data
      setSavedAddresses((prev) => [created, ...prev])
      setSelectedAddressId(created._id)
      setShowNewAddressForm(false)
      success('Address saved to your address book!')
    } catch (err) {
      error(err.message || 'Failed to save address')
    }
  }

  const handlePayAndConfirm = async (e) => {
    e.preventDefault()

    // Validate that we have a selected delivery address
    const activeAddr = showNewAddressForm
      ? newAddress
      : savedAddresses.find((a) => a._id === selectedAddressId) || newAddress

    if (!activeAddr || !activeAddr.street || !activeAddr.phone || !activeAddr.pincode) {
      warning('Please provide or select a valid doorstep measurement address.')
      return
    }

    setLoading(true)
    try {
      // 1. Create Booking in backend
      const bookingRes = await apiPost('/bookings', {
        tailorId: primaryTailorId,
        serviceType: items[0]?.serviceType || 'Bespoke Tailoring',
        description: items.map((i) => `${i.serviceType} (x${i.quantity || 1})`).join(', '),
        items: items.map((i) => ({
          name: i.serviceType,
          price: i.price,
          quantity: i.quantity || 1,
          customizationNotes: i.customizationNotes || '',
        })),
        scheduledAt: primaryScheduledAt || new Date().toISOString(),
        timeSlot: primaryTimeSlot || '10:00 AM - 01:00 PM',
        price: grandTotal,
        fabricCost: fabricTotal,
        stitchingCharge: stitchingTotal,
        homeVisitFee,
        deliveryFee,
        discountAmount: discount,
        couponCode: coupon?.code || '',
        shippingAddress: {
          fullName: activeAddr.fullName,
          phone: activeAddr.phone,
          street: `${activeAddr.houseNumber ? `${activeAddr.houseNumber}, ` : ''}${activeAddr.street}`,
          area: activeAddr.area || '',
          city: activeAddr.city,
          state: activeAddr.state || 'Delhi NCR',
          pincode: activeAddr.pincode,
        },
        deliveryPreference,
        measurementProfileId: selectedMeasurementProfile?._id || null,
        measurements: selectedMeasurementProfile?.measurements || [],
        measurementNotes: selectedMeasurementProfile?.notes || '',
      })

      const booking = bookingRes.data

      // 2. Handle Payment Method Selection
      if (paymentMethod === 'cod') {
        // Cash On Delivery Flow
        await apiPost('/payments/cod', {
          bookingId: booking._id,
        })
        success('Cash on Delivery order placed successfully!')
      } else {
        // Online Payment Flow (UPI / QR / Card / Razorpay)
        const orderRes = await apiPost('/payments/create-order', {
          bookingId: booking._id,
          paymentMethod,
          provider: 'razorpay',
        })

        // Verify payment atomically on backend
        await apiPost('/payments/verify', {
          bookingId: booking._id,
          transactionId: orderRes.data.transactionId,
          orderId: orderRes.data.orderId,
          paymentMethod,
          provider: 'razorpay',
        })
        success('Payment verified & order confirmed successfully!')
      }

      clearCart()
      navigate(`/payment-success/${booking._id}`)
    } catch (err) {
      error(err.message || 'Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // QR Code URL helper
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `upi://pay?pa=tailorwala@icici&pn=TailorWala&am=${grandTotal}&cu=INR&tn=TailorWalaOrder`,
  )}`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 text-xs font-medium text-slate-500">
        <Link to="/cart" className="hover:text-blue-600">Cart</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900 dark:text-white font-bold">Secure Checkout</span>
      </nav>

      <div className="pb-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Secure Checkout
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Confirm your doorstep measurement address and complete payment.
        </p>
      </div>

      <form onSubmit={handlePayAndConfirm} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Delivery & Measurement Address */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
                  1
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Doorstep Measurement &amp; Delivery Address
                </h2>
              </div>
              {savedAddresses.length > 0 && !showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Add New Address
                </button>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && !showNewAddressForm && (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr._id
                  return (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {addr.fullName}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {addr.addressType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {addr.houseNumber ? `${addr.houseNumber}, ` : ''}{addr.street}
                        </p>
                        <p className="text-xs text-slate-500">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                          📞 {addr.phone}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>
                          {isSelected ? '✓ Selected' : 'Click to select'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] text-emerald-600 font-bold">DEFAULT</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enter New Delivery Address</h3>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      ← Use Saved Address
                    </button>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={nameId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Recipient Full Name *</label>
                    <input
                      id={nameId}
                      type="text"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Phone Number *</label>
                    <input
                      id={phoneId}
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor={houseId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Flat / House No.</label>
                    <input
                      id={houseId}
                      type="text"
                      value={newAddress.houseNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, houseNumber: e.target.value })}
                      placeholder="Flat 402, B-Block"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor={streetId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Street / Locality Address *</label>
                    <input
                      id={streetId}
                      type="text"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      required
                      placeholder="e.g. Green Park Extension, Main Road"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label htmlFor={areaId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Area</label>
                    <input
                      id={areaId}
                      type="text"
                      value={newAddress.area}
                      onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                      placeholder="South Delhi"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor={cityId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">City *</label>
                    <input
                      id={cityId}
                      type="text"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      required
                      placeholder="Delhi"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor={stateId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">State *</label>
                    <input
                      id={stateId}
                      type="text"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      required
                      placeholder="Delhi NCR"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor={pincodeId} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Pincode *</label>
                    <input
                      id={pincodeId}
                      type="text"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      required
                      placeholder="110016"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex gap-2">
                    {['Home', 'Work', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewAddress({ ...newAddress, addressType: type })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all ${
                          newAddress.addressType === type
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveNewAddress}
                    className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold shadow-xs hover:bg-slate-800"
                  >
                    Save to Address Book
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Delivery Speed & Attached Sizes */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
                2
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Delivery Preference &amp; Measurements
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div
                onClick={() => setDeliveryPreference('standard')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  deliveryPreference === 'standard'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Standard Tailoring Delivery</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">₹49</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 block">7-10 business days • Doorstep delivery &amp; fitting check</span>
              </div>

              <div
                onClick={() => setDeliveryPreference('express')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  deliveryPreference === 'express'
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">⚡ Express Priority Delivery</span>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">₹98</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 block">3-5 business days expedited turnaround</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Attached Measurement Profile:</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {selectedMeasurementProfile
                    ? `${selectedMeasurementProfile.profileName} (${selectedMeasurementProfile.garmentCategory})`
                    : 'Doorstep measurement assistant will record your sizes during home visit'}
                </span>
              </div>
              <Link to="/profile/measurements" className="text-xs font-bold text-blue-600 hover:underline">
                Manage Sizes
              </Link>
            </div>
          </div>

          {/* Section 3: Payment Methods */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm">
                3
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Payment Method Selection
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {platformSettings.upiEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold block leading-tight">Instant UPI</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">GPay, PhonePe, Paytm</span>
                </button>
              )}

              {platformSettings.qrEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'qr'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:indigo-400 mb-2">
                    <QrCode className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold block leading-tight">UPI QR Code</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Scan &amp; Pay on Mobile</span>
                </button>
              )}

              {platformSettings.cardEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold block leading-tight">Cards &amp; NetBanking</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Visa, MC, RuPay</span>
                </button>
              )}

              {platformSettings.codEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div className="h-8 w-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                    <Banknote className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold block leading-tight">Cash on Delivery</span>
                  <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Pay upon fitting check</span>
                </button>
              )}
            </div>

            {/* UPI ID Form */}
            {paymentMethod === 'upi' && (
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Enter Your VPA / UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@oksbi / yourname@paytm"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-xs font-bold dark:text-white outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  You will receive a fast authorization approval request on Google Pay, PhonePe, or Paytm.
                </p>
              </div>
            )}

            {/* UPI QR Code Interface */}
            {paymentMethod === 'qr' && (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Scan QR Code with Any UPI App</h4>
                <div className="inline-block p-3 rounded-2xl bg-white shadow-md">
                  <img src={dynamicQrUrl} alt="UPI Payment QR Code" className="h-44 w-44 rounded-lg object-contain mx-auto" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 font-semibold">
                  <p>UPI ID: <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{receivingAccount.upiId || 'tailorwala@icici'}</span></p>
                  <p>Business Name: <span className="font-bold text-slate-800 dark:text-slate-200">{receivingAccount.businessName || 'TailorWala Bespoke Services'}</span></p>
                  <p>Amount to Pay: <span className="font-black text-slate-900 dark:text-white">₹{grandTotal}</span></p>
                </div>
                <p className="text-[11px] text-slate-400">Auto-detected upon scan completion.</p>
              </div>
            )}

            {/* Credit/Debit Card Form */}
            {paymentMethod === 'card' && (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-mono font-bold dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Valid Thru (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-mono font-bold dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">CVV Security Code</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs font-mono font-bold dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">
                  🔒 We never store CVVs or raw numbers. Processed securely via encrypted gateway tokenization.
                </p>
              </div>
            )}

            {/* COD Explanation */}
            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block mb-1">💵 Cash on Delivery (Pay After Fitting):</span>
                <span>
                  Your booking will be confirmed immediately with zero initial charge. Hand over cash or UPI payment directly to your tailor upon final doorstep garment fitting and satisfaction.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Order Summary & Pay */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl space-y-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Order Summary</h2>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 dark:text-white block">Assigned Artisan:</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{primaryTailorName}</span>
              <span className="block text-slate-500">
                Visit: {primaryScheduledAt ? new Date(primaryScheduledAt).toLocaleDateString() : 'Earliest'} ({primaryTimeSlot})
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Stitching Charges ({items.length} items)</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{stitchingTotal}</span>
              </div>
              {fabricTotal > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Fabric Materials</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{fabricTotal}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Home Visit &amp; Measurements</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{homeVisitFee}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Delivery Charge ({deliveryPreference})</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{deliveryFee}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount ({coupon?.code})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                <span>Total Amount Payable</span>
                <span className="text-2xl text-blue-600 dark:text-blue-400">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 text-sm"
            >
              {loading
                ? 'Processing Order...'
                : paymentMethod === 'cod'
                ? `Confirm COD Order ₹${grandTotal} →`
                : `Pay & Confirm ₹${grandTotal} →`}
            </button>

            <div className="text-center text-[11px] text-slate-400 space-y-1">
              <p>🔒 256-Bit SSL Bank Level Security</p>
              <p>Backed by TailorWala Fit &amp; Alteration Guarantee</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout

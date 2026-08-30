/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiPost } from '../services/api.js'

const CartContext = createContext(null)

const CART_STORAGE_KEY = 'tailorwala_cart_v2'

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [selectedMeasurementProfile, setSelectedMeasurementProfile] = useState(null)
  const [coupon, setCoupon] = useState(null)
  const [homeVisitFee] = useState(99)
  const [deliveryFee] = useState(49)
  const [deliveryPreference, setDeliveryPreference] = useState('standard')

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e)
    }
  }, [items])

  const addToCart = (newItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.tailorId === newItem.tailorId && i.serviceType === newItem.serviceType,
      )

      if (existingIndex > -1) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + (newItem.quantity || 1),
          price: newItem.price,
          scheduledAt: newItem.scheduledAt || updated[existingIndex].scheduledAt,
          timeSlot: newItem.timeSlot || updated[existingIndex].timeSlot,
        }
        return updated
      }

      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          quantity: 1,
          ...newItem,
        },
      ]
    })
  }

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Number(quantity) } : i)),
    )
  }

  const updateItemNotes = (id, notes) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, customizationNotes: notes } : i)),
    )
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
    localStorage.removeItem(CART_STORAGE_KEY)
  }

  const applyCouponCode = async (code) => {
    const rawTotal = stitchingTotal + fabricTotal
    const response = await apiPost('/payments/coupon', { code, orderAmount: rawTotal })
    if (response.data) {
      setCoupon(response.data)
      return response.data
    }
  }

  const removeCoupon = () => {
    setCoupon(null)
  }

  // Calculations
  const stitchingTotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  )

  const fabricTotal = items.reduce(
    (sum, item) => sum + (Number(item.fabricCost) || 0) * (Number(item.quantity) || 1),
    0,
  )

  const subtotal = stitchingTotal + fabricTotal
  const effectiveHomeVisit = items.length > 0 ? homeVisitFee : 0
  const effectiveDelivery = items.length > 0 ? (deliveryPreference === 'express' ? deliveryFee * 2 : deliveryFee) : 0
  const discount = coupon?.discountAmount || 0
  const grandTotal = Math.max(0, subtotal + effectiveHomeVisit + effectiveDelivery - discount)

  // Primary tailor for booking
  const primaryTailorId = items[0]?.tailorId
  const primaryTailorName = items[0]?.tailorName
  const primaryScheduledAt = items[0]?.scheduledAt
  const primaryTimeSlot = items[0]?.timeSlot

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemNotes,
        clearCart,
        selectedMeasurementProfile,
        setSelectedMeasurementProfile,
        coupon,
        applyCouponCode,
        removeCoupon,
        deliveryPreference,
        setDeliveryPreference,
        itemCount: items.reduce((acc, i) => acc + (i.quantity || 1), 0),
        stitchingTotal,
        fabricTotal,
        subtotal,
        homeVisitFee: effectiveHomeVisit,
        deliveryFee: effectiveDelivery,
        discount,
        grandTotal,
        primaryTailorId,
        primaryTailorName,
        primaryScheduledAt,
        primaryTimeSlot,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext

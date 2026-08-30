export const ORDER_STATUSES = [
  'pending',
  'accepted',
  'measurement_required',
  'fabric_selected',
  'in_progress',
  'stitching',
  'quality_check',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export const STATUS_LABELS = {
  pending: 'Pending Confirmation',
  accepted: 'Order Accepted',
  measurement_required: 'Measurement Required',
  fabric_selected: 'Fabric Selected',
  in_progress: 'In Progress',
  stitching: 'Stitching in Progress',
  quality_check: 'Quality Check',
  ready: 'Ready for Dispatch',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

// Map allowed transitions for tailors and customers
export const ALLOWED_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['measurement_required', 'fabric_selected', 'in_progress', 'cancelled'],
  measurement_required: ['fabric_selected', 'in_progress', 'stitching', 'cancelled'],
  fabric_selected: ['in_progress', 'stitching', 'cancelled'],
  in_progress: ['stitching', 'quality_check', 'cancelled'],
  stitching: ['quality_check', 'ready', 'cancelled'],
  quality_check: ['ready', 'stitching', 'cancelled'],
  ready: ['out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export const isValidTransition = (currentStatus, nextStatus, role = 'tailor') => {
  if (role === 'admin') return true // Admins can override in case of disputes
  if (!ALLOWED_TRANSITIONS[currentStatus]) return false
  return ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)
}

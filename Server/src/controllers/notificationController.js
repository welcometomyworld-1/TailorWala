import Notification from '../models/Notification.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const getMyNotifications = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(30)

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  })

  res.status(200).json({
    status: 'success',
    unreadCount,
    count: notifications.length,
    data: notifications,
  })
})

export const markNotificationAsRead = catchAsync(async (req, res, next) => {
  if (req.params.id === 'all') {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true })
    return res.status(200).json({ status: 'success', message: 'All marked as read' })
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true },
  )

  if (!notification) {
    return next(new AppError('Notification not found', 404))
  }

  res.status(200).json({
    status: 'success',
    data: notification,
  })
})

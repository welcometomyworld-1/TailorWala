import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiGet, apiPatch } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  const loadNotifications = React.useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await apiGet('/notifications')
      setNotifications(res.data || [])
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen, loadNotifications])

  const markAsRead = async (id) => {
    try {
      await apiPatch(`/notifications/${id}/read`, {})
      setNotifications((prev) =>
        id === 'all'
          ? prev.map((n) => ({ ...n, isRead: true }))
          : prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      )
    } catch (e) {
      console.warn('Failed to mark read', e)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Notifications</h3>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <span className="rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 font-bold">
                {notifications.filter((n) => !n.isRead).length} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => markAsRead('all')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-sm text-slate-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <span className="text-4xl block">🔔</span>
              <p className="font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500">No new notifications at this time.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                onClick={() => !n.isRead && markAsRead(n._id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.isRead
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    : 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-slate-900 dark:text-slate-100 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-sm">{n.title}</h4>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed">{n.message}</p>
                {n.link && (
                  <Link
                    to={n.link}
                    onClick={onClose}
                    className="inline-block mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Details →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationDrawer

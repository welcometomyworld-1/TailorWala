import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import AppError from '../utils/AppError.js'
import catchAsync from '../utils/catchAsync.js'

export const protect = catchAsync(async (req, res, next) => {
  let token = null

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to gain access.', 401))
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'tailorwala-jwt-secret-secure-key'
  
  let decoded
  try {
    decoded = jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token. Please log in again.', 401))
  }

  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401))
  }

  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 403))
  }

  // Token version verification (supports logout from all sessions)
  if (
    decoded.tokenVersion !== undefined &&
    currentUser.tokenVersion !== undefined &&
    decoded.tokenVersion !== currentUser.tokenVersion
  ) {
    return next(new AppError('Your session has expired. Please log in again.', 401))
  }

  req.user = currentUser
  next()
})

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Treat 'super_admin' as having access to any 'admin' role routes
    const userRole = req.user?.role
    const hasRole =
      roles.includes(userRole) ||
      (userRole === 'super_admin' && roles.includes('admin')) ||
      (userRole === 'admin' && roles.includes('employee'))

    if (!req.user || !hasRole) {
      return next(new AppError('You do not have permission to perform this action.', 403))
    }
    next()
  }
}

// Granular permission check for Employees & Admins
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    const user = req.user
    if (!user) {
      return next(new AppError('Unauthorized. Please log in.', 401))
    }

    // Super Admin & Admin have full master permissions
    if (user.role === 'super_admin' || user.role === 'admin') {
      return next()
    }

    // Employees must have at least one of the required permissions
    if (user.role === 'employee') {
      const userPermissions = user.permissions || []
      const hasPermission = requiredPermissions.some((p) => userPermissions.includes(p))
      if (!hasPermission) {
        return next(
          new AppError(
            "You don't have permission to access this section.",
            403,
          ),
        )
      }
      return next()
    }

    return next(new AppError("You don't have permission to access this section.", 403))
  }
}

// Guard preventing normal Admin from modifying or deleting Super Admin
export const protectSuperAdminTarget = (targetUser, actingUser) => {
  if (
    (targetUser.role === 'super_admin' || targetUser.email === 'admin@tailorwala.com') &&
    actingUser.role !== 'super_admin' &&
    actingUser._id.toString() !== targetUser._id.toString()
  ) {
    throw new AppError(
      'Security Policy: Super Admin accounts cannot be suspended, deactivated, or deleted by standard administrators.',
      403,
    )
  }
}

export default protect

# TailorWala Platform — Complete Audit, Refactoring & Feature Expansion Plan

This implementation plan provides a comprehensive strategy to audit, debug, refactor, expand, and modernize the **TailorWala** full-stack online custom tailoring platform.

---

## Executive Summary & Audit Findings

During our full repository audit across backend, frontend, models, API routes, security, and UI/UX, we identified several critical bugs, architectural gaps, and missing features:

### 1. Critical Backend & Runtime Issues
- **ES Module Crash**: `Server/src/app.js` calls `require('mongoose')` on line 28 in an ES Module (`"type": "module"`), crashing any call to `/health`.
- **Insecure Mock Authentication Bypasses**: `Server/src/middleware/auth.js` and `Server/src/controllers/authController.js` accept arbitrary `mock-` and `demo-` tokens, generating fake users and bypassing DB authentication.
- **Missing Role Support**: `User.js` model only supports `['customer', 'tailor']`, missing the required `admin` role.
- **Unverified Payment & Direct Frontend Manipulation**: Frontend directly calls `/api/bookings/:id/mark-paid` without backend order generation, signature verification, or payment gateway abstraction.
- **Unstructured Error Handling**: Missing centralized `AppError` class, no async wrapper (`catchAsync`), unhandled exceptions, and no graceful shutdown for MongoDB and Express.
- **Inconsistent Config Keys**: `.env` uses `MAIL_HOST`/`MAIL_PORT` while `sendEmail.js` checks `process.env.EMAIL_HOST`/`EMAIL_PORT`.

### 2. Duplicate & Conflicting Files
- `Client/src/context/AuthContext.jsx [NEW]` & `Client/src/context/CartContext.jsx [NEW]` are conflicting duplicates.
- `Client/src/context.jsx` is a legacy monolithic context file duplicating auth and cart.
- `Client/src/pages/Offers.jsx` vs `Client/src/pages/OffersPage.jsx` are duplicate pages.
- `Client/src/pages/TailorProfile.jsx` (Tailor detail page) vs `TailorProfilePage.jsx` (Tailor profile settings) had confusing names and fragmented implementations.

### 3. Missing Core Features & Architectural Gaps
- **Measurement Management**: Currently `MeasurementProfile.jsx` only reads measurements from the previous booking. There is no dedicated `MeasurementProfile` model, CRUD API, or category template support (Male: Shirt, Pant, Suit, Kurta, Sherwani; Female: Blouse, Suit, Lehenga, Dress).
- **Full Order Lifecycle & Timeline**: Booking statuses do not follow the strict 11-stage workflow (`pending` → `accepted` → `measurement_required` → `fabric_selected` → `in_progress` → `stitching` → `quality_check` → `ready` → `out_for_delivery` → `delivered` / `cancelled`), and there is no audit log / timeline tracking per transition.
- **Admin Dashboard & Role Protection**: Admin dashboard is completely absent. Platform statistics, tailor approval/rejection, user moderation, order oversight, and review moderation are missing.
- **Cart & Checkout Architecture**: `CartContext` only held a single item without persistent multi-item support, fabric selection, measurement profile assignment, promo code verification, or breakdown calculations.
- **Review & Rating System**: Lacks a dedicated `Review` model with customer verification (only delivered orders), one-review-per-order rule, tailor replies, and rating recalculation.
- **Notification System**: Missing backend notification data model and in-app notification bell/drawer.
- **Brand Inconsistency**: Header showed `BTechTailors` and auth pages showed `TailorOnDemand` instead of the official **TailorWala** brand.

---

## User Review Required

> [!IMPORTANT]
> **Production Security**: All insecure automatic mock authentication and fake token bypasses will be removed in favor of clean JWT authentication, bcrypt password hashing, and role-based route protection.
> 
> **Database Seed & Demo Accounts**: To ensure seamless evaluation and immediate testing without manual setup, we will create robust database seeding scripts and automatic initial demo users (`admin@tailorwala.com`, `tailor@tailorwala.com`, `customer@tailorwala.com` with preloaded tailor profiles, measurement profiles, orders, and fabrics).
> 
> **Payment System**: A secure abstraction layer with backend order creation and signature verification will be implemented with standard support for Razorpay, Stripe, and a Secure Mock Gateway for offline/development testing.

---

## Proposed Architecture & File Changes

```
tailorwalabtech-main/
├── Server/
│   ├── src/
│   │   ├── config/             # DB connection, environment validation, constants
│   │   ├── controllers/        # auth, tailor, booking, measurement, payment, review, admin, cloth, notification
│   │   ├── middleware/         # auth (JWT), role authorization, error handler, rate limiter, validation
│   │   ├── models/             # User, TailorProfile, Cloth, Booking, MeasurementProfile, Payment, Review, Notification, Coupon
│   │   ├── routes/             # auth, tailors, bookings, measurements, payments, reviews, admin, cloths, notifications
│   │   ├── services/           # paymentService, emailService, notificationService
│   │   ├── utils/              # AppError, catchAsync, statusMachine, seedData
│   │   ├── app.js              # Express app configuration with Helmet, CORS, rate limiting
│   │   └── server.js           # Server bootstrap with graceful shutdown & health monitor
│   └── .env.example
└── Client/
    ├── src/
    │   ├── components/
    │   │   ├── common/         # ErrorBoundary, Toast, Skeleton, Modal, Badge, RatingStars
    │   │   ├── layout/         # Header, Footer, AdminSidebar, TailorSidebar, NotificationBell
    │   │   ├── booking/        # OrderTimeline, StatusBadge, MeasurementForm
    │   │   └── tailor/         # TailorCard, PortfolioGallery, SlotPicker
    │   ├── context/            # AuthContext, CartContext, ThemeContext, ToastContext
    │   ├── pages/
    │   │   ├── customer/       # TailorSearch, TailorDetail, MeasurementProfiles, Cart, Checkout, MyBookings, BookingDetail, RateOrder
    │   │   ├── tailor/         # TailorDashboard, TailorProfileSettings, TailorEarnings, TailorBookings, TailorServices
    │   │   ├── admin/          # AdminDashboard, AdminUsers, AdminTailors, AdminBookings, AdminReviews, AdminCoupons
    │   │   └── public/         # Home, About, Contact, HelpCenter, Safety, Offers, PrivacyPolicy, Terms, Auth, ForgotPassword, ResetPassword
    │   ├── services/           # api.js (centralized Axios with interceptors, timeouts, 401 handling)
    │   └── utils/              # formatters, validators, constants
    └── .env.example
```

---

## Detailed Component Changes

### 1. Server Core & Database

#### [MODIFY] [Server/src/app.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/app.js)
- Fix ES Module import of Mongoose (remove CommonJS `require`).
- Implement Helmet security headers, rate limiting (`express-rate-limit`), JSON body parser with size limits.
- Wire up all routes: `/api/auth`, `/api/tailors`, `/api/bookings`, `/api/measurements`, `/api/payments`, `/api/reviews`, `/api/admin`, `/api/cloths`, `/api/notifications`.
- Upgrade `/health` endpoint to return server status, database connection state, uptime, memory, timestamp, and environment.
- Centralize 404 handler and global error middleware.

#### [MODIFY] [Server/src/config/db.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/config/db.js)
- Validate `MONGO_URI`.
- Add event listeners for `connected`, `error`, `disconnected`, and `reconnected`.
- Implement graceful disconnect function for shutdown.

#### [MODIFY] [Server/src/server.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/server.js)
- Handle `SIGINT` and `SIGTERM` signals for graceful shutdown of HTTP server and DB connections.
- Validate critical environment variables before starting.

---

### 2. Backend Models

#### [MODIFY] [Server/src/models/User.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/User.js)
- Add `admin` to role enum: `['customer', 'tailor', 'admin']`.
- Add fields: `avatar`, `isActive`, `lastLogin`, `resetPasswordToken`, `resetPasswordExpires`.
- Add Mongoose methods for password comparison and hashing hooks.

#### [MODIFY] [Server/src/models/TailorProfile.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/TailorProfile.js)
- Expand schema: `shopName`, `tagline`, `servicesOffered` (name, price, turnaroundDays, description), `portfolio` (images with captions), `workingHours`, `availableDays`, `homeVisitAvailable`, `homeVisitFee`, `isApproved` (for admin moderation), `verificationBadge`, `completedOrdersCount`.

#### [MODIFY] [Server/src/models/Booking.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/Booking.js)
- Update status enum to 11 lifecycle stages:
  `['pending', 'accepted', 'measurement_required', 'fabric_selected', 'in_progress', 'stitching', 'quality_check', 'ready', 'out_for_delivery', 'delivered', 'cancelled']`.
- Add `timeline` array: `[{ status, previousStatus, updatedBy, role, timestamp, note }]`.
- Add `items` array, `measurementProfile` reference and snapshot, `shippingAddress`, `deliveryPreference`, `paymentMethod`, `paymentTransactionId`, `couponApplied`, `discountAmount`.

#### [NEW] [Server/src/models/MeasurementProfile.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/MeasurementProfile.js)
- Schema: `user`, `profileName`, `gender` (`['male', 'female', 'kids', 'unisex']`), `garmentCategory` (`['Shirt', 'Pant', 'Suit', 'Kurta', 'Sherwani', 'Blouse', 'Lehenga', 'Dress', 'Other']`), `measurements` (`[{ name, value, unit }]`), `height`, `weight`, `fitPreference` (`['slim', 'regular', 'loose']`), `notes`, `isDefault`.

#### [NEW] [Server/src/models/Payment.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/Payment.js)
- Schema: `booking`, `user`, `amount`, `currency`, `provider` (`['mock', 'razorpay', 'stripe']`), `status` (`['pending', 'paid', 'failed', 'refunded']`), `paymentMethod`, `transactionId`, `orderId`, `signature`, `receiptUrl`, `notes`.

#### [NEW] [Server/src/models/Review.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/Review.js)
- Schema: `booking`, `customer`, `tailor`, `rating` (1-5), `comment`, `images`, `tailorReply`, `isApproved`, `isFlagged`.

#### [NEW] [Server/src/models/Notification.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/Notification.js)
- Schema: `recipient`, `sender`, `title`, `message`, `type`, `link`, `isRead`, `metadata`.

#### [NEW] [Server/src/models/Coupon.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/models/Coupon.js)
- Schema: `code`, `discountType` (`['percentage', 'flat']`), `discountValue`, `minOrderValue`, `maxDiscount`, `expiryDate`, `isActive`, `usageLimit`.

---

### 3. Backend Middleware & Utilities

#### [MODIFY] [Server/src/middleware/auth.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/middleware/auth.js)
- Remove insecure mock token maps and bypass logic.
- Verify JWT cleanly, fetch user from DB, attach to `req.user`.
- Export `protect` and `restrictTo(...roles)` for clean role authorization (`restrictTo('admin')`, `restrictTo('tailor')`, `restrictTo('customer')`).

#### [NEW] [Server/src/utils/AppError.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/utils/AppError.js)
- Standardized operational error class with status code, message, and error details.

#### [NEW] [Server/src/utils/catchAsync.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/utils/catchAsync.js)
- Clean wrapper for asynchronous Express controller handlers.

#### [NEW] [Server/src/middleware/errorHandler.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/middleware/errorHandler.js)
- Centralized error response formatter handling CastError, ValidationError, duplicate key errors (11000), JWT expired errors, and AppErrors.

#### [NEW] [Server/src/utils/statusTransition.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/utils/statusTransition.js)
- State machine validator ensuring only legal status transitions are permitted by tailors/customers/admins.

---

### 4. Backend Controllers & Routes

#### [MODIFY] [Server/src/controllers/authController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/authController.js) & [authRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/authRoutes.js)
- Refactor register, login, getMe, forgotPassword, resetPassword, updateProfile, changePassword.
- Add admin seed initialization check.

#### [MODIFY] [Server/src/controllers/tailorController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/tailorController.js) & [tailorRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/tailorRoutes.js)
- Expand `listTailors` with multi-facet query filtering (city, area, pincode, categories, rating, price range, home visit), sorting options (recommended, rating, price asc/desc, delivery time), pagination.
- Add `getTailorById`, `updateMyProfile`, `getTailorEarnings` with monthly/weekly chart breakdown, `getTailorReviews`.

#### [MODIFY] [Server/src/controllers/bookingController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/bookingController.js) & [bookingRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/bookingRoutes.js)
- Handle full booking lifecycle, status timeline logging, measurement updates, cancellation with role constraints.

#### [NEW] [Server/src/controllers/measurementController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/measurementController.js) & [measurementRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/measurementRoutes.js)
- CRUD operations for user measurement profiles + duplication + templates.

#### [NEW] [Server/src/controllers/paymentController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/paymentController.js) & [paymentRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/paymentRoutes.js)
- Order initialization, signature/gateway verification, webhook endpoint, payment history.

#### [NEW] [Server/src/controllers/reviewController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/reviewController.js) & [reviewRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/reviewRoutes.js)
- Verified review creation, tailor replies, average rating recalculation.

#### [NEW] [Server/src/controllers/adminController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/adminController.js) & [adminRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/adminRoutes.js)
- Platform stats, user management, tailor verification/approval, platform-wide booking & review moderation, coupon management.

#### [NEW] [Server/src/controllers/notificationController.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/controllers/notificationController.js) & [notificationRoutes.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Server/src/routes/notificationRoutes.js)
- In-app notification retrieval, mark-as-read, unread count.

---

### 5. Frontend Clean-Up, Services & State Management

#### [DELETE] Duplicate & conflicting files:
- `Client/src/context/AuthContext.jsx [NEW]`
- `Client/src/context/CartContext.jsx [NEW]`
- `Client/src/context.jsx`
- `Client/src/pages/Offers.jsx` (consolidated into `OffersPage.jsx`)

#### [MODIFY] [Client/src/services/api.js](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/services/api.js)
- Implement `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete` with Axios instance, timeouts, authorization header injection, 401 interceptor with session expiration event, standardized error messages.

#### [MODIFY] [Client/src/context/AuthContext.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/context/AuthContext.jsx)
- Support login, register, logout, updateProfile, restore session on page reload, handle token expiry, role checks (`isCustomer`, `isTailor`, `isAdmin`).

#### [MODIFY] [Client/src/context/CartContext.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/context/CartContext.jsx)
- Multi-item cart state, quantity updates, measurement profile association, notes, promo code discount calculation, home visit fee handling, localStorage synchronization.

#### [NEW] [Client/src/context/ToastContext.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/context/ToastContext.jsx)
- Global toast notifications (success, error, info, warning) for user feedback.

---

### 6. Frontend UI Components & Pages

#### [MODIFY] [Client/src/components/Header.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/components/Header.jsx) & [Footer.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/components/Footer.jsx)
- Align branding with **TailorWala**.
- Add notification drawer/bell, cart count badge, dynamic role-based navigation (Customer links, Tailor links, Admin links).
- Premium header layout with sticky glassmorphism and theme toggle.

#### [MODIFY] [Client/src/pages/TailorSearch.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/TailorSearch.jsx)
- Rich filters: city, specialization, price slider, rating radio, home visit toggle.
- Sorting: Recommended, Top Rated, Price Low-High, Price High-Low, Fastest Delivery.
- Skeleton loader state and polished empty state.

#### [MODIFY] [Client/src/pages/TailorProfile.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/TailorProfile.jsx)
- Full tailor portfolio, services pricing list, real customer reviews, calendar date & slot selector, home visit booking configuration.

#### [MODIFY] [Client/src/pages/MeasurementProfile.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/MeasurementProfile.jsx)
- Complete CRUD interface for garment-specific measurement profiles (Male: Shirt, Pant, Suit, Kurta, Sherwani; Female: Blouse, Suit, Lehenga, Dress).
- Create, edit, duplicate, set default, delete, body diagram guidance.

#### [MODIFY] [Client/src/pages/Cart.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/Cart.jsx) & [Checkout.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/Checkout.jsx)
- Multi-item management, measurement profile selector, coupon code validator, full address entry, payment method picker (UPI, Card, NetBanking, COD, Mock/Dev gateway), backend order creation and verification.

#### [MODIFY] [Client/src/pages/MyBookings.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/MyBookings.jsx) & [BookingDetail.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/BookingDetail.jsx)
- 11-step interactive progress timeline, status updates, invoice download/summary, measurement sheet display, action buttons (pay, rate, contact).

#### [MODIFY] [Client/src/pages/TailorDashboard.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/TailorDashboard.jsx) & [TailorEarnings.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/TailorEarnings.jsx)
- Overview KPI cards, booking management with permitted status transitions, customer measurement entry sheet during home visit, earnings analytics with weekly/monthly charts.

#### [NEW] [Client/src/pages/admin/AdminDashboard.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/pages/admin/AdminDashboard.jsx)
- Admin portal with platform statistics, user management, tailor verification, platform-wide booking tracking, review moderation, coupon creation.

#### [NEW] [Client/src/components/common/ErrorBoundary.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/components/common/ErrorBoundary.jsx)
- React Error Boundary for graceful UI error fallback.

#### [MODIFY] [Client/src/App.jsx](file:///c:/Users/MSI-1/Desktop/docments/final%20project/tailorwalabtech-updated%20(1)/tailorwalabtech-main/Client/src/App.jsx)
- Update routes with code splitting (`React.lazy` / `Suspense`), role-based protection for Customer, Tailor, and Admin, error boundary and toast provider wrapping.

---

## Verification Plan

### Automated Verification
1. **Node.js Environment & Build Validation**:
   - `cd Server && npm test` (or automated health check & unit integration script)
   - `cd Client && npm run build` (verify Vite production bundle compiles cleanly with 0 errors)
   - `cd Client && npm run lint` (verify code passes ESLint)
2. **Backend API End-to-End Test Script**:
   - Create and run a comprehensive verification suite testing:
     - Health check (`/health`)
     - User registration & login (Customer, Tailor, Admin)
     - Protected route authorization & 401/403 rejections
     - Tailor profile creation & search filters
     - Measurement profile CRUD
     - Booking creation & valid status transitions
     - Payment creation & verification
     - Review submission & tailor rating recalculation
     - Admin dashboard analytics & moderation endpoints

### Manual & UI Verification
1. **Customer Flow**: Register → Search tailors with filters → View tailor profile → Configure garment & home visit → Add to cart → Select measurement profile → Checkout with mock payment → View order tracking timeline → Submit review upon completion.
2. **Tailor Flow**: Log in as Tailor → Update shop profile & pricing → View incoming bookings in Tailor Dashboard → Update order status step-by-step → Record customer measurements → Check earnings & analytics.
3. **Admin Flow**: Log in as Admin → Access Admin Dashboard → Inspect platform stats → Approve/verify tailor accounts → Moderate reviews and manage coupons.
4. **Theme & Responsiveness**: Test mobile drawer, tablet, and desktop views across light and dark modes.

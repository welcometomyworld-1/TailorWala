import React, { Suspense, lazy } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'

import { Header } from './components/Header.jsx'
import { Footer } from './components/Footer.jsx'
import { WhatsAppButton } from './components/WhatsAppButton.jsx'
import { ScrollToTop } from './components/ScrollToTop.jsx'

// Lazy-loaded Pages for performance & code-splitting
const Home = lazy(() => import('./pages/Home.jsx').then((m) => ({ default: m.Home })))
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx').then((m) => ({ default: m.HowItWorks })))
const TailorSearch = lazy(() => import('./pages/TailorSearch.jsx').then((m) => ({ default: m.TailorSearch })))
const TailorDetailPage = lazy(() => import('./pages/TailorProfile.jsx').then((m) => ({ default: m.TailorDetailPage })))
const Cart = lazy(() => import('./pages/Cart.jsx').then((m) => ({ default: m.Cart })))
const Checkout = lazy(() => import('./pages/Checkout.jsx').then((m) => ({ default: m.Checkout })))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess.jsx').then((m) => ({ default: m.PaymentSuccess })))
const MyBookings = lazy(() => import('./pages/MyBookings.jsx').then((m) => ({ default: m.MyBookings })))
const BookingDetail = lazy(() => import('./pages/BookingDetail.jsx').then((m) => ({ default: m.BookingDetail })))
const RateExperience = lazy(() => import('./pages/RateExperience.jsx').then((m) => ({ default: m.RateExperience })))
const MeasurementProfile = lazy(() => import('./pages/MeasurementProfile.jsx').then((m) => ({ default: m.MeasurementProfile })))
const OffersPage = lazy(() => import('./pages/OffersPage.jsx').then((m) => ({ default: m.OffersPage })))
const AboutPage = lazy(() => import('./pages/AboutPage.jsx').then((m) => ({ default: m.AboutPage })))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx').then((m) => ({ default: m.ContactPage })))
const HelpCenterPage = lazy(() => import('./pages/HelpCenterPage.jsx').then((m) => ({ default: m.HelpCenterPage })))
const SafetyPage = lazy(() => import('./pages/SafetyPage.jsx').then((m) => ({ default: m.SafetyPage })))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx').then((m) => ({ default: m.PrivacyPolicyPage })))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage.jsx').then((m) => ({ default: m.TermsOfServicePage })))
const CareersPage = lazy(() => import('./pages/CareersPage.jsx').then((m) => ({ default: m.CareersPage })))
const IdVerificationPage = lazy(() => import('./pages/IdVerificationPage.jsx').then((m) => ({ default: m.IdVerificationPage })))
const AuthPage = lazy(() => import('./pages/AuthPage.jsx').then((m) => ({ default: m.AuthPage })))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx').then((m) => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx').then((m) => ({ default: m.ResetPassword })))

// Tailor Pages
const TailorDashboard = lazy(() => import('./pages/TailorDashboard.jsx').then((m) => ({ default: m.TailorDashboard })))
const TailorProfilePage = lazy(() => import('./pages/TailorProfilePage.jsx').then((m) => ({ default: m.TailorProfilePage })))
const TailorEarnings = lazy(() => import('./pages/TailorEarnings.jsx').then((m) => ({ default: m.TailorEarnings })))
const TailorOnboarding = lazy(() => import('./pages/TailorOnboarding.jsx').then((m) => ({ default: m.TailorOnboarding })))

// Employee & Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx').then((m) => ({ default: m.AdminDashboard })))
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard.jsx').then((m) => ({ default: m.EmployeeDashboard })))

// Dispatcher that ensures Employees only get EmployeeDashboard even on /admin
const AdminPortalDispatcher = () => {
  const { user } = useAuth()
  if (user?.role === 'employee') {
    return <EmployeeDashboard />
  }
  return <AdminDashboard />
}

const LoadingFallback = () => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center text-slate-500 text-sm font-semibold">
    <div className="animate-spin text-4xl mb-3">✂️</div>
    <p>Loading view...</p>
  </div>
)

const ProtectedRoute = ({ children, role, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingFallback />
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: window.location.pathname }} replace />
  }

  const isAdminRole = user.role === 'admin' || user.role === 'super_admin' || user.role === 'employee'

  if (role === 'admin' && !isAdminRole) {
    return <Navigate to="/" replace />
  }

  if (role && role !== 'admin' && user.role !== role && !isAdminRole) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && !isAdminRole) {
    return <Navigate to="/" replace />
  }

  return children
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <Router>
                <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors selection:bg-blue-600 selection:text-white">
                  <Header />
                  <main className="flex-1">
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/how-it-works" element={<HowItWorks />} />
                        <Route path="/search" element={<TailorSearch />} />
                        <Route path="/tailor/:id" element={<TailorDetailPage />} />
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/offers" element={<OffersPage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/help" element={<HelpCenterPage />} />
                        <Route path="/safety" element={<SafetyPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms" element={<TermsOfServicePage />} />
                        <Route path="/careers" element={<CareersPage />} />
                        <Route path="/verify-id" element={<IdVerificationPage />} />
                        <Route path="/verify-id/:idNumber" element={<IdVerificationPage />} />

                        {/* Customer Routes */}
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/payment-success/:id" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
                        <Route path="/bookings" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><MyBookings /></ProtectedRoute>} />
                        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
                        <Route path="/rate/:id" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><RateExperience /></ProtectedRoute>} />
                        <Route path="/profile/measurements" element={<ProtectedRoute allowedRoles={['customer', 'admin']}><MeasurementProfile /></ProtectedRoute>} />

                        {/* Tailor Partner Routes */}
                        <Route path="/tailor" element={<ProtectedRoute role="tailor"><TailorDashboard /></ProtectedRoute>} />
                        <Route path="/tailor/profile" element={<ProtectedRoute role="tailor"><TailorProfilePage /></ProtectedRoute>} />
                        <Route path="/tailor/earnings" element={<ProtectedRoute role="tailor"><TailorEarnings /></ProtectedRoute>} />
                        <Route path="/tailor/onboarding" element={<ProtectedRoute role="tailor"><TailorOnboarding /></ProtectedRoute>} />

                        {/* Employee & Admin Portal Routes */}
                        <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee', 'admin', 'super_admin']}><EmployeeDashboard /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPortalDispatcher /></ProtectedRoute>} />

                        {/* Fallback 404 Route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                  <WhatsAppButton />
                  <ScrollToTop />
                </div>
              </Router>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App

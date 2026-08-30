# ✂️ TailorWala — On-Demand Custom Tailoring & Bespoke Couture Platform

> **Production-Ready Enterprise Web Platform** connecting discerning customers with master artisan tailors. Featuring doorstep measurements, artisan studio showcases, a complete studio fabric catalog, granular employee permission-based RBAC, double-sided verifiable digital ID cards with public QR verification, multi-channel payments, and instant WhatsApp communication.

---

## 📌 Table of Contents
1. [🌟 Project Overview](#-project-overview)
2. [👥 User Roles & Access Hierarchy](#-user-roles--access-hierarchy)
3. [🔄 System Workflows & How It Works](#-system-workflows--how-it-works)
   - [Customer Journey & Bespoke Ordering](#1-customer-journey--bespoke-ordering)
   - [Studio Fabric & Material Catalog System](#2-studio-fabric--material-catalog-system)
   - [Master Tailor 16-Tab Studio Suite](#3-master-tailor-16-tab-studio-suite)
   - [Employee Permission-Based Dashboard & RBAC](#4-employee-permission-based-dashboard--rbac)
   - [Official Digital ID Card & Public QR Verification](#5-official-digital-id-card--public-qr-verification)
   - [Payment Escrow & Commission Settlement](#6-payment-escrow--commission-settlement)
4. [💻 Technology Stack & Architecture](#-technology-stack--architecture)
5. [📂 Directory & File Structure](#-directory--file-structure)
6. [🔌 Complete REST API Reference Guide](#-complete-rest-api-reference-guide)
7. [🚀 Setup, Installation & Running Guide](#-setup-installation--running-guide)
8. [🔐 Default Credentials & Test Accounts](#-default-credentials--test-accounts)
9. [💬 Direct Communication Integration](#-direct-communication-integration)

---

## 🌟 Project Overview

**TailorWala** transforms traditional bespoke tailoring into a digital-first, transparent, and seamless experience. It addresses common pain points in custom tailoring—improper fits, lack of fabric clarity, untracked delivery timelines, artisan identity verification, and manual cash settlements—by uniting customers, master artisans, operational employees, and administrators onto a single cohesive platform.

### Core Value Propositions:
- 🏡 **Doorstep Measurement & Studio Fitting Visits**: Schedule certified tailoring consultants to capture precision measurements at your home or visit partner ateliers.
- 🧵 **Studio Fabric Catalog**: Browse authentic materials (Egyptian Cotton, Mulberry Silk, Superfine Wool, Linen) uploaded directly by master tailors with price per meter, color, weave, and stock availability.
- 🪡 **9-Stage Order Progression Pipeline**: Real-time status updates from order acceptance through cutting, stitching, quality check, dispatch, and final delivery.
- 🛡️ **Zero-Trust Employee RBAC**: Dynamically render only the specific modules (Orders, Customers, Tailors, Payments, Activity Logs) explicitly authorized by the Super Admin.
- 🪪 **Verifiable Digital ID Badges**: Double-sided 3D security cards with tamper-proof QR codes verifiable on `/verify-id/:idNumber`.
- 💳 **Multi-Channel Payments & Escrow**: Automated 85% artisan payout and 15% platform commission calculation supporting COD, UPI, NetBanking, and Card.
- 💬 **1-Click WhatsApp Direct Chat**: Pre-formatted consultation and order tracking messages connected with official support (`+91 8789682127`).

---

## 👥 User Roles & Access Hierarchy

TailorWala supports 4 distinct user roles with strict backend authorization and dynamic frontend navigation:

```
                                  👑 Super Admin
                           (Full Enterprise Governance)
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
           👤 Staff Employee                       🧵 Master Tailor
   (Permission-Based Scoped Access)           (16-Tab Studio & Fabric Catalog)
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        ▼
                                  🛍️ Customer
                      (Discovery, Fabric Booking, Fitting)
```

| Role | Access URL | Key Responsibilities & Capabilities |
|---|---|---|
| 👑 **Super Admin** | `/admin` | Enterprise overview, employee creation & permission assignment, tailor verification, payment gateway configuration (UPI/Bank/QR), commission auditing, delivery pincodes, live activity logs. |
| 👤 **Staff Employee** | `/employee` | Role-based dashboard that strictly displays **only** modules permitted by the Super Admin (e.g. Dashboard, Orders, Customers, Tailors, Payments, ID Cards). |
| 🧵 **Master Tailor** | `/tailor` | Complete 16-tab studio workspace: order management pipeline, service fee catalog, studio fabrics manager, precision measurement profiles, work condition terms, review replies, net earnings, and digital ID card. |
| 🛍️ **Customer** | `/` | Search verified tailors across Delhi NCR, Meerut, and Ghaziabad; browse premium materials; book doorstep visits; manage body measurements; track bespoke orders; submit reviews. |

---

## 🔄 System Workflows & How It Works

### 1. Customer Journey & Bespoke Ordering
1. **Discovery & Filter**: Customer explores master artisans or switches to the **"Premium Materials & Cloths"** view on `/search`.
2. **Consultation & Fabric Selection**: View studio fabrics (price/meter, suitability tags, quality badge) and custom garment menus.
3. **Measurement Profile**: Select from saved measurement profiles or request a **Doorstep Measurement Visit** with preferred date and time slot.
4. **Checkout**: Select address, choose between Express (3-day) or Standard (7-day) delivery, and pay via COD, UPI, Card, or NetBanking.
5. **Real-Time Tracking**: Monitor order status on `/bookings` through 9 live workflow stages.

---

### 2. Studio Fabric & Material Catalog System
Tailors can list available fabrics in their studio to help customers choose materials during custom stitching:
- 📸 **Dual-Mode Image Input**: Upload photos directly from local computer/device or enter an image URL with live preview thumbnail (`ImageInputWithUpload.jsx`).
- 🏷️ **Comprehensive Specs**: Fabric name, category (*Cotton, Linen, Silk, Wool, Velvet, Denim, Rayon, Blend*), color, weave pattern, available quantity in meters, and price per meter (`₹/m`).
- 👔 **Garment Suitability**: Multi-select tags (*Shirt, Pant, Suit, Kurta, Sherwani, Lehenga, Blouse, Safari, Blazer*).
- 🔍 **Customer Discovery**: Displayed on public `/search?view=fabrics` and individual atelier profiles (`/tailor/:id`).
- 💬 **1-Click Inquiry**: Customers can open a Fabric Details Modal or initiate pre-formatted WhatsApp consultations directly with the tailor.

---

### 3. Master Tailor 16-Tab Studio Suite (`TailorDashboard.jsx`)
Master tailors manage their entire business operations through 16 modular tabs:

```text
🏠 Dashboard               ➔ Today's Orders, Pending, In Progress, Ready, Earnings, Queue
📦 Orders                  ➔ 9-Stage Workflow Pipeline (New ➔ Accepted ➔ Stitching ➔ Quality Check ➔ Delivered)
👕 My Services             ➔ Add/Edit Services, Fees, Turnaround Days, Photos, Enable/Disable
🧵 My Fabrics              ➔ Studio Fabric Catalog (Add/Edit Fabrics, Price/m, Photos, Stock)
📏 Measurements            ➔ Customer Measurements History & Garment Sizing Presets (Suit/Blouse/Kurta)
🧵 Work Conditions         ➔ Home Visit, Shop Visit, Alterations, Express Delivery, Fabric Terms
⭐ Reviews                 ➔ Customer Ratings Breakdown, Read Verified Reviews, Reply to Customer
💰 Earnings                ➔ Net Payouts (85%), Gross Revenue, Escrow Settlements, Order Breakdown
📊 Analytics               ➔ Monthly Volume Trends, Revenue Visualizer, Most Popular Services
📍 Location & Availability ➔ Service City, Area, Pincode, Home Visit Radius (km), Vacation Mode Toggle
💬 Customers               ➔ Client Directory, 1-Click WhatsApp Pre-filled Chat, Direct Call
🔔 Notifications           ➔ Live Order Alerts, Escrow Verifications & Platform Announcements
👤 My Profile              ➔ Studio Photo Upload, Shop Name, Bio, Experience, Working Hours
🪪 My ID Card              ➔ Double-Sided Digital Security Badge (3D Flip, Live QR, Download PDF/PNG, Print)
⚙️ Settings                ➔ Password Change, Preferences, Security Settings
🚪 Logout                  ➔ Secure Session Termination
```

---

### 4. Employee Permission-Based Dashboard & RBAC
TailorWala enforces zero-trust permission management:
- **Granular Permissions Matrix**: Super Admin assigns module access (`dashboard`, `orders`, `customers`, `tailors`, `payments`, `employees`, `activity_logs`, `settings`, `id_cards`) with action flags (`view`, `edit`, `delete`).
- **Dynamic Navigation**: When an employee logs in (`/auth` with Email or Employee ID `TW-EMP-XXXX`), the sidebar renders **only** the allowed modules.
- **Backend Guard**: Every API route verifies `requirePermission(module, action)` ensuring unauthorized requests return `HTTP 403 Forbidden`.
- **Password Administration**: Super Admin can set and update employee passwords directly from the Admin Panel.

---

### 5. Official Digital ID Card & Public QR Verification
Every artisan and employee receives an official digital ID badge:
- **Interactive 3D Card**: View front and back with dynamic flip animation (`DigitalIdCard.jsx`).
- **Unique Identification**: Displays Primary ID (`TW-EMP-0001` or `TW-TLR-000123`) and Security Number (`EMP-982741` or `TLR-982741`).
- **Live Scannable QR Code**: Directs any smartphone camera to public verification URL `https://tailorwala.com/verify-id/:idNumber`.
- **Export Capabilities**: 1-click Download High-Resolution PNG, Download PDF, and Print Official ID Badge.

---

### 6. Payment Escrow & Commission Settlement
- **Escrow Architecture**: Customer payments are held safely until order completion.
- **Commission Split**: Automated split of **85% Net Artisan Share** and **15% Platform Commission**.
- **Admin Configuration**: Super Admin configures UPI ID, Bank Account / IFSC, and QR Code upload on `/admin`.

---

## 💻 Technology Stack & Architecture

```
+-------------------------------------------------------------------------------+
|                                CLIENT (React 19 + Vite)                       |
|  [Customer Pages]    [Tailor Studio]    [Admin Console]   [Public ID Portal]  |
|  - Home & Catalog    - 16-Tab Workspace - RBAC Staff      - /verify-id/:id    |
|  - Cart & Checkout   - Fabric Manager   - Payment Config  - QR Verification   |
|  - Measurements      - Order Pipeline   - Audit Logs      - Responsive UI     |
+---------------------------------------+---------------------------------------+
                                        | HTTP REST (JSON / Bearer JWT)
+---------------------------------------v---------------------------------------+
|                                SERVER (Node.js / Express)                     |
|  +---------------------+  +----------------------+  +----------------------+  |
|  |  Auth & RBAC Router |  |  Tailors & Fabrics   |  |  Orders & Payments   |  |
|  +---------------------+  +----------------------+  +----------------------+  |
|  |  Admin Controller   |  |  ID Verification API |  |  Activity Audit Logs |  |
|  +---------------------+  +----------------------+  +----------------------+  |
+---------------------------------------+---------------------------------------+
                                        | Mongoose ODM
+---------------------------------------v---------------------------------------+
|                                MONGODB DATABASE                               |
|  [Users]  [TailorProfiles]  [Bookings]  [Cloths]  [Payments]  [ActivityLogs]  |
+-------------------------------------------------------------------------------+
```

### 1. Frontend Technologies
- **Core**: React 19, JavaScript (ES6+ / JSX), HTML5, CSS3.
- **Build Tool**: Vite (Lightning-fast HMR and optimized production bundling).
- **Styling**: Tailwind CSS v4, Vanilla CSS design tokens, Glassmorphism, Dark/Light modes.
- **Icons**: Lucide React (`lucide-react`).
- **Routing**: `react-router-dom` (Protected routes, role-based gateways, dynamic query syncing).
- **State Management**: React Context API (`AuthContext`, `CartContext`, `ToastContext`, `ThemeContext`).
- **Components**:
  - `ImageInputWithUpload.jsx`: Dual-mode file upload & URL input with preview thumbnail.
  - `DigitalIdCard.jsx`: Double-sided 3D flip ID badge with live QR code and PDF/PNG download.
  - `WorkConditionCard.jsx`: Interactive service condition cards.

### 2. Backend Technologies
- **Runtime & Framework**: Node.js, Express.js 4.
- **Database & ODM**: MongoDB with Mongoose 8.
- **In-Memory Database**: `mongodb-memory-server` (Zero-setup standalone operation fallback).
- **Authentication**: JWT (`jsonwebtoken`), Salted Hashing (`bcryptjs`).
- **Security**: `cors`, `helmet`, rate limiting, input sanitation, role-based access middleware.
- **Document Generation**: `pdfkit` for ID badge and invoice generation.

---

## 📂 Directory & File Structure

```text
tailorwalabtech-main/
├── Client/                          # React Frontend Application
│   ├── public/                      # Static assets & favicon
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── common/              # Skeletons, Modals, Buttons
│   │   │   ├── DigitalIdCard.jsx    # 3D Flip ID badge with QR
│   │   │   ├── ImageInputWithUpload.jsx # Dual-mode file upload & URL
│   │   │   ├── Header.jsx           # Responsive navbar with RBAC awareness
│   │   │   └── Footer.jsx           # Global footer with WhatsApp support
│   │   ├── context/                 # Application Context Providers
│   │   │   ├── AuthContext.jsx      # User session, JWT, profile hydration
│   │   │   ├── CartContext.jsx      # Shopping cart & measurements
│   │   │   ├── ThemeContext.jsx     # Dark / Light theme toggle
│   │   │   └── ToastContext.jsx     # Real-time toast alerts
│   │   ├── pages/                   # Application Routes & Pages
│   │   │   ├── Home.jsx             # Landing page, city chips, luxury fabrics
│   │   │   ├── TailorSearch.jsx     # Dual search (Tailors & Fabrics Catalog)
│   │   │   ├── TailorProfile.jsx    # Public artisan profile & available fabrics
│   │   │   ├── TailorDashboard.jsx  # 16-tab master tailor operating suite
│   │   │   ├── AdminDashboard.jsx   # Super Admin governance & staff RBAC
│   │   │   ├── EmployeeDashboard.jsx# Permission-scoped staff dashboard
│   │   │   ├── IdVerificationPage.jsx # Public QR ID badge validation
│   │   │   ├── Cart.jsx & Checkout.jsx # Booking & payment checkout
│   │   │   ├── MyBookings.jsx       # Order tracking & invoice view
│   │   │   └── AuthPage.jsx         # Sign in (Email/ID) & Register
│   │   ├── services/
│   │   │   └── api.js               # Centralized Fetch API client
│   │   ├── App.jsx                  # Route definitions & protected wrappers
│   │   └── main.jsx                 # Client entry point
│   ├── package.json
│   └── vite.config.js
│
├── Server/                          # Node.js Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # MongoDB connection & memory fallback
│   │   ├── controllers/             # Request controllers
│   │   │   ├── authController.js    # Login, Register, ID Verification
│   │   │   ├── tailorController.js  # Tailor search, profiles, fabrics
│   │   │   ├── clothController.js   # Platform cloths & studio fabrics
│   │   │   ├── bookingController.js # Orders, bookings & status updates
│   │   │   ├── adminController.js   # Employee RBAC, settings, audit logs
│   │   │   └── paymentController.js # Escrow, payouts, gateway settings
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification & requirePermission
│   │   │   └── errorHandler.js      # Global error handling
│   │   ├── models/                  # Mongoose Schema Models
│   │   │   ├── User.js              # User account & permissions
│   │   │   ├── TailorProfile.js     # Tailor studio, services, fabrics
│   │   │   ├── Cloth.js             # Platform fabric catalog
│   │   │   ├── Booking.js           # Order, measurements, timeline
│   │   │   ├── PaymentAccount.js    # Business payment settings
│   │   │   ├── ActivityLog.js       # Administrative audit trail
│   │   │   └── Review.js            # Customer ratings & replies
│   │   ├── routes/                  # Express API Routes
│   │   │   ├── authRoutes.js
│   │   │   ├── tailorRoutes.js
│   │   │   ├── clothRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── paymentRoutes.js
│   │   ├── utils/
│   │   │   ├── seedData.js          # Auto-seeding default accounts & tailors
│   │   │   └── catchAsync.js
│   │   ├── app.js                   # Express application setup
│   │   └── server.js                # Server entry point (Port 5000)
│   ├── package.json
│   └── .env                         # Server environment variables
│
└── package.json                     # Root scripts (install-all, dev)
```

---

## 🔌 Complete REST API Reference Guide

### 1. Authentication & Identification (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer or tailor partner. |
| `POST` | `/api/auth/login` | Public | Login via Email or Employee ID (`TW-EMP-XXXX`). |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile & permissions. |
| `POST` | `/api/auth/update-password` | Authenticated | Update user password. |
| `GET` | `/api/auth/verify-id/:idNumber` | Public | Publicly verify Employee/Tailor ID badge via QR code. |

### 2. Tailors & Studio Fabrics (`/api/tailors`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/tailors` | Public | Search tailors with multi-word search, city, category, and price filters. |
| `GET` | `/api/tailors/:id` | Public | Get tailor profile, services, studio fabrics, and reviews. |
| `GET` | `/api/tailors/me` | Tailor | Get authenticated tailor's studio profile & settings. |
| `POST` | `/api/tailors` | Tailor | Create or update tailor profile, services, fabrics, and location. |
| `POST` | `/api/tailors/upload-photo` | Tailor | Upload tailor studio avatar photo. |

### 3. Fabrics & Materials Catalog (`/api/fabrics` & `/api/cloths`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/fabrics` | Public | List all studio & platform fabrics with creator tailor metadata. |
| `GET` | `/api/fabrics/:id` | Public | Get fabric specifications, suitability, and tailor info. |
| `GET` | `/api/cloths/seed` | Public | Seed default luxury fabrics into platform catalog. |

### 4. Orders & Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Customer | Create bespoke order / doorstep measurement booking. |
| `GET` | `/api/bookings/my` | Customer | View customer order history and live tracking timeline. |
| `GET` | `/api/bookings/tailor` | Tailor | Get tailor's active order queue and pipeline. |
| `PATCH`| `/api/bookings/:id/status`| Tailor/Admin | Advance order status (`accepted` ➔ `stitching` ➔ `ready` ➔ `delivered`). |

### 5. Administration & Staff RBAC (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin/Employee | Get enterprise KPIs, revenue, order volume, and counts. |
| `GET` | `/api/admin/employees` | Admin/Employee | List all employees with permission matrix. |
| `POST`| `/api/admin/employees` | Admin | Create employee with custom designation, ID, and permissions. |
| `PATCH`|`/api/admin/employees/:id`| Admin | Update employee details, permissions, or reset password. |
| `DELETE`|`/api/admin/employees/:id`| Admin | Deactivate or remove employee account. |
| `GET` | `/api/admin/activity-logs` | Admin/Employee | View system audit trail with timestamp, IP, and actions. |
| `GET` | `/api/admin/payment-settings`| Admin | Get active UPI ID, bank account, and QR code. |
| `POST`| `/api/admin/payment-settings`| Admin | Update payment account settings and upload QR image. |

---

## 🚀 Setup, Installation & Running Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Optional (If local MongoDB is not running, the application automatically uses an embedded in-memory MongoDB database).

---

### Step 1: Clone or Open the Repository
```bash
cd "tailorwalabtech-main"
```

---

### Step 2: Install All Dependencies
Install dependencies for both Client and Server concurrently from the root directory:
```bash
# Option A: Run root script
npm run install-all

# Option B: Manual install
cd Server && npm install
cd ../Client && npm install
cd ..
```

---

### Step 3: Configure Environment Variables
Create or verify `Server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=tailorwala_super_secret_jwt_key_2026_production
JWT_EXPIRES_IN=30d
MONGO_URI=mongodb://localhost:27017/tailorwala
```

---

### Step 4: Run the Application
Start both Backend API and Frontend Vite dev server concurrently:

```bash
# Run both Server & Client
npm run dev
```

Or run in separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
cd Server
npm run dev

# Terminal 2: Frontend Client (Port 5173)
cd Client
npm run dev
```

Open your browser and navigate to:
```text
Frontend Client : http://localhost:5173
Backend API     : http://localhost:5000
Health Check    : http://localhost:5000/api/health
```

---

## 🔐 Default Credentials & Test Accounts

The platform automatically seeds full test datasets upon first startup:

| Role | Email / Employee ID | Password | Access URL | Permissions / Description |
|---|---|---|---|---|
| 👑 **Super Admin** | `admin@tailorwala.com` | `admin123` | `/admin` | Complete enterprise governance, staff management, payment settings, audit logs. |
| 👤 **Staff Employee** | `TW-EMP-0001` or `employee@tailorwala.com` | `employee123` | `/employee` | Permission-based scoped dashboard (Orders, Customers, Tailors, ID Cards). |
| 🧵 **Master Tailor** | `tailor@tailorwala.com` | `tailor123` | `/tailor` | 16-Tab Studio Suite, Fabric Catalog, Measurement Presets, Earnings. |
| 🛍️ **Customer** | `customer@tailorwala.com` | `customer123` | `/` | Browse tailors & fabrics, Doorstep fitting bookings, Cart & Checkout. |

---

## 💬 Direct Communication Integration

TailorWala provides direct 1-click WhatsApp customer support and tailor consultation:
- **Official WhatsApp Support Number**: `+91 8789682127`
- **Tailor Consultation Link Format**:
  ```text
  https://wa.me/918789682127?text=Hello%20TailorWala,%20I%20am%20interested%20in%20custom%20tailoring.
  ```
- **Fabric Order Inquiries**: Click **"Inquire This Fabric"** on any material card to launch WhatsApp with the fabric name and price pre-filled.

---

## 📄 License
This project is proprietary and built for enterprise bespoke tailoring and garment craftsmanship. All rights reserved © 2026 TailorWala.

# 🍋 POPTO — Complete Full-Stack Lemon E-Commerce Platform

**Brand**: POPTO – From Farmers to Buyers  
**Tagline**: DISCOVER. PLAN. PROGRESS. (शोधा. नियोजन करा. प्रगती करा.)  
**Region**: Maharashtra, India  
**Currency**: INR ₹  
**Languages**: English & मराठी (Bilingual only)  
**Produce Scope**: Exclusively Lemon & Lemon-Related Products  

---

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Web Website](#web-website)
3. [Mobile App (React Native + Expo)](#mobile-app-react-native--expo)
4. [Shared Backend & Database](#shared-backend--database)
5. [User Roles & Authorization](#user-roles--authorization)
6. [Quick Start & Setup Instructions](#quick-start--setup-instructions)
7. [Environment Variables](#environment-variables)
8. [Testing & Verification](#testing--verification)

---

## Architecture Overview

POPTO is built as a unified e-commerce platform where the **Next.js Web Application** and the **Expo React Native Mobile App** share the identical backend API, authentication engine, SQLite database (`data/popto.db`), order pipeline, and real login audit stream.

```
                  ┌───────────────────────────────────────────────┐
                  │                 POPTO PLATFORM                │
                  └───────────────────────┬───────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │                                               │
    ┌─────────────▼─────────────┐                   ┌─────────────▼─────────────┐
    │     Responsive Web App    │                   │      Mobile App (Expo)    │
    │  Next.js 14 (App Router)  │                   │   React Native (iOS/And)  │
    └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          │
                           ┌──────────────▼──────────────┐
                           │    Shared Next.js Core API   │
                           │   JWT Auth & Bcrypt Security │
                           └──────────────┬──────────────┘
                                          │
                           ┌──────────────▼──────────────┐
                           │   SQLite Relational DB      │
                           │     (data/popto.db)         │
                           └─────────────────────────────┘
```

---

## Web Website

- **Local URL**: [http://localhost:3000](http://localhost:3000)
- **Framework**: Next.js 14 (App Router), Tailwind CSS, Vanilla styling tokens
- **Bilingual Switch**: Instant toggle between English and मराठी, persisted across sessions
- **Responsive Layout**: Fully responsive across Android mobile browsers, iPhone Safari, iPad tablets, laptops, and desktop displays

### Primary Routes:
- `/` — Homepage with authentic Maharashtra lemon orchard visual & live database statistics
- `/shop` — Catalog with faceted filters (District, Rating, Organic, Farm Fresh, Price)
- `/product/[id]` (and `/shop/[id]`) — Product details, harvest info, and freshness badge
- `/cart` — Cart items, quantity controls, and coupon engine (`WELCOME10`, `LEMON50`)
- `/checkout` — Maharashtra delivery address form and payment selection
- `/orders` (and `/account/orders`) — Customer order history
- `/orders/[id]` — Live 4-stage cold-chain tracking timeline
- `/wishlist` (and `/account/wishlist`) — Saved lemon varieties
- `/profile` (and `/account`) — Customer profile & preferences
- `/farmers` & `/farmers/[id]` — Verified Maharashtra lemon growers
- `/admin` — Comprehensive governance dashboard (Customers, Inventory, Orders, Login Activity)
- `/seller` — Farmer portal for product catalog, stock, and sales
- `/editor` — Content and produce management

---

## Mobile App (React Native + Expo)

- **Directory**: `/mobile`
- **Framework**: React Native 0.74.5 + Expo ~51.0.0
- **Screens**:
  1. `Splash & Onboarding` — Brand intro & Maharashtra region overview
  2. `Home` — Orchard hero, live database counters, featured lemons
  3. `Shop Lemons` — Live search, district chips (Solapur, Jalgaon, Satara, Akola), organic toggle
  4. `Product Details` — Image preview, harvest details, quantity selector, add to cart
  5. `Cart` — Quantity adjustments, delivery calculation, checkout bar
  6. `Checkout` — Maharashtra PIN code validation (400001-445402), recipient address, COD & test UPI
  7. `Order Success & Tracking` — Unique Order ID generation and 4-stage tracking timeline
  8. `My Orders` — Past orders list with live status badges
  9. `Wishlist` — Saved varieties with instant cart transfer
  10. `Notifications` — Harvest and dispatch notifications
  11. `Profile & Settings` — Customer account details, bilingual language switcher (EN $\leftrightarrow$ मराठी), sign out

---

## Shared Backend & Database

The mobile app and website interact with the same SQLite database via `/api/*`:
- **Real-Time Data Sync**: Orders placed on mobile appear immediately in the Admin and Farmer dashboards.
- **Real Login Activity Tracking**: All authentications from mobile and web are recorded with IP, user-agent, device type, browser, OS, and timestamp.
- **Lemon-Only Rule**: Database and API enforce Citrus Limon varieties strictly.
- **Zero Exposed Secrets**: Passwords, hashes, and auth tokens are never exposed.

---

## User Roles & Authorization

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer** | `rahul.sharma@example.com` | `Customer@123` | Storefront, cart, checkout, own orders & wishlist |
| **Farmer/Seller** | `rajesh.patil@example.com` | `Farmer@123` | Seller dashboard, own produce & stock, permitted orders |
| **Editor** | `editor@popto.local` | `ChangeThisEditorPassword` | Product CRUD, content editing (No admin or role escalation) |
| **Admin** | `admin@popto.local` | `ChangeThisAdminPassword` | Customer directory, orders, coupons, login activity |
| **Super Admin** | `admin@popto.local` | `ChangeThisAdminPassword` | Full system access, user role modifications |

---

## Quick Start & Setup Instructions

### 1. Web Application

```powershell
# Navigate to project root
cd "C:\Users\Dnyaneshwar Sonwane\.gemini\antigravity-ide\scratch\popto"

# Ensure Node.js v20+ is in PATH
$env:PATH = "C:\Users\Dnyaneshwar Sonwane\.gemini\antigravity-ide\scratch\nodejs\node-v20.15.1-win-x64;$env:PATH"

# Install dependencies (already installed)
npm install

# Run development server
npm run dev

# Or build and run production server
npm run build
npm run start -- -p 3000
```

### 2. Mobile Application

```powershell
# Navigate to mobile directory
cd "C:\Users\Dnyaneshwar Sonwane\.gemini\antigravity-ide\scratch\popto\mobile"

# Ensure Node.js is in PATH
$env:PATH = "C:\Users\Dnyaneshwar Sonwane\.gemini\antigravity-ide\scratch\nodejs\node-v20.15.1-win-x64;$env:PATH"

# Start Expo development server
npx expo start
```

*Press `w` to open in web browser, `a` for Android emulator, or scan the QR code with Expo Go on a physical phone.*

---

## Environment Variables

Copy `.env.example` to `.env.local`:
```ini
DATABASE_PATH=./data/popto.db
AUTH_SECRET=popto-dev-secret-key-change-in-production-min32
AUTH_TOKEN_EXPIRY=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=POPTO
```

---

## Testing & Verification

Run automated test suite:
```powershell
npx ts-node --compiler-options '{"module":"CommonJS"}' src/lib/test_verification.ts
```

Run TypeScript and ESLint checks:
```powershell
# Web
npx tsc --noEmit
npm run lint

# Mobile
cd mobile
npx tsc --noEmit
```

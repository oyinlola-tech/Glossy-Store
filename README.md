# Glossy Store WebApp

Full-stack ecommerce application:
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + Sequelize (MySQL)

## What Was Updated

- Dynamic categories/subcategories (no hardcoded category UI)
- Unified API service aligned with backend contracts
- Added missing frontend pages and role routes:
  - Account, Wishlist, Orders, Product Details, Forgot Password
  - Admin products/orders/users/categories
  - SuperAdmin admins/users/settings
- Fixed broken links/buttons and mobile navigation behavior
- Added dev proxy and one-command startup for frontend + backend
- Added root and backend `.env` defaults
- Added `LICENSE.md` and `SECURITY.md`

## Quick Start

### 1. Install dependencies

```bash
npm install
cd Backend && npm install && cd ..
```

### 2. Configure environment

Root `.env`:

```env
VITE_API_BASE_URL=/api
VITE_BACKEND_PROXY_TARGET=http://localhost:5000
```

Backend `.env`:

```env
NODE_ENV=development
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=glossy_store
DB_USER=root
DB_PASSWORD=
JWT_SECRET=change-this-for-production
JWT_EXPIRE=7d
CORS_ALLOWED_ORIGINS=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
ALLOW_START_WITHOUT_DB=true
```

`ALLOW_START_WITHOUT_DB=true` lets backend boot in limited mode if DB is unavailable.

### 3. Start both frontend and backend

```bash
npm start
```

This runs:
- Frontend Vite dev server
- Backend nodemon server

## Scripts

Root:
- `npm start` -> starts frontend + backend together
- `npm run dev` -> frontend only
- `npm run build` -> frontend production build

Backend:
- `npm run dev --prefix Backend` -> backend dev server
- `npm run start --prefix Backend` -> backend production start

## API Highlights

Base URL: `/api`

New/used dynamic category API:
- `GET /categories?tree=true` -> parent categories with nested `subcategories`
- `GET /categories?tree=false` -> flat list

Other key groups:
- Auth: register/login/OTP/reset password
- Products/Cart/Orders
- User profile/wishlist/referrals
- Admin management endpoints

## Notes

- Frontend category displays now come from backend data.
- Admin can create parent and subcategories from `/admin/categories`.
- Policy/footer links are now routed (`/privacy`, `/terms`, `/faq`).

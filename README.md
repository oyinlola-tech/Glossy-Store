# Glossy Store WebApp

Full-stack ecommerce application:
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + Sequelize (MySQL)

Maintainer: `OLUWAYEMI OYINLOLA MICHAEL`  
Portfolio: `https://oyinlola.site`

## Core Features

- Full auth flow: register, login, OTP verification, forgot/reset password
- Dedicated OTP page (`/otp`) with resend support
- Mandatory OTP for every `admin` and `superadmin` login attempt
- Product catalog, categories, cart, checkout, wishlist, orders
- Admin and SuperAdmin dashboards with role-based access
- Support chat with private attachment handling
- Automatic database bootstrap on backend startup

## License and Usage

- This project is proprietary software.
- It is not free to use.
- You must contact and obtain written permission before any use.
- Contact for licensing: `https://oyinlola.site`
- See `LICENSE.md` for full legal terms.

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
OTP_HASH_SECRET=change-this-for-production
JWT_EXPIRE=7d
CORS_ALLOWED_ORIGINS=http://localhost:5173
SOCKET_CORS_ORIGIN=http://localhost:5173
AUTO_SYNC_MODELS=true
AUTO_RUN_MIGRATIONS=true
ALLOW_START_WITHOUT_DB=false
```

### 3. Start everything

```bash
npm start
```

This starts frontend and backend together.

## Database Startup Behavior

When backend starts, it automatically:
1. Creates the database if it does not exist.
2. Authenticates DB connection.
3. Registers all models and associations.
4. Creates missing tables with `sequelize.sync()` when `AUTO_SYNC_MODELS=true`.
5. Runs migrations when `AUTO_RUN_MIGRATIONS=true`.
6. Seeds super admin from environment values (if configured).

## Scripts

Root:
- `npm start`: start frontend + backend
- `npm run dev`: frontend only
- `npm run build`: frontend build

Backend:
- `npm run dev --prefix Backend`: backend dev
- `npm run start --prefix Backend`: backend start
- `npm run db:create --prefix Backend`: create database
- `npm run db:migrate --prefix Backend`: run migrations only

## OTP Flow

- Registration sends OTP and redirects to `/otp?purpose=registration&email=...`
- Every `admin` and `superadmin` login requires OTP and redirects to `/otp?purpose=login&email=...`
- Standard user logins require OTP on suspicious/new-device sign-in
- OTP page verifies and supports resend via `/api/auth/resend-otp`

## Security Notes

- OTPs are stored as HMAC hashes, not plain values
- Auth + OTP endpoints are rate-limited
- JWT-based auth with role checks
- Helmet enabled with production HSTS
- Input validation enforced with Joi

Read more in `SECURITY.md`.

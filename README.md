# Glossy Store - E-Commerce Web Application

A modern, full-featured e-commerce web application built with React, TypeScript, and Tailwind CSS.

## Features

### 🎨 Design & UI
- **Dark/Light Mode Toggle** - Seamless theme switching with persistent preference
- **Responsive Design** - Optimized for all device sizes
- **Modern UI** - Clean and professional interface based on Figma designs

### 🔐 Authentication & Authorization
- **Multi-Role Support** - User, Admin, and SuperAdmin roles
- **OTP Verification** - Secure two-factor authentication
- **Protected Routes** - Role-based access control
- **Session Management** - Persistent authentication state

### 🛍️ E-Commerce Features
- **Product Catalog** - Browse and search products
- **Product Details** - Detailed product information with ratings and reviews
- **Shopping Cart** - Add, update, and remove items
- **Wishlist** - Save products for later
- **Checkout Process** - Complete order placement
- **Order Management** - View order history and status

### 👨‍💼 Role-Based Dashboards

#### User Dashboard
- View profile and account settings
- Order history and tracking
- Wishlist management
- Account preferences

#### Admin Dashboard
- Product management (CRUD operations)
- Order management and status updates
- User management
- Analytics and reports
- Coupon management
- Category management

#### SuperAdmin Dashboard
- Complete system control
- Admin user management
- System settings and configuration
- Advanced analytics
- Database management

### 🔌 API Integration
Integrated with backend API v2.0.5 supporting:
- Authentication & Authorization
- Product Management
- Cart Operations
- Order Processing
- User Management
- Support System
- Payment Processing
- Coupon Validation

## Tech Stack

- **React 18.3.1** - UI library
- **TypeScript** - Type safety
- **React Router 7.13** - Navigation and routing
- **Tailwind CSS 4.1** - Styling
- **Lucide React** - Icons
- **Sonner** - Toast notifications
- **Motion** - Animations
- **Vite** - Build tool

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd glossy-store
```

2. Install dependencies
```bash
npm install
# or
pnpm install
```

3. Start the development server
```bash
npm run dev
# or
pnpm dev
```

4. Build for production
```bash
npm run build
# or
pnpm build
```

## Project Structure

```
glossy-store/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── ui/           # UI component library
│   │   ├── contexts/         # React contexts
│   │   │   ├── ThemeContext.tsx
│   │   │   └── AuthContext.tsx
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── admin/        # Admin pages
│   │   │   └── superadmin/   # SuperAdmin pages
│   │   ├── services/         # API services
│   │   │   └── api.ts
│   │   ├── routes.tsx        # Route configuration
│   │   └── App.tsx           # Root component
│   ├── imports/              # Figma imports
│   └── styles/               # Global styles
├── package.json
└── vite.config.ts
```

## API Configuration

The application connects to a backend API at `/api`. Configure the base URL in `src/app/services/api.ts` if needed.

### Authentication Flow

1. **Registration**
   - User provides name, email, and password
   - OTP sent to email
   - User verifies OTP
   - Account created and user logged in

2. **Login**
   - User provides email and password
   - OTP sent to email
   - User verifies OTP
   - User logged in with JWT token

3. **Authorization**
   - JWT token stored in localStorage
   - Token sent with each API request
   - Role-based route protection

## Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/products` - Product listing
- `/products/:id` - Product details
- `/about` - About page
- `/contact` - Contact page

### Protected Routes
- `/cart` - Shopping cart
- `/wishlist` - User wishlist
- `/account` - User account
- `/orders` - Order history
- `/admin/dashboard` - Admin dashboard (Admin, SuperAdmin)
- `/admin/*` - Admin pages (Admin, SuperAdmin)
- `/superadmin/dashboard` - SuperAdmin dashboard (SuperAdmin only)
- `/superadmin/*` - SuperAdmin pages (SuperAdmin only)

## Theme Toggle

The theme toggle button is located in the top header. Click to switch between light and dark modes. The preference is saved to localStorage and persists across sessions.

## Role Management

Three user roles are supported:
- **User** - Standard customer with access to shopping features
- **Admin** - Store manager with product and order management
- **SuperAdmin** - Full system access including admin management

## Development Notes

- The application uses mock data when API endpoints are unavailable
- All product data is fetched from the backend API
- Cart and wishlist are managed through API calls
- Protected routes redirect to login if not authenticated
- Role-based access is enforced on both frontend and backend

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright © 2026 Glossy Store. All rights reserved.

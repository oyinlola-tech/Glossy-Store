# Glossy Store - Usage Guide

## Quick Start

1. **Access the Application**
   - Open your browser and navigate to the application URL
   - The home page will display with featured products and categories

2. **Toggle Dark/Light Mode**
   - Look for the theme toggle button (Moon/Sun icon) in the top banner
   - Click to switch between light and dark themes
   - Your preference is automatically saved

## User Features

### Registration & Login

1. **Register a New Account**
   - Click "Sign Up" in the navigation
   - Fill in your name, email, and password
   - Click "Create Account"
   - Enter the OTP sent to your email
   - You'll be automatically logged in

2. **Login to Existing Account**
   - Click the user icon or "Login" link
   - Enter your email and password
   - Enter the OTP sent to your email
   - Access your dashboard based on your role

### Shopping

1. **Browse Products**
   - Navigate to "Shop" or click "View All" on product sections
   - Use the search bar to find specific products
   - Filter by categories
   - Sort by price, popularity, or newest

2. **Product Details**
   - Click on any product card to view details
   - See product images, description, price, and reviews
   - Select size/variant (if available)
   - Add to cart or wishlist

3. **Shopping Cart**
   - Click the cart icon to view your cart
   - Update quantities with +/- buttons
   - Remove items with the trash icon
   - Apply coupon codes for discounts
   - View subtotal, shipping, and total
   - Click "Proceed to Checkout"

4. **Wishlist**
   - Click the heart icon on product cards to save items
   - Access your wishlist from the heart icon in header
   - Move items to cart when ready to purchase

5. **Checkout**
   - Fill in billing and shipping details
   - Select payment method (Bank or Cash on Delivery)
   - Review order summary
   - Click "Place Order"
   - You'll be redirected to your orders page

6. **Order Tracking**
   - Access "My Orders" from the user menu
   - View all your orders and their status
   - Track shipments
   - Cancel orders if needed (within allowed timeframe)

### User Account Management

- **Profile**: View and edit your personal information
- **Addresses**: Manage saved shipping addresses
- **Payment Methods**: Save payment details for faster checkout
- **Order History**: View all past orders
- **Wishlist**: Access saved items
- **Support**: Contact customer support

## Admin Features

### Access Admin Dashboard

1. Login with an admin account
2. Click your profile icon
3. Select "My Account" - you'll be redirected to the admin dashboard

### Admin Capabilities

1. **Dashboard Overview**
   - View sales statistics
   - Monitor orders
   - Track revenue
   - See user activity

2. **Product Management**
   - Add new products
   - Edit existing products
   - Delete products
   - Manage inventory
   - Set pricing and discounts
   - Upload product images

3. **Order Management**
   - View all orders
   - Update order status
   - Process refunds
   - Generate invoices
   - Print shipping labels

4. **User Management**
   - View all registered users
   - Monitor user activity
   - Handle user support requests

5. **Category Management**
   - Create product categories
   - Edit category details
   - Organize product hierarchy

6. **Coupon Management**
   - Create discount coupons
   - Set coupon rules and limits
   - Track coupon usage
   - Deactivate expired coupons

## SuperAdmin Features

### Access SuperAdmin Dashboard

1. Login with a superadmin account
2. Access the SuperAdmin dashboard

### SuperAdmin Capabilities

All admin features, plus:

1. **Admin User Management**
   - Create new admin accounts
   - Assign roles and permissions
   - Deactivate admin accounts
   - Monitor admin activity

2. **System Settings**
   - Configure global settings
   - Manage payment gateways
   - Set shipping rules
   - Configure email templates

3. **Advanced Analytics**
   - View comprehensive reports
   - Track system performance
   - Monitor database health
   - Export data

4. **Security**
   - View security logs
   - Manage access controls
   - Configure 2FA settings

## Backend API Integration

### API Configuration

The application is configured to connect to your backend API at `/api`. If your backend is hosted elsewhere, update the `BASE_URL` in `/src/app/services/api.ts`.

### Authentication

- All API requests include JWT token in Authorization header
- Token is stored securely in localStorage
- Automatic logout on token expiration

### Available API Endpoints

The application integrates with all endpoints documented in your API v2.0.5:

- Authentication (register, login, OTP verification)
- Products (listing, details, ratings, comments)
- Cart operations (add, update, delete)
- Orders (checkout, tracking, cancellation)
- User profile management
- Wishlist operations
- Admin operations (products, orders, users)
- Support system
- Coupon validation

## Tips & Best Practices

1. **Security**
   - Never share your login credentials
   - Use strong, unique passwords
   - Logout when using shared devices

2. **Shopping**
   - Add items to wishlist for later purchase
   - Check for active coupons before checkout
   - Review order details before confirming

3. **Admin Users**
   - Regularly backup product data
   - Monitor order processing times
   - Keep product information up to date

4. **Performance**
   - Use product search for faster browsing
   - Clear browser cache if experiencing issues
   - Use latest browser version for best experience

## Troubleshooting

### Can't Login
- Verify email and password are correct
- Check if OTP was received (check spam folder)
- Ensure your account is activated

### Products Not Loading
- Check internet connection
- Refresh the page
- Clear browser cache
- Contact support if issue persists

### Cart Issues
- Ensure you're logged in for cart sync
- Check if items are still in stock
- Try removing and re-adding items

### Order Problems
- Check order status in "My Orders"
- Contact support for order modifications
- Review order confirmation email

## Support

For any issues or questions:
- Email: exclusive@gmail.com
- Phone: +234 913 351 9489
- Use the Contact page for detailed inquiries
- Admin users: Access support tickets in dashboard

## Mobile Experience

The application is fully responsive and works great on mobile devices:
- Touch-friendly interface
- Optimized images for faster loading
- Mobile-specific navigation
- Easy checkout on small screens

---

**Note**: This is a production-ready application. Connect your backend API to enable full functionality. The application currently uses mock data for demonstration when API is unavailable.

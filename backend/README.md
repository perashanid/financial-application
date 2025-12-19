# Financial Ledger SaaS - Backend API

A comprehensive financial management platform backend built with Node.js, Express, TypeScript, and MongoDB.

## Features Implemented

### ✅ Core Features
- **Authentication & Authorization**
  - JWT-based authentication
  - Two-factor authentication (2FA) with TOTP
  - Password hashing with bcrypt
  - Refresh token mechanism with Redis
  - Role-based access control (User/Admin)

- **User Management**
  - User registration and login
  - Profile management with photo upload
  - Language and currency preferences
  - Account settings and deletion
  - Activity logging

- **Transaction Management**
  - Create, read, update, delete transactions
  - Receipt upload to Cloudinary
  - Real-time balance calculation
  - Advanced filtering and search
  - Pagination support
  - Category-based organization

- **Category System**
  - Pre-seeded default categories (English & Bangla)
  - Custom category creation
  - Multi-language support
  - Income and expense categorization

- **Savings Goals**
  - Goal creation and tracking
  - Auto-save rules (percentage, round-up, scheduled)
  - Contribution tracking
  - Progress monitoring
  - Automated savings execution via cron jobs

- **Loan Management**
  - Loan tracking (borrowed/lent)
  - Interest calculation (simple & compound)
  - EMI calculation
  - Payment recording with principal/interest breakdown
  - Overdue detection
  - Automated reminders via cron jobs

- **Bill Sharing & Groups**
  - Group creation and member management
  - Bill splitting with custom amounts
  - Balance tracking per member
  - Settlement recording
  - Optimal settlement calculation

- **Analytics & Predictions**
  - Dashboard summary with Redis caching
  - Monthly trends analysis
  - Category breakdown
  - Savings vs expenses ratio
  - Expense predictions
  - Loan payoff estimations

- **Payment Gateway Integration**
  - Payment model and base service
  - Payment initiation and verification
  - Payment history tracking
  - Transaction linking
  - Support for bKash, Nagad, SSLCommerz (base implementation)

- **Crowdfunding**
  - Campaign creation and management
  - Contribution system
  - Campaign updates
  - Moderation system (approve/reject/flag)
  - Admin moderation queue

- **Reports & Export**
  - CSV export of transactions
  - PDF monthly reports with charts
  - Customizable date ranges
  - Category breakdown in reports

- **Admin Dashboard**
  - User management (list, view, update status/role)
  - Platform statistics
  - User growth analytics
  - Transaction volume tracking
  - Campaign moderation
  - Activity log viewing

- **Security**
  - Rate limiting
  - Helmet security headers
  - CORS configuration
  - Input sanitization
  - Activity logging
  - Audit trail with TTL

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **File Storage**: Cloudinary
- **Authentication**: JWT + bcrypt
- **2FA**: Speakeasy + QRCode
- **Scheduling**: node-cron
- **Logging**: Winston
- **PDF Generation**: PDFKit
- **CSV Export**: json2csv
- **Security**: Helmet, express-rate-limit

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── cloudinary.ts
│   │   ├── database.ts
│   │   ├── env.ts
│   │   └── redis.ts
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   │   ├── auth.ts
│   │   ├── twoFactorAuth.ts
│   │   ├── requireAdmin.ts
│   │   ├── activityLogger.ts
│   │   └── errorHandler.ts
│   ├── models/          # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   ├── Category.ts
│   │   ├── SavingsGoal.ts
│   │   ├── Loan.ts
│   │   ├── Group.ts
│   │   ├── Notification.ts
│   │   ├── Payment.ts
│   │   ├── Campaign.ts
│   │   └── ActivityLog.ts
│   ├── services/        # Business logic
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── transactionService.ts
│   │   ├── categoryService.ts
│   │   ├── savingsService.ts
│   │   ├── autoSaveService.ts
│   │   ├── loanService.ts
│   │   ├── groupService.ts
│   │   ├── analyticsService.ts
│   │   ├── predictionService.ts
│   │   ├── notificationService.ts
│   │   ├── twoFactorService.ts
│   │   ├── paymentService.ts
│   │   ├── campaignService.ts
│   │   ├── exportService.ts
│   │   ├── activityLogService.ts
│   │   └── adminService.ts
│   ├── routes/          # API routes
│   ├── jobs/            # Cron jobs
│   │   ├── savingsJobs.ts
│   │   └── loanJobs.ts
│   ├── utils/           # Utilities
│   │   ├── jwt.ts
│   │   └── logger.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/2fa/enable` - Enable 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA code
- `POST /api/auth/2fa/disable` - Disable 2FA

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/profile/photo` - Upload profile photo
- `PUT /api/users/settings` - Update settings
- `DELETE /api/users/account` - Delete account

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create custom category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions` - Get transactions (with filters)
- `GET /api/transactions/:id` - Get transaction by ID
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/:id/receipt` - Upload receipt
- `GET /api/transactions/balance` - Get current balance

### Savings
- `POST /api/savings` - Create savings goal
- `GET /api/savings` - Get all savings goals
- `GET /api/savings/:id` - Get savings goal by ID
- `PUT /api/savings/:id` - Update savings goal
- `DELETE /api/savings/:id` - Delete savings goal
- `POST /api/savings/:id/contribute` - Add contribution

### Loans
- `POST /api/loans` - Create loan
- `GET /api/loans` - Get all loans
- `GET /api/loans/:id` - Get loan by ID
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan
- `POST /api/loans/:id/payment` - Record payment

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/members` - Add member
- `DELETE /api/groups/:id/members/:memberId` - Remove member
- `POST /api/groups/:id/bills` - Add bill
- `POST /api/groups/:id/settlements` - Record settlement
- `GET /api/groups/:id/balance` - Get group balance

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard summary
- `GET /api/analytics/category-breakdown` - Get category breakdown
- `GET /api/analytics/trends` - Get monthly trends
- `GET /api/analytics/predictions` - Get expense predictions

### Payments
- `POST /api/payments` - Initiate payment
- `GET /api/payments/history` - Get payment history
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/verify` - Verify payment

### Campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns` - Get all campaigns
- `GET /api/campaigns/:id` - Get campaign by ID
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Cancel campaign
- `POST /api/campaigns/:id/contribute` - Contribute to campaign
- `POST /api/campaigns/:id/updates` - Add campaign update
- `POST /api/campaigns/:id/flag` - Flag campaign

### Export
- `GET /api/export/csv` - Export transactions as CSV
- `GET /api/export/report/:year/:month` - Generate monthly PDF report

### Admin (Requires Admin Role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id/status` - Update user status
- `PUT /api/admin/users/:id/role` - Update user role
- `GET /api/admin/statistics` - Get platform statistics
- `GET /api/admin/moderation/queue` - Get moderation queue
- `POST /api/admin/moderation/campaigns/:id/approve` - Approve campaign
- `POST /api/admin/moderation/campaigns/:id/reject` - Reject campaign
- `GET /api/admin/activity-logs` - Get activity logs

## Environment Variables

See `.env.example` for required environment variables:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/financial-ledger

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your values

# Run in development mode
npm run dev

# Build for production
npm run build

# Run in production
npm start
```

## Cron Jobs

The application runs the following scheduled jobs:

- **Daily at 00:00**: Process scheduled auto-save rules
- **Daily at 01:00**: Check for overdue loans
- **Daily at 09:00**: Send EMI reminders for upcoming due dates

## Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Two-factor authentication (TOTP)
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS configuration
- Input sanitization
- Activity logging with TTL (90 days)
- Role-based access control

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Next Steps

### Pending Backend Tasks
- [ ] Implement actual bKash/Nagad/SSLCommerz gateway integrations
- [ ] Add email/SMS notification delivery
- [ ] Implement i18n for API responses
- [ ] Add more comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger/OpenAPI)

### Frontend Development
- [ ] Build React frontend with all UI components
- [ ] Implement responsive design
- [ ] Add charts and visualizations
- [ ] Create admin dashboard UI
- [ ] Implement real-time notifications

## License

MIT

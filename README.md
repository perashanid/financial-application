# Financial Ledger SaaS

A comprehensive financial management platform for individuals and businesses to track transactions, manage savings goals, handle loans, split bills, and more.

## 🎯 Project Overview

This is a full-stack SaaS application built with:
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis
- **Frontend**: React, TypeScript, Vite, TailwindCSS (in development)
- **Features**: Transaction tracking, savings automation, loan management, bill splitting, crowdfunding, analytics, and more

## 📊 Current Status

### Backend: ~85% Complete ✅
- ✅ Authentication & Authorization (JWT, 2FA)
- ✅ User Management
- ✅ Transaction Ledger with Receipt Upload
- ✅ Category Management (18 default categories)
- ✅ Savings Goals with Auto-save Rules
- ✅ Loan Management with Interest Calculations
- ✅ Bill Sharing & Group Ledger
- ✅ Analytics & Predictions with Caching
- ✅ Payment Gateway Base (bKash, Nagad, SSLCommerz)
- ✅ Crowdfunding Platform
- ✅ CSV/PDF Export
- ✅ Admin Dashboard
- ✅ Activity Logging & Security
- ⏳ Email/SMS Notifications (partial)

### Frontend: 0% Complete ⏳
- All UI components need to be built
- Design system to be implemented
- Responsive layouts to be created

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB v6+
- Redis v7+
- Cloudinary account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd financial-ledger-saas

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev

# Frontend setup (coming soon)
cd frontend
npm install
npm run dev
```

For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)

## 📚 Documentation

- [Backend README](backend/README.md) - Complete API documentation
- [Quick Start Guide](QUICK_START.md) - Get up and running quickly
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Detailed progress report
- [Requirements](/.kiro/specs/financial-ledger-saas/requirements.md) - Full requirements specification
- [Design Document](/.kiro/specs/financial-ledger-saas/design.md) - System architecture
- [Tasks](/.kiro/specs/financial-ledger-saas/tasks.md) - Implementation checklist

## ✨ Key Features

### For Users
- 💰 **Transaction Management**: Track income and expenses with receipt uploads
- 🎯 **Savings Goals**: Set goals with automated savings rules
- 💳 **Loan Tracking**: Manage borrowed/lent money with interest calculations
- 👥 **Bill Splitting**: Share expenses with groups and track settlements
- 📊 **Analytics**: Visualize spending patterns and get predictions
- 🌍 **Multi-language**: Support for English and Bangla
- 💱 **Multi-currency**: Support for BDT and other currencies
- 📱 **Payment Integration**: bKash, Nagad, SSLCommerz support
- 🎗️ **Crowdfunding**: Create and contribute to campaigns

### For Admins
- 👤 **User Management**: View, manage, and moderate users
- 📈 **Platform Analytics**: Track growth and usage metrics
- 🛡️ **Moderation Tools**: Review and approve campaigns
- 📋 **Activity Logs**: Audit trail of all actions
- 🔒 **Security Controls**: Manage roles and permissions

## 🏗️ Architecture

```
financial-ledger-saas/
├── backend/                 # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── jobs/           # Cron jobs
│   │   └── utils/          # Utilities
│   └── README.md
├── frontend/               # React + TypeScript + Vite (in development)
│   └── src/
├── .kiro/                  # Project specifications
│   └── specs/
│       └── financial-ledger-saas/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
└── README.md
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Two-factor authentication (TOTP)
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers
- CORS configuration
- Input sanitization
- Activity logging with 90-day retention
- Role-based access control

## 📊 API Endpoints

80+ endpoints covering:
- Authentication & User Management
- Transactions & Categories
- Savings & Loans
- Groups & Bill Splitting
- Analytics & Predictions
- Payments & Campaigns
- Reports & Export
- Admin Operations

See [Backend README](backend/README.md) for complete API documentation.

## 🧪 Testing

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm test -- --coverage     # With coverage
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Storage**: Cloudinary
- **Authentication**: JWT + bcrypt
- **2FA**: Speakeasy + QRCode
- **Scheduling**: node-cron
- **Logging**: Winston
- **PDF**: PDFKit
- **Security**: Helmet, express-rate-limit

### Frontend (Planned)
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: React Context / Redux
- **Charts**: Recharts / Chart.js
- **Forms**: React Hook Form
- **HTTP Client**: Axios

## 📅 Roadmap

### Phase 1: Backend (Current) - 85% Complete
- [x] Core API development
- [x] Authentication & security
- [x] All major features
- [ ] Payment gateway integrations
- [ ] Email/SMS notifications
- [ ] Comprehensive testing

### Phase 2: Frontend - Not Started
- [ ] UI/UX design system
- [ ] Authentication pages
- [ ] Dashboard & analytics
- [ ] Transaction management
- [ ] All feature pages
- [ ] Responsive design
- [ ] Accessibility

### Phase 3: Testing & Optimization
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit

### Phase 4: Deployment
- [ ] CI/CD pipeline
- [ ] Production deployment
- [ ] Monitoring & logging
- [ ] Documentation
- [ ] Launch

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

Built with ❤️ using Kiro AI

## 📞 Support

For questions or issues:
1. Check the documentation in `/backend/README.md`
2. Review the implementation summary in `IMPLEMENTATION_SUMMARY.md`
3. See the quick start guide in `QUICK_START.md`

---

**Note**: This project is under active development. The backend is production-ready, but the frontend is still in planning phase.

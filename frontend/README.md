# Financial Ledger SaaS - Frontend

A modern, responsive React frontend for the Financial Ledger SaaS platform built with TypeScript, Vite, and TailwindCSS.

## Features

- 🔐 **Authentication**: Secure login/register with JWT tokens
- 💰 **Transaction Management**: Track income and expenses with categories
- 🎯 **Savings Goals**: Set and track savings goals with auto-save rules
- 💳 **Loan Management**: Track borrowed/lent money with interest calculations
- 👥 **Bill Sharing**: Split bills with groups and track settlements
- 📊 **Analytics**: Visual charts and insights on spending patterns
- 🚀 **Crowdfunding**: Create and contribute to campaigns
- 📄 **Reports**: Generate and export financial reports
- 🌐 **Multi-language**: Support for English and Bangla
- 📱 **Responsive**: Mobile-first design that works on all devices

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **date-fns** - Date utilities

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Common/          # Generic components (Button, Input, Modal, etc.)
│   │   ├── Layout/          # Layout components (Navbar, Sidebar, etc.)
│   │   └── Transactions/    # Feature-specific components
│   ├── context/             # React Context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── hooks/               # Custom React hooks
│   │   ├── useDebounce.ts
│   │   └── usePagination.ts
│   ├── pages/               # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Transactions.tsx
│   │   ├── Savings.tsx
│   │   ├── Loans.tsx
│   │   ├── Groups.tsx
│   │   ├── Campaigns.tsx
│   │   ├── Analytics.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   ├── services/            # API service layer
│   │   ├── api.ts           # Base API client
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── savingsService.ts
│   │   ├── loanService.ts
│   │   ├── groupService.ts
│   │   ├── campaignService.ts
│   │   └── analyticsService.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── formatters.ts    # Currency, date formatting
│   │   └── validators.ts    # Zod schemas
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # App entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── .env.example             # Environment variables template
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

### Linting & Formatting

Run ESLint:
```bash
npm run lint
```

Format code with Prettier:
```bash
npm run format
```

## Key Features Implementation

### Authentication Flow
- JWT token stored in localStorage
- Automatic token refresh on API calls
- Protected routes with PrivateRoute component
- Redirect to login on 401 responses

### State Management
- React Context for global auth state
- Local state for component-specific data
- Custom hooks for reusable logic

### API Integration
- Centralized API client with interceptors
- Automatic auth token injection
- Error handling and toast notifications
- Type-safe API responses

### Form Handling
- React Hook Form for form state
- Zod for schema validation
- Reusable Input components
- Error message display

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly UI elements

## Component Guidelines

### Creating New Components

1. Use TypeScript for type safety
2. Follow the existing component structure
3. Use TailwindCSS for styling
4. Make components reusable and composable
5. Add proper prop types and documentation

Example:
```tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

## Styling Guidelines

- Use TailwindCSS utility classes
- Follow the existing color scheme (indigo primary)
- Maintain consistent spacing and sizing
- Use responsive modifiers (sm:, md:, lg:)
- Extract repeated patterns into components

## API Service Pattern

Each feature has its own service file:

```typescript
import api from './api';
import { MyType } from '../types';

export const myService = {
  async getItems() {
    return api.get<MyType[]>('/items');
  },

  async createItem(data: Partial<MyType>) {
    return api.post<MyType>('/items', data);
  },
};
```

## Environment Variables

- `VITE_API_URL` - Backend API base URL

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the Financial Ledger SaaS platform.

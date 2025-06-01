# Hedwig Architecture Documentation

## Overview

Hedwig is a universal React Native + Next.js application for Product Information Management (PIM) with barcode scanning capabilities. The app has been restructured using a feature-based architecture for better maintainability and scalability.

## New File Structure

```
apps/hedwig/
├── config/                          # Configuration files
│   ├── app.config.js                # Expo app config
│   ├── app.json                     # Expo app manifest
│   ├── babel.config.js              # Babel configuration
│   ├── metro.config.js              # Metro bundler config
│   ├── eslint.config.ts             # ESLint configuration
│   └── expo/
│       └── eas.json                 # EAS build configuration
│
├── docs/                            # Documentation
│   ├── BARCODE-SCANNER-INTEGRATION.md
│   ├── iOS-SETUP.md
│   ├── ARCHITECTURE.md              # This file
│   └── REORGANIZATION_PLAN.md       # Migration details
│
├── platforms/                      # Platform-specific code
│   ├── ios/                        # iOS platform files
│   └── android/                    # Android platform files
│
├── src/                            # Main source code
│   ├── app/                        # Next.js app directory
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   ├── globals.css             # Global styles
│   │   ├── api/                    # API routes (minimal)
│   │   ├── scanner/page.tsx        # Scanner route
│   │   ├── pim/page.tsx            # PIM route
│   │   ├── dashboard/page.tsx      # Dashboard route
│   │   ├── cms/page.tsx            # CMS route
│   │   ├── monitoring/page.tsx     # Monitoring route
│   │   ├── history/page.tsx        # History route
│   │   ├── search/page.tsx         # Search route
│   │   └── demo/page.tsx           # Demo route
│   │
│   ├── features/                   # Feature modules
│   │   ├── auth/                   # Authentication
│   │   │   ├── components/
│   │   │   │   ├── AuthProvider.tsx
│   │   │   │   ├── SignIn.tsx
│   │   │   │   └── UserProfile.tsx
│   │   │   ├── actions/
│   │   │   │   └── auth-actions.ts
│   │   │   └── index.ts            # Feature exports
│   │   │
│   │   ├── scanner/                # Barcode scanning
│   │   │   ├── components/
│   │   │   │   ├── NativeScanner.tsx
│   │   │   │   ├── WebScanner.tsx
│   │   │   │   └── ResultDisplay.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useCameraPermission.ts
│   │   │   ├── types/
│   │   │   │   └── scanner.ts
│   │   │   └── pages/
│   │   │       └── ScannerPage.tsx
│   │   │
│   │   ├── products/               # Product management
│   │   │   ├── services/
│   │   │   │   └── productLookupService.ts
│   │   │   ├── actions/
│   │   │   │   └── product-actions.ts
│   │   │   └── pages/
│   │   │       └── PIMPage.tsx
│   │   │
│   │   ├── search/                 # AI-powered search
│   │   │   ├── actions/
│   │   │   │   └── ai-actions.ts
│   │   │   └── pages/
│   │   │       └── SearchPage.tsx
│   │   │
│   │   ├── history/                # Scan history
│   │   │   ├── actions/
│   │   │   │   └── scan-history-actions.ts
│   │   │   ├── services/
│   │   │   │   └── scanHistoryService.ts
│   │   │   └── pages/
│   │   │       └── HistoryPage.tsx
│   │   │
│   │   ├── cms/                    # Content management
│   │   │   └── pages/
│   │   │       └── CMSPage.tsx
│   │   │
│   │   ├── dashboard/              # Main dashboard
│   │   │   └── pages/
│   │   │       └── DashboardPage.tsx
│   │   │
│   │   ├── monitoring/             # System monitoring
│   │   │   └── pages/
│   │   │       └── MonitoringPage.tsx
│   │   │
│   │   └── demo/                   # Demo functionality
│   │       └── pages/
│   │           └── DemoPage.tsx
│   │
│   ├── shared/                     # Shared code
│   │   ├── components/
│   │   │   └── ui/                 # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorMessage.tsx
│   │   │       └── ErrorBoundary.tsx
│   │   │
│   │   ├── hooks/                  # Shared hooks
│   │   │   └── useErrorHandling.ts
│   │   │
│   │   ├── utils/                  # Utility functions
│   │   │   └── style-helpers.ts
│   │   │
│   │   └── services/               # Core services
│   │       ├── analyticsService.ts
│   │       └── analytics-actions.ts
│   │
│   └── __tests__/                  # Test files
│       └── setup/
│           ├── vitest.setup.ts
│           └── components/
│
├── lib/                            # Core infrastructure
│   ├── database.ts                 # Database client
│   ├── analytics-client.ts         # Analytics client
│   └── database-client.ts          # Database utilities
│
├── prisma/                         # Database schema
│   └── schema.prisma
│
├── generated/                      # Generated code
│   └── client/                     # Prisma client
│
└── assets/                         # Static assets
    ├── images/
    ├── icons/
    └── README.md
```

## Key Features

### 1. **Authentication (Better Auth)**
- Server-side authentication with React 19 server actions
- Sign in, sign up, and sign out functionality
- User profile management
- Session management with error handling

### 2. **Barcode Scanner**
- Cross-platform barcode scanning (iOS, Android, Web)
- Native camera integration for mobile
- Web-based scanning using react-zxing
- Multiple barcode format support

### 3. **Product Information Management (PIM)**
- Product lookup by barcode
- AI-powered product discovery
- Product data management
- Database integration with Prisma

### 4. **AI-Powered Search**
- Anthropic Claude integration for product search
- Server-side AI processing for security
- Intelligent product matching and suggestions

### 5. **Analytics & Monitoring**
- PostHog integration for user analytics
- Performance monitoring and error tracking
- Server-side and client-side event tracking
- Scan history and usage metrics

### 6. **Universal Platform Support**
- iOS: Native app with Expo
- Android: Native app with Expo  
- Web: Next.js with React Native Web
- Shared codebase with platform-specific optimizations

## Technical Stack

### **Frontend**
- **React 19.1.0** - Latest React with concurrent features
- **Next.js 15.4.0** - Full-stack React framework
- **React Native 0.79.2** - Cross-platform mobile development
- **Expo SDK 53** - Native development platform
- **TypeScript** - Type-safe JavaScript

### **Backend & Database**
- **Server Actions** - React 19 server-side functions
- **Prisma ORM** - Database access layer
- **PostgreSQL** - Primary database
- **Better Auth** - Authentication system

### **AI & Analytics**
- **Anthropic Claude** - AI-powered product search
- **PostHog** - User analytics and event tracking
- **Sentry** - Error monitoring (via @repo/observability)

### **Development Tools**
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Expo CLI** - Mobile development tools

## Architecture Principles

### 1. **Feature-Based Organization**
Each feature is self-contained with its own:
- Components
- Server actions
- Services
- Types
- Pages
- Tests

### 2. **Server-First Security**
- React 19 server actions for secure data operations
- Server-side validation and processing
- Reduced client-side API surface

### 3. **Universal Code Sharing**
- Shared components work across web and mobile
- Platform-specific optimizations where needed
- Consistent styling and behavior

### 4. **Type Safety**
- Full TypeScript coverage
- Prisma-generated types
- Strict type checking enabled

### 5. **Performance Optimized**
- Server components for better performance
- Code splitting by feature
- Optimized bundle sizes

## Development Workflow

### **Local Development**
```bash
# Install dependencies
pnpm install

# Start Next.js dev server
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator  
pnpm android

# Run tests
pnpm test

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### **Building**
```bash
# Build for production
pnpm build

# Build iOS app
pnpm build:ios

# Export static files
pnpm export
```

## Import Patterns

### **Feature Imports**
```typescript
// Auth feature
import { AuthProvider, SignIn } from '@/features/auth';

// Scanner feature  
import { ScannerPage } from '@/features/scanner/pages/ScannerPage';
import { useCameraPermission } from '@/features/scanner/hooks/useCameraPermission';

// Products feature
import { productLookupService } from '@/features/products/services/productLookupService';
```

### **Shared Imports**
```typescript
// Shared UI components
import { Button } from '@/shared/components/ui/Button';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

// Shared hooks
import { useErrorHandling } from '@/shared/hooks/useErrorHandling';

// Shared utilities
import { composeStyles } from '@/shared/utils/style-helpers';
```

### **Core Imports**
```typescript
// Database
import { database } from '@/lib/database';

// Configuration
import { appConfig } from '@/config/app.config';
```

## Testing Strategy

### **Test Structure**
- Feature tests in `src/__tests__/features/`
- Shared component tests in `src/__tests__/shared/`
- Test utilities in `src/__tests__/setup/`

### **Test Types**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: Feature workflows and server actions
- **Component Tests**: React component behavior

### **Running Tests**
```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage
```

## Security Considerations

### **Server Actions**
- All data mutations use React 19 server actions
- Server-side validation and sanitization
- Secure by default, no client-side API exposure

### **Authentication**
- Better Auth with secure session management
- Protected routes and API endpoints
- Role-based access control ready

### **Data Protection**
- Environment variables for sensitive config
- No secrets in client-side code
- Secure database connections

## Performance Optimizations

### **Code Splitting**
- Feature-based code splitting
- Dynamic imports for large features
- Optimized bundle sizes

### **Server Components**
- Static generation where possible
- Server-side rendering for dynamic content
- Reduced client-side JavaScript

### **Mobile Optimizations**
- Expo optimizations for native performance
- Efficient image handling
- Memory-conscious component design

## Deployment

### **Web (Next.js)**
- Deploy to Vercel, Netlify, or any Node.js host
- Static export support for CDN deployment
- Environment-specific configurations

### **Mobile (Expo)**
- EAS Build for app store deployment
- Over-the-air updates with Expo Updates
- Platform-specific builds

## Future Enhancements

### **Planned Features**
- Offline support for mobile scanning
- Advanced analytics dashboard
- Multi-tenant organization support
- Enhanced AI product matching
- Real-time collaboration features

### **Technical Debt**
- Complete migration of remaining API routes to server actions
- Enhanced error boundaries for better UX
- Performance monitoring and optimization
- Comprehensive E2E testing

## Contributing

### **Adding New Features**
1. Create feature directory in `src/features/`
2. Follow the established pattern (components, actions, services)
3. Add corresponding page in `src/app/`
4. Update TypeScript paths if needed
5. Add tests for new functionality

### **Modifying Existing Features**
1. Keep changes within feature boundaries
2. Update shared components carefully (affects all features)
3. Run tests to ensure no breaking changes
4. Update documentation if architecture changes

This architecture provides a solid foundation for scaling Hedwig as a comprehensive PIM solution with excellent developer experience and maintainability.
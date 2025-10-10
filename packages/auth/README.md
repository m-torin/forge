# @repo/auth

Production-ready authentication package built on Better Auth with comprehensive
security, organization management, and modern authentication methods.

- _Can build:_ **NO**

- _Exports:_
  - **Core**: `.`, `./client`, `./server`, `./client/next`, `./server/next`,
    `./server/edge`
  - **Features**: `./actions`, `./components`, `./shared`, `./types`, `./config`
  - **Testing**: `./testing`, `./testing/mocks`

## 🚀 Quick Start

### AI Hints

```typescript
// Primary: Better Auth with organizations - server-side auth checks only
import { auth } from "@repo/auth/server/next";
// Edge: import { auth } from "@repo/auth/server/edge"
// Client: import { useAuth } from "@repo/auth/client/next"
// ❌ NEVER: Use server auth functions in client components
```

### Basic Setup

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@repo/auth/server";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
```

### Environment Variables

```bash
# Required
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://...

# Optional OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional SMS (Twilio or AWS SNS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Optional Email
RESEND_API_KEY=your-resend-api-key
```

## ✨ Key Features

### 🔐 Complete Authentication Methods

- **Email/Password**: Traditional authentication with secure password handling
- **Magic Links**: Passwordless email authentication
- **Social OAuth**: Google, GitHub, Discord, Facebook, Microsoft
- **Phone Number**: SMS-based authentication with OTP verification
- **Email OTP**: One-time password via email (alternative to magic links)
- **Passkeys**: WebAuthn/FIDO2 support for modern authentication
- **Anonymous Sessions**: Guest users before account creation
- **Two-Factor Authentication**: TOTP with backup codes

### 🏢 Organization System

- **Multi-tenant Organizations**: Complete organization management
- **Team Management**: Nested teams within organizations
- **Role-Based Access Control (RBAC)**:
  - Organization roles: `owner`, `admin`, `member`, `guest`
  - System roles: `super-admin`, `moderator`, `support`
- **Member Management**: Invitations, role updates, bulk operations
- **Service Accounts**: API-based authentication for services

### 🔑 API Key Management

- **Production-Ready**: Secure API key generation and validation
- **Rate Limiting**: Built-in rate limiting per key and IP
- **Permission System**: Granular permissions per API key
- **Service Authentication**: Service-to-service authentication
- **Bulk Operations**: Create, update, revoke multiple keys

### 👥 Admin Panel

- **User Management**: Create, update, delete users
- **Session Control**: View, revoke, manage user sessions
- **Impersonation**: Secure user impersonation for support
- **Ban/Unban**: User account management
- **Analytics**: Authentication metrics and monitoring

## 🛡️ Security Features

### Better Auth Native Security

- **Rate Limiting**: Comprehensive per-endpoint rate limiting
  - Sign-in: 10 attempts/minute
  - Sign-up: 5 attempts/5 minutes
  - Password reset: 3 attempts/5 minutes
  - 2FA: 5 attempts/minute
- **CSRF Protection**: Built-in CSRF token validation
- **Session Security**: HTTPOnly, Secure, SameSite cookies
- **IP Detection**: Multiple proxy header support

### Security Headers Integration

- **Content Security Policy**: OAuth provider whitelisting
- **Cross-Origin Policies**: COEP, COOP, CORP headers
- **HSTS**: Strict Transport Security
- **Additional Headers**: X-Frame-Options, X-Content-Type-Options, etc.

## 📱 New Authentication Features

### Anonymous Sessions

```typescript
// Create anonymous session for guest users
await createAnonymousSession();

// Link anonymous session to permanent account
await linkAnonymousAccount({
  email: "user@example.com",
  password: "password"
});
```

### Phone Number Authentication

```typescript
// Sign in with phone number (sends OTP)
await signInWithPhoneNumber("+1234567890");

// Verify phone OTP
await verifyPhoneOTP({
  phoneNumber: "+1234567890",
  otp: "123456"
});

// Add phone to existing account
await addPhoneNumber("+1234567890");
```

### Email OTP

```typescript
// Send email OTP (alternative to magic links)
await sendEmailOTP("user@example.com", "sign-in");

// Verify email OTP
await verifyEmailOTP({
  email: "user@example.com",
  otp: "123456"
});

// Sign in with email OTP
await signInWithEmailOTP("user@example.com");
```

### Enhanced Passkeys

```typescript
// Add passkey to account
await addPasskey({ name: "My Passkey" });

// Sign in with passkey
await signInWithPasskey({ autoFill: true });

// Sign up with passkey
await signUpWithPasskey({
  email: "user@example.com",
  passkeyName: "Main Device"
});
```

## 🏗️ Architecture

### Database Schema

The package includes comprehensive Prisma schema with:

- User management with phone number support
- Organization and team structures
- API key management
- Session tracking
- Audit logging

### Security Integration

- **Better Auth**: Handles core authentication, rate limiting, CSRF
- **Nosecone/Arcjet**: Security headers and advanced protection
- **Observability**: Comprehensive logging and monitoring

### Middleware Support

- **Next.js Middleware**: Edge and Node.js runtime support
- **API Routes**: Dedicated API middleware
- **Web Routes**: Public and protected route handling

## 🧪 Testing

Comprehensive test suite with:

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end authentication flows
- **Mock Utilities**: Test helpers and factories
- **Storybook**: Component documentation and testing

## 📚 Documentation

- **[Auth Package Overview](../../apps/docs/packages/auth/overview.mdx)**
- **[Better Auth Integration](../../apps/docs/packages/auth/better-auth.mdx)**
- **[Feature Summary](../../apps/docs/packages/auth/feature-summary.mdx)**

## 🔧 Development

### Testing

```bash
# Run auth package tests
pnpm test --filter @repo/auth

# Run with coverage
pnpm test:coverage --filter @repo/auth
```

### Type Safety

- Full TypeScript support
- Better Auth type inference
- Custom type definitions for organizations and teams

## 🚀 Production Deployment

### Security Checklist

- [ ] Set strong `BETTER_AUTH_SECRET`
- [ ] Configure HTTPS in production
- [ ] Set up SMS provider (Twilio/AWS SNS)
- [ ] Configure OAuth providers
- [ ] Set up rate limiting storage (Redis recommended)
- [ ] Configure security headers middleware

### Performance

- Session caching for high-traffic applications
- Database connection pooling
- Redis integration for rate limiting
- Edge runtime support for global deployment

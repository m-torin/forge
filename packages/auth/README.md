# @repo/auth-new

Modern, type-safe authentication package using Better Auth for the forge-ahead monorepo.

## Overview

This is the next-generation authentication package that provides:

- **Clean Architecture** - Organized `/src` structure with clear separation of concerns
- **Full Type Safety** - Proper TypeScript types without `any` usage
- **React 19 Native** - Built for React 19 without compatibility layers
- **Modular Design** - Plugin-based architecture for selective features
- **Better Developer Experience** - Clean APIs and comprehensive error handling

## Architecture

```
/src
  /client          - Client-side auth (hooks, components)
  /server          - Server-side auth (Better Auth config)
  /shared          - Shared types and utilities
  /middleware      - Auth middleware
  /components      - Pre-built auth components
```

## Features

- **Core Authentication**: Email/password, social providers, magic links
- **Organization Management**: Multi-tenant organizations with teams and roles
- **API Key Management**: Secure API keys with rate limiting and permissions
- **Admin Features**: User management, impersonation, and moderation tools
- **Security**: Two-factor auth, passkeys, session management
- **Email Integration**: Automated emails for all auth workflows
- **Next.js Integration**: Built-in middleware and server utilities

## Usage

### Installation

```bash
pnpm add @repo/auth-new
```

### Client-side

```tsx
import { useAuth, signIn, signOut } from '@repo/auth-new/client';

function LoginComponent() {
  const { user, isLoading, isAuthenticated } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn({ email, password });
    if (!result.success) {
      console.error(result.error);
    }
  };

  if (isAuthenticated) {
    return <div>Welcome, {user?.email}!</div>;
  }

  return <LoginForm onSubmit={handleSignIn} />;
}
```

### Server-side

```tsx
import { getCurrentUser, getSession } from '@repo/auth-new/server';

// In server components
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <div>Welcome, {user.email}!</div>;
}

// In API routes
export async function GET() {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({ user: session.user });
}
```

### Next.js Integration

```tsx
// app/layout.tsx
import { AuthProvider } from '@repo/auth-new/client-next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

// middleware.ts
import { authMiddleware } from '@repo/auth-new/server-next';

export default authMiddleware;

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

### Protected Routes

```tsx
import { ProtectedRoute } from '@repo/auth-new/components';

function App() {
  return (
    <ProtectedRoute fallback={<Loading />}>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

### Organization Management

```tsx
import { useOrganization, createOrganization } from '@repo/auth-new/client';

function OrganizationManager() {
  const { activeOrganization, organizations, setActiveOrganization } = useOrganization();

  const handleCreateOrg = async (name: string) => {
    await createOrganization({ name, slug: name.toLowerCase() });
  };

  return (
    <div>
      <select
        value={activeOrganization?.id}
        onChange={(e) => setActiveOrganization(e.target.value)}
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
      <button onClick={() => handleCreateOrg('New Org')}>Create Organization</button>
    </div>
  );
}
```

### API Key Management

```typescript
import { createApiKey, listApiKeys } from '@repo/auth-new/client';

async function setupApiKey() {
  const apiKey = await createApiKey({
    name: 'Production API',
    permissions: { read: ['user'], write: ['user'] },
    expiresIn: 365 * 24 * 60 * 60, // 1 year
  });

  console.log('API Key:', apiKey.key);
}
```

## Configuration

The package uses environment variables for configuration:

```env
# Required
BETTER_AUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=https://your-app.com

# Optional - Social Providers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## API Reference

### Client Hooks

- `useAuth()` - Get authentication state
- `useSession()` - Get session data
- `useUser()` - Get user data with loading state
- `useOrganization()` - Manage organizations

### Client Methods

- `signIn(credentials)` - Sign in with email/password
- `signOut()` - Sign out current user
- `signUp(data)` - Create new account
- `forgotPassword(email)` - Send password reset
- `resetPassword(token, password)` - Reset password

### Server Functions

- `getCurrentUser()` - Get current user server-side
- `getSession()` - Get session with organization data
- `authMiddleware()` - Protect routes with middleware

### Components

- `AuthProvider` - Provide auth context
- `ProtectedRoute` - Protect components
- `withAuth(Component)` - HOC for protection

## Migration from @repo/auth

### Import Changes

```typescript
// Old
import { authClient, useUser } from '@repo/auth';

// New
import { useAuth } from '@repo/auth-new/client';
import authClient from '@repo/auth-new/client';
```

### Hook Changes

```typescript
// Old: Complex compatibility layer
const { data, error, isPending } = useSession();

// New: Clean React 19 hooks
const { user, isLoading, isAuthenticated } = useAuth();
```

### Server Changes

```typescript
// Old
import { currentUser } from '@repo/auth/index.server';

// New
import { getCurrentUser } from '@repo/auth-new/server';
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Type Safety

This package provides complete TypeScript coverage with no `any` types:

```typescript
import type { User, Session, AuthSession, OrganizationRole } from '@repo/auth-new/types';
```

## Security Features

- **Session Management**: Secure cookie-based sessions
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: API key rate limiting
- **Password Security**: Secure password hashing
- **Two-Factor Auth**: TOTP-based 2FA
- **Passkeys**: WebAuthn support

## Performance

- **Bundle Size**: 50% smaller than legacy auth
- **Tree Shaking**: Full ES modules support
- **Session Caching**: 5-minute cookie cache
- **Lazy Loading**: Components load on demand

## Support

For issues and questions:

1. Check the [documentation](../documentation)
2. Review existing issues
3. Create new issue with reproduction steps

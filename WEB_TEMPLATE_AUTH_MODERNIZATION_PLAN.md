# Web Template Auth Modernization Plan - Consumer App Focus

## Overview
This plan focuses on modernizing authentication for the consumer-facing web application, covering user login/signup flows and protected account pages.

## Current State Analysis

### ✅ What's Already Working
1. **User Authentication Flow**
   - Login page with email/password
   - Signup page with registration
   - Forgot password with reset flow
   - Social login buttons (Google, Facebook, Twitter)
   - Logout functionality

2. **Protected Account Pages**
   - Account settings
   - Password change
   - Order history
   - Wishlists/Favorites
   - Billing information

3. **Basic Integration**
   - AuthProvider wrapping the app
   - Server-side auth checks in account layout
   - Guest navigation menu with auth state

### ❌ What Needs Modernization

#### 1. **Route Protection Strategy**
- No middleware.ts for edge-level protection
- Auth checks scattered across individual pages
- Missing centralized route protection
- No optimistic UI for auth state

#### 2. **Enhanced User Features**
- No "Remember Me" functionality
- Missing social account linking
- No session management UI
- No email verification flow
- No device management

#### 3. **Security Improvements**
- Missing rate limiting on auth endpoints
- No CSRF protection setup
- No session timeout handling
- No suspicious login detection

#### 4. **User Experience**
- No loading states during auth operations
- Missing error recovery flows
- No deep linking after login
- Hard-coded redirect paths

## Modernization Plan - Consumer Focus

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 Add Middleware for Route Protection
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split('/')[1] || 'en';
  
  // Define protected routes
  const protectedRoutes = [
    `/${locale}/account`,
    `/${locale}/account-password`,
    `/${locale}/account-billing`,
    `/${locale}/account-wishlists`,
    `/${locale}/orders`,
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute) {
    // Check for auth cookie/token
    const token = request.cookies.get('better-auth.session_token');
    
    if (!token) {
      // Redirect to login with return URL
      const url = new URL(`/${locale}/login`, request.url);
      url.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

#### 1.2 Create Reusable Auth Components
```typescript
// components/auth/ProtectedPage.tsx
'use client';

import { useAuth } from '@repo/auth/client/next';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui';

export function ProtectedPage({ 
  children, 
  fallback = '/login',
  loadingComponent
}: {
  children: React.ReactNode;
  fallback?: string;
  loadingComponent?: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push(fallback);
    }
  }, [user, isLoading, router, fallback]);
  
  if (isLoading) {
    return loadingComponent || <LoadingSpinner />;
  }
  
  if (!user) {
    return null;
  }
  
  return <>{children}</>;
}
```

#### 1.3 Improve Auth Context Usage
```typescript
// Update providers.tsx
import { AuthProvider } from '@repo/auth/client/next';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  
  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <AuthProvider
        onSignIn={(user) => {
          // Handle successful sign in
          const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
          router.push(returnUrl || '/account');
        }}
        onSignOut={() => {
          // Handle sign out
          router.push('/');
        }}
      >
        <AnalyticsProvider>
          <GuestActionsProvider>{children}</GuestActionsProvider>
        </AnalyticsProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
```

### Phase 2: Enhanced User Features (Week 2)

#### 2.1 Remember Me Functionality
```typescript
// login-client.tsx updates
const form = useForm<LoginFormData>({
  initialValues: {
    email: '',
    password: '',
    rememberMe: false, // Add this
  },
  validate: zodResolver(loginSchema),
});

const handleSubmit = async (values: LoginFormData) => {
  const { data, error } = await authClient.signIn.email({
    email: values.email,
    password: values.password,
    rememberMe: values.rememberMe, // Pass to auth
  });
};
```

#### 2.2 Email Verification Flow
```typescript
// components/auth/EmailVerificationBanner.tsx
export function EmailVerificationBanner() {
  const { user } = useAuth();
  
  if (!user || user.emailVerified) return null;
  
  return (
    <Alert 
      icon={<IconAlertCircle />} 
      title="Verify your email"
      color="yellow"
    >
      Please check your email to verify your account.
      <Button size="xs" onClick={resendVerification}>
        Resend email
      </Button>
    </Alert>
  );
}
```

#### 2.3 Social Account Linking
```typescript
// account/page.tsx - Add social account section
function SocialAccountsSection() {
  const { user } = useAuth();
  
  const linkSocialAccount = async (provider: string) => {
    await authClient.linkAccount({
      provider,
      callbackURL: '/account',
    });
  };
  
  return (
    <Card>
      <Title order={3}>Connected Accounts</Title>
      <Stack>
        {['google', 'facebook', 'twitter'].map(provider => (
          <SocialProviderRow 
            key={provider}
            provider={provider}
            connected={user.accounts?.some(a => a.provider === provider)}
            onLink={() => linkSocialAccount(provider)}
            onUnlink={() => unlinkSocialAccount(provider)}
          />
        ))}
      </Stack>
    </Card>
  );
}
```

### Phase 3: Security & UX Improvements (Week 3)

#### 3.1 Session Management
```typescript
// components/account/SessionManager.tsx
export function SessionManager() {
  const { sessions, currentSessionId } = useAuth();
  
  return (
    <Card>
      <Title order={3}>Active Sessions</Title>
      <Stack>
        {sessions?.map(session => (
          <SessionItem
            key={session.id}
            session={session}
            isCurrent={session.id === currentSessionId}
            onRevoke={() => revokeSession(session.id)}
          />
        ))}
      </Stack>
    </Card>
  );
}
```

#### 3.2 Loading States & Error Handling
```typescript
// hooks/useAuthAction.ts
export function useAuthAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = async (authFn: () => Promise<any>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authFn();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication error';
      setError(message);
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { execute, isLoading, error };
}
```

#### 3.3 Deep Linking Support
```typescript
// utils/auth-redirect.ts
export function getPostAuthRedirect(): string {
  // Check URL params first
  const params = new URLSearchParams(window.location.search);
  const returnUrl = params.get('returnUrl');
  
  if (returnUrl && isValidRedirect(returnUrl)) {
    return returnUrl;
  }
  
  // Check session storage for saved location
  const savedLocation = sessionStorage.getItem('preAuthLocation');
  if (savedLocation) {
    sessionStorage.removeItem('preAuthLocation');
    return savedLocation;
  }
  
  // Default redirect
  return '/account';
}

function isValidRedirect(url: string): boolean {
  // Ensure URL is relative and safe
  return url.startsWith('/') && !url.startsWith('//');
}
```

## Implementation Checklist

### Week 1 - Core Infrastructure
- [ ] Create middleware.ts for route protection
- [ ] Add ProtectedPage component
- [ ] Update AuthProvider with navigation callbacks
- [ ] Add loading states to all auth pages
- [ ] Implement proper error boundaries

### Week 2 - User Features
- [ ] Add Remember Me checkbox to login
- [ ] Create email verification banner
- [ ] Build social account linking UI
- [ ] Add session timeout warnings
- [ ] Implement device management

### Week 3 - Polish & Security
- [ ] Add rate limiting to auth endpoints
- [ ] Implement CSRF protection
- [ ] Create session management UI
- [ ] Add suspicious login alerts
- [ ] Improve error messages

## Environment Variables Required

```env
# Core Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
BETTER_AUTH_TRUSTED_ORIGINS=

# Social Providers (Optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# Email Provider
RESEND_API_KEY=
EMAIL_FROM=
```

## Testing Checklist

### User Flows to Test
- [ ] New user registration
- [ ] Email/password login
- [ ] Social login (each provider)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Remember me functionality
- [ ] Session timeout
- [ ] Protected route access
- [ ] Deep linking after auth

### Edge Cases
- [ ] Invalid credentials
- [ ] Network errors
- [ ] Expired sessions
- [ ] Concurrent logins
- [ ] Social account conflicts

## Success Metrics

1. **Security**
   - All account pages protected by middleware
   - No unauthorized access to user data
   - Rate limiting prevents brute force

2. **User Experience**
   - Auth operations show loading states
   - Errors are handled gracefully
   - Users return to intended destination after login
   - Social login works seamlessly

3. **Performance**
   - Auth checks don't block page loads
   - Session validation is cached appropriately
   - Minimal redirects during auth flow
# Stack-Auth Extended Guide

**Tier 2 Documentation** - Detailed Better Auth patterns, security considerations, and edge runtime strategies.

**Quick Reference**: See `.claude/agents/stack-auth.md` for essentials.

---

## Table of Contents

1. [Detailed Patterns](#detailed-patterns)
2. [Anti-Patterns and Solutions](#anti-patterns-and-solutions)
3. [Better Auth Configuration](#better-auth-configuration)
4. [Edge Runtime Strategies](#edge-runtime-strategies)
5. [Organization RBAC Implementation](#organization-rbac-implementation)
6. [OAuth Provider Integration](#oauth-provider-integration)
7. [Security Hardening](#security-hardening)
8. [Performance Optimization](#performance-optimization)
9. [Troubleshooting Guide](#troubleshooting-guide)

---

## Detailed Patterns

### 1. Dual Environment Support (Node.js + Edge)

**Node.js Server Utilities** (`packages/auth/src/server-next.ts`):
```typescript
import { cookies } from 'next/headers';
import { createNodeClient } from '@repo/db-prisma/node';
import type { Session, User } from 'better-auth';

export async function getSession(): Promise<Session | null> {
  const token = cookies().get('session')?.value;
  if (!token) return null;

  return validateToken(token);
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

export async function requireRole(allowedRoles: string[]): Promise<Session> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error('Insufficient permissions');
  }
  return session;
}
```

**Edge Runtime Utilities** (`packages/auth/src/server-edge.ts`):
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOptimalClient } from '@repo/db-prisma/prisma/clients/resolver';

export async function getSession(request: NextRequest): Promise<Session | null> {
  const token = request.cookies.get('session')?.value;
  if (!token) return null;

  return validateToken(token);
}

export async function authMiddleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Add session context to headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', session.user.id);
  response.headers.set('x-user-role', session.user.role);

  return response;
}

export async function protectedRoute(
  request: NextRequest,
  allowedRoles?: string[]
) {
  const session = await getSession(request);

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  return null; // Allow request to proceed
}
```

### 2. SafeEnv Pattern for Better Auth

**Comprehensive environment validation**:

```typescript
// packages/auth/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const authEnv = createEnv({
  server: {
    // Core
    BETTER_AUTH_SECRET: z.string().min(32, 'Secret must be at least 32 characters'),
    BETTER_AUTH_URL: z.string().url(),

    // Database
    DATABASE_URL: z.string().url().startsWith('postgresql://'),

    // OAuth Providers
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    // Email (Magic Links)
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().optional(),

    // API Keys
    API_KEY_SALT: z.string().min(16).optional(),
  },

  client: {
    NEXT_PUBLIC_AUTH_URL: z.string().url(),
  },

  runtimeEnv: {
    // Server
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    API_KEY_SALT: process.env.API_KEY_SALT,

    // Client
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
  },

  onValidationError: (error) => {
    console.warn('⚠️  Auth environment validation failed:', error.flatten().fieldErrors);
    // In packages, return fallback (never throw)
    return undefined as never;
  },
});

export function safeAuthEnv() {
  return authEnv || {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || 'http://localhost:3200',
    DATABASE_URL: process.env.DATABASE_URL || '',
    NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL || 'http://localhost:3200',
  };
}
```

### 3. Edge-Compatible Middleware

**Flexible middleware with role-based protection**:

```typescript
// packages/auth/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './server-edge';

export interface MiddlewareConfig {
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
  publicPaths?: string[];
}

export function createAuthMiddleware(config: MiddlewareConfig = {}) {
  return async function middleware(request: NextRequest) {
    const {
      requireAuth = true,
      allowedRoles,
      redirectTo = '/login',
      publicPaths = ['/login', '/signup', '/'],
    } = config;

    // Skip public paths
    if (publicPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
      return NextResponse.next();
    }

    // Get session
    const session = await getSession(request);

    // Check auth requirement
    if (requireAuth && !session) {
      const loginUrl = new URL(redirectTo, request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role requirement
    if (session && allowedRoles && !allowedRoles.includes(session.user.role)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Add session context to request headers
    const response = NextResponse.next();
    if (session) {
      response.headers.set('x-user-id', session.user.id);
      response.headers.set('x-user-email', session.user.email);
      response.headers.set('x-user-role', session.user.role);
    }

    return response;
  };
}

// Usage in app middleware.ts
export const middleware = createAuthMiddleware({
  requireAuth: true,
  allowedRoles: ['user', 'admin'],
  redirectTo: '/auth/login',
  publicPaths: ['/login', '/signup', '/api/health'],
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 4. Organization RBAC Implementation

**Complete permission system**:

```typescript
// packages/auth/src/permissions.ts
import { createNodeClient } from '@repo/db-prisma/node';

const db = createNodeClient();

export interface Permission {
  name: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

export interface Role {
  name: string;
  permissions: Permission[];
}

// Cache for role lookups (avoid DB query on every check)
const roleCache = new Map<string, Role>();

export async function getOrgMembership(userId: string, orgId: string) {
  const membership = await db.organizationMember.findUnique({
    where: { userId_orgId: { userId, orgId } },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  return membership;
}

export async function hasOrgPermission(
  userId: string,
  orgId: string,
  permission: string
): Promise<boolean> {
  // Check cache first
  const cacheKey = `${userId}:${orgId}`;
  let role = roleCache.get(cacheKey);

  if (!role) {
    const membership = await getOrgMembership(userId, orgId);
    if (!membership) return false;

    role = membership.role;
    roleCache.set(cacheKey, role);

    // Expire cache after 5 minutes
    setTimeout(() => roleCache.delete(cacheKey), 5 * 60 * 1000);
  }

  return role.permissions.some(p => p.name === permission);
}

export async function requireOrgPermission(
  userId: string,
  orgId: string,
  permission: string
): Promise<void> {
  const has = await hasOrgPermission(userId, orgId, permission);
  if (!has) {
    throw new Error(`Missing required permission: ${permission}`);
  }
}

export async function getUserOrgs(userId: string) {
  return db.organizationMember.findMany({
    where: { userId },
    include: {
      organization: true,
      role: true,
    },
  });
}

export async function inviteToOrg(
  orgId: string,
  email: string,
  role: string,
  invitedBy: string
) {
  // Create invitation
  const invitation = await db.organizationInvitation.create({
    data: {
      orgId,
      email,
      role,
      invitedBy,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Send invitation email (coordinate with integrations)
  // await sendInvitationEmail(email, invitation);

  return invitation;
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await db.organizationInvitation.findUnique({
    where: { token },
  });

  if (!invitation) throw new Error('Invitation not found');
  if (invitation.expiresAt < new Date()) throw new Error('Invitation expired');
  if (invitation.acceptedAt) throw new Error('Invitation already accepted');

  // Add user to organization
  await db.$transaction([
    db.organizationMember.create({
      data: {
        userId,
        orgId: invitation.orgId,
        role: invitation.role,
      },
    }),
    db.organizationInvitation.update({
      where: { token },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return invitation.orgId;
}
```

---

## Anti-Patterns and Solutions

### 1. Node APIs in Edge Runtime

**❌ Problem**:
```typescript
// packages/auth/src/server-edge.ts
import fs from 'fs';
import crypto from 'crypto';

export function loadConfig() {
  // FAILS: fs not available in edge runtime
  return JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
}

export function hashPassword(password: string) {
  // FAILS: crypto not available in edge runtime
  return crypto.createHash('sha256').update(password).digest('hex');
}
```

**✅ Solution**: Use Web APIs or separate files
```typescript
// packages/auth/src/server-edge.ts
export async function hashPassword(password: string) {
  // Use Web Crypto API (available in edge)
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// packages/auth/src/server-next.ts (Node.js only)
import crypto from 'crypto';

export function hashPasswordNode(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}
```

### 2. Direct process.env Access

**❌ Problem**: No validation, fails silently
```typescript
const secret = process.env.BETTER_AUTH_SECRET;
// May be undefined, empty, or too short
```

**✅ Solution**: Use SafeEnv pattern
```typescript
import { safeAuthEnv } from '../env';

const secret = safeAuthEnv().BETTER_AUTH_SECRET;
// Validated at startup, always correct or app fails fast
```

### 3. Hardcoded URLs

**❌ Problem**: Breaks in different environments
```typescript
return Response.redirect('http://localhost:3200/dashboard');
// Wrong in staging, production, preview deployments
```

**✅ Solution**: Environment-aware URLs
```typescript
import { safeAuthEnv } from '../env';

return Response.redirect(`${safeAuthEnv().BETTER_AUTH_URL}/dashboard`);
```

### 4. Auth Logic in UI Components

**❌ Problem**: Tight coupling, hard to test
```typescript
// app/components/LoginButton.tsx
'use client';

export function LoginButton() {
  const handleLogin = async () => {
    // Direct auth logic in UI - WRONG
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  };
}
```

**✅ Solution**: Separate concerns
```typescript
// packages/auth/src/client-next.ts
export function useAuth() {
  const signIn = async (credentials: { email: string; password: string }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.json();
  };

  return { signIn };
}

// app/components/LoginButton.tsx
import { useAuth } from '@repo/auth/client/next';

export function LoginButton() {
  const { signIn } = useAuth();

  const handleLogin = () => signIn({ email, password });
}
```

---

## Better Auth Configuration

### Complete Configuration Example

```typescript
// packages/auth/src/config.ts
import { betterAuth } from 'better-auth';
import { createNodeClient } from '@repo/db-prisma/node';
import { safeAuthEnv } from './env';

const db = createNodeClient();

export const auth = betterAuth({
  // Database
  database: db,

  // Core settings
  secret: safeAuthEnv().BETTER_AUTH_SECRET,
  baseURL: safeAuthEnv().BETTER_AUTH_URL,

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session after 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  // Social providers
  socialProviders: {
    github: {
      clientId: safeAuthEnv().GITHUB_CLIENT_ID,
      clientSecret: safeAuthEnv().GITHUB_CLIENT_SECRET,
      enabled: !!safeAuthEnv().GITHUB_CLIENT_ID,
    },
    google: {
      clientId: safeAuthEnv().GOOGLE_CLIENT_ID,
      clientSecret: safeAuthEnv().GOOGLE_CLIENT_SECRET,
      enabled: !!safeAuthEnv().GOOGLE_CLIENT_ID,
    },
  },

  // Email authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },

  // Magic links
  magicLink: {
    enabled: true,
    sendMagicLink: async ({ email, url }) => {
      // Coordinate with integrations for email sending
      // await sendEmail({ to: email, subject: 'Login link', body: `Click here: ${url}` });
    },
  },

  // Passkeys (WebAuthn)
  passkey: {
    enabled: true,
    rpName: 'Forge',
    rpID: new URL(safeAuthEnv().BETTER_AUTH_URL).hostname,
  },

  // Organizations
  organizations: {
    enabled: true,
    allowUserToCreateOrganization: true,
    roles: [
      { name: 'owner', description: 'Full access' },
      { name: 'admin', description: 'Manage members and settings' },
      { name: 'member', description: 'Basic access' },
    ],
  },

  // API keys
  apiKey: {
    enabled: true,
    expiresIn: 60 * 60 * 24 * 365, // 1 year
    prefix: 'sk_',
  },

  // Security
  csrf: {
    enabled: true,
  },

  rateLimit: {
    enabled: true,
    window: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
  },

  // Callbacks
  callbacks: {
    onSignIn: async ({ user, session }) => {
      console.log('User signed in:', user.email);
      // Log authentication event
    },
    onSignOut: async ({ session }) => {
      console.log('User signed out');
    },
  },
});
```

---

## Edge Runtime Strategies

### Strategy 1: Prisma Client Resolver

**Use optimal client based on runtime**:

```typescript
// packages/auth/src/server-edge.ts
import { getOptimalClient } from '@repo/db-prisma/prisma/clients/resolver';

export async function validateSession(token: string) {
  const client = getOptimalClient({ runtime: 'edge' });

  const session = await client.session.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, role: true } } },
  });

  return session;
}
```

### Strategy 2: Caching for Performance

**Reduce database calls in edge**:

```typescript
// packages/auth/src/cache.ts
const sessionCache = new Map<string, { session: Session; expires: number }>();

export async function getCachedSession(token: string): Promise<Session | null> {
  // Check cache first
  const cached = sessionCache.get(token);
  if (cached && cached.expires > Date.now()) {
    return cached.session;
  }

  // Fetch from database
  const session = await validateSession(token);
  if (!session) return null;

  // Cache for 5 minutes
  sessionCache.set(token, {
    session,
    expires: Date.now() + 5 * 60 * 1000,
  });

  return session;
}
```

### Strategy 3: Middleware Performance

**Optimize middleware for edge**:

```typescript
// Fast path for public routes
export function authMiddleware(request: NextRequest) {
  // Skip heavy auth logic for static assets
  if (request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Use cached session lookup
  return getCachedSession(request).then(session => {
    if (!session && requiresAuth(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  });
}
```

---

## OAuth Provider Integration

### Adding GitHub OAuth

**Step-by-step guide**:

1. **Create OAuth app** (coordinate with infra):
   - Go to GitHub Settings → Developer Settings → OAuth Apps
   - Set callback URL: `https://yourdomain.com/api/auth/github/callback`
   - Get Client ID and Client Secret

2. **Add environment variables**:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

3. **Update Better Auth config**:
```typescript
// packages/auth/src/config.ts
socialProviders: {
  github: {
    clientId: safeAuthEnv().GITHUB_CLIENT_ID,
    clientSecret: safeAuthEnv().GITHUB_CLIENT_SECRET,
  },
}
```

4. **Add UI button** (coordinate with stack-tailwind-mantine):
```typescript
// app/components/LoginButtons.tsx
import { useAuth } from '@repo/auth/client/next';

export function GitHubLoginButton() {
  const { signIn } = useAuth();

  return (
    <button onClick={() => signIn({ provider: 'github' })}>
      Sign in with GitHub
    </button>
  );
}
```

5. **Test flow**:
   - Click button → Redirects to GitHub
   - Authorize → Redirects back to app
   - Session created → User logged in

---

## Security Hardening

### OWASP Top 10 Compliance

**1. Injection Prevention**:
- ✅ Use Prisma parameterized queries (never raw SQL with user input)
- ✅ Validate all inputs with Zod schemas

**2. Authentication**:
- ✅ Strong password requirements (min 8 chars)
- ✅ Rate limiting on login attempts
- ✅ Session expiration (7 days)
- ✅ Secure cookie flags (httpOnly, secure, sameSite)

**3. Sensitive Data Exposure**:
- ✅ Secrets in environment variables (not code)
- ✅ HTTPS only in production
- ✅ No sensitive data in logs

**4. XML External Entities (XXE)**: N/A (no XML parsing)

**5. Broken Access Control**:
- ✅ Middleware enforces authentication
- ✅ Role-based permission checks
- ✅ Organization membership validated

**6. Security Misconfiguration**:
- ✅ CSRF protection enabled
- ✅ CORS configured properly
- ✅ Security headers (helmet.js)

**7. Cross-Site Scripting (XSS)**:
- ✅ React escapes output by default
- ✅ Sanitize user input in emails

**8. Insecure Deserialization**: N/A (JWT signed tokens)

**9. Using Components with Known Vulnerabilities**:
- ✅ Regular dependency updates
- ✅ `pnpm audit` in CI

**10. Insufficient Logging & Monitoring**:
- ✅ Log authentication events
- ✅ Monitor rate limits
- ✅ Alert on suspicious activity

---

## Performance Optimization

### Session Validation Benchmarks

**Target**: <10ms session validation

**Optimization strategies**:

1. **Cache sessions in memory**:
```typescript
const cache = new Map<string, Session>();

export async function getSession(token: string) {
  if (cache.has(token)) return cache.get(token);

  const session = await db.session.findUnique({ where: { token } });
  if (session) cache.set(token, session);

  return session;
}
```

2. **Use Redis for distributed caching** (coordinate with integrations):
```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({ url: '...', token: '...' });

export async function getSession(token: string) {
  const cached = await redis.get(`session:${token}`);
  if (cached) return JSON.parse(cached);

  const session = await db.session.findUnique({ where: { token } });
  if (session) {
    await redis.setex(`session:${token}`, 300, JSON.stringify(session));
  }

  return session;
}
```

3. **Selective database queries**:
```typescript
// ❌ Bad: Fetches all user fields
const session = await db.session.findUnique({
  where: { token },
  include: { user: true },
});

// ✅ Good: Only what's needed
const session = await db.session.findUnique({
  where: { token },
  select: {
    id: true,
    expiresAt: true,
    user: {
      select: { id: true, email: true, role: true },
    },
  },
});
```

---

## Troubleshooting Guide

### Common Issues

**Issue: "CSRF token mismatch"**
- **Cause**: Cookie not sent or token invalid
- **Solution**: Check cookie domain, sameSite settings
- **Fix**: Ensure CSRF token in form matches cookie

**Issue: "Session expired immediately"**
- **Cause**: Cookie not persisting
- **Solution**: Check secure flag (HTTPS required), sameSite settings
- **Fix**: Use `sameSite: 'lax'` for cross-origin

**Issue: "OAuth redirect not working"**
- **Cause**: Callback URL mismatch
- **Solution**: Ensure OAuth app callback URL matches `BETTER_AUTH_URL`
- **Fix**: Update OAuth app settings

**Issue: "Edge middleware fails"**
- **Cause**: Node.js API used
- **Solution**: Check imports (no `fs`, `crypto`, `path`)
- **Fix**: Use Web APIs or separate edge/node files

**Issue: "Permission denied"**
- **Cause**: Role/permission not assigned
- **Solution**: Check organization membership and role
- **Fix**: Assign correct role or update permission

---

**End of Extended Guide** | For quick reference, see `.claude/agents/stack-auth.md`

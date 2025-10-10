# Security Extended Guide

Comprehensive security patterns, vulnerability triage, and compliance practices.

## Table of Contents

1. [Vulnerability Triage Workflows](#vulnerability-triage-workflows)
2. [Secret Management Patterns](#secret-management-patterns)
3. [Auth Security Patterns](#auth-security-patterns)
4. [Webhook Security](#webhook-security)
5. [Renovate PR Review Process](#renovate-pr-review-process)
6. [Common Security Issues](#common-security-issues)
7. [Incident Response](#incident-response)
8. [Troubleshooting](#troubleshooting)

---

## Vulnerability Triage Workflows

### Workflow 1: Critical Vulnerability Response

**Trigger:** `pnpm audit` shows critical (CVSS >= 9.0) vulnerability

**Steps:**

1. **Assess Severity**
```bash
pnpm audit --recursive --json > audit.json
# Analyze JSON for CVE details
```

2. **Research Exploit**
- Check NIST NVD for CVE details
- Review GitHub Security Advisories
- Check if exploit is actively used

3. **Determine Exploitability**
```typescript
// Is the vulnerable code path actually used?
// Example: jsonwebtoken signature bypass
// - Do we use JWT? Yes
// - Do we verify signatures? Yes
// - Exploitable: YES → High priority
```

4. **Assign Owner**
```markdown
TodoWrite:
- Task: Remediate CVE-2022-23529 in jsonwebtoken
- Owner: stack-auth (owns JWT usage)
- Deadline: 24 hours (critical SLA)
- Acceptance: Upgrade to v9.0.0, tests pass, audit clean
```

5. **Track Resolution**
```bash
# After fix
pnpm audit --recursive
# Verify 0 critical vulnerabilities
```

6. **Document**
```markdown
## [2025-01-15] JWT Vulnerability CVE-2022-23529
**Severity**: Critical (CVSS 9.8)
**Affected**: All apps (JWT auth)
**Fix**: Upgraded jsonwebtoken 8.5.1 → 9.0.0
**Testing**: Full auth test suite passed
**Downtime**: None
**SLA**: Resolved in 18 hours (met 24h SLA)
```

---

## Secret Management Patterns

### Pattern 1: SafeEnv Configuration

```typescript
// packages/example/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    JWT_SECRET: z.string().min(32),
    REDIS_URL: z.string().url()
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    JWT_SECRET: process.env.JWT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },
  onValidationError: (error) => {
    console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
    throw new Error('Invalid environment configuration');
  }
});
```

### Pattern 2: Secret Rotation

```bash
# 1. Generate new secret in Doppler
doppler secrets set STRIPE_SECRET_KEY sk_live_NEW_KEY --project forge --config production

# 2. Deploy with zero downtime (both old and new work temporarily)
# Update SafeEnv to accept both formats temporarily if needed

# 3. Deploy new version
vercel deploy --prod

# 4. Verify applications work
curl -H "Authorization: Bearer sk_live_NEW_KEY" https://api.stripe.com/v1/customers

# 5. Revoke old secret
# In Stripe dashboard, revoke old API key

# 6. Document
# Update security-learnings.md with rotation details
```

---

## Auth Security Patterns

### Pattern 1: Server-Side Auth Check

```typescript
// ✅ GOOD: Server-side auth
// app/api/sensitive/route.ts
import { auth } from '@repo/auth/server/next';

export async function GET() {
  const session = await auth();

  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check permissions
  if (!session.user.roles.includes('admin')) {
    return new Response('Forbidden', { status: 403 });
  }

  return Response.json({ sensitive: 'data' });
}
```

### Pattern 2: Server Action Auth

```typescript
// ✅ GOOD: Auth in server action
'use server';

import { auth } from '@repo/auth/server/next';
import { z } from 'zod';

const deleteUserSchema = z.object({
  userId: z.string().uuid()
});

export async function deleteUser(formData: FormData) {
  const session = await auth();

  if (!session?.user.roles.includes('admin')) {
    throw new Error('Forbidden');
  }

  const { userId } = deleteUserSchema.parse(Object.fromEntries(formData));

  await db.user.delete({ where: { id: userId } });
}
```

### Pattern 3: Middleware Auth

```typescript
// ✅ GOOD: Edge middleware auth
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@repo/auth/server/edge';

export async function middleware(request: NextRequest) {
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const session = await auth(request);

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role
    if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
      if (!session.user.roles.includes('admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
```

---

## Webhook Security

### Pattern 1: Stripe Webhook Verification

```typescript
// ✅ GOOD: Use Stripe SDK for verification
import Stripe from 'stripe';
import { env } from './env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );

    // Process event (already verified)
    await handleEvent(event);

    return new Response('OK');
  } catch (error) {
    console.error('[Webhook] Verification failed:', error);
    return new Response('Invalid signature', { status: 400 });
  }
}
```

### Pattern 2: Custom HMAC Verification with Timing Safety

```typescript
// ✅ GOOD: Timing-safe comparison
import crypto from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestampHeader?: string,
  toleranceSeconds = 300
): boolean {
  // Optional: Check timestamp to prevent replay attacks
  if (timestampHeader) {
    const timestamp = parseInt(timestampHeader, 10);
    const now = Math.floor(Date.now() / 1000);

    if (Math.abs(now - timestamp) > toleranceSeconds) {
      console.warn('[Webhook] Timestamp outside tolerance');
      return false;
    }
  }

  // Compute expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Timing-safe comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}
```

---

## Renovate PR Review Process

### Checklist for Reviewing Renovate PRs

1. **Check Semver**
   - Patch (x.x.X): Low risk, auto-merge usually safe
   - Minor (x.X.0): Medium risk, review changelog
   - Major (X.0.0): High risk, review breaking changes

2. **Review Changelog**
```bash
# Find changelog link in PR description
# Look for:
# - Breaking changes
# - Security fixes
# - Deprecations
# - New features that might conflict
```

3. **Check Dependencies**
```bash
# See what depends on this package
pnpm why <package-name>
```

4. **Run Tests**
```bash
# Renovate PRs should have CI passing, but verify locally if major
pnpm typecheck
pnpm lint
pnpm test
```

5. **Coordinate if Breaking**
```markdown
# If breaking changes detected
TodoWrite:
- Task: Review breaking changes in <package> vX.0.0
- Owner: <specialist> (package owner)
- Details: [Link to changelog]
- Acceptance: Tests pass, no regressions
```

6. **Merge Strategy**
   - Auto-merge: Patch updates with passing CI
   - Manual merge: Minor updates after review
   - Coordinate: Major updates with breaking changes

---

## Common Security Issues

### Issue 1: Secrets in Logs

❌ **BAD:**
```typescript
console.log('Database URL:', process.env.DATABASE_URL);
console.error('Auth failed:', { user, apiKey });
```

✅ **GOOD:**
```typescript
console.log('Database connected');
console.error('Auth failed:', { userId: user.id });  // No sensitive data
```

### Issue 2: No Rate Limiting

❌ **BAD:**
```typescript
export async function POST(request: Request) {
  await expensiveOperation();  // Can be DDOSed
  return Response.json({ success: true });
}
```

✅ **GOOD:**
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@repo/3p-upstash';

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s')
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }

  await expensiveOperation();
  return Response.json({ success: true });
}
```

### Issue 3: SQL Injection (if using raw queries)

❌ **BAD:**
```typescript
// NEVER use string interpolation with raw queries
const userId = request.params.id;
const user = await db.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
```

✅ **GOOD:**
```typescript
// Use Prisma's typed queries (parameterized by default)
const user = await db.user.findUnique({
  where: { id: userId }
});

// Or if raw query needed, use Prisma.$queryRaw with tagged template
const user = await db.$queryRaw`SELECT * FROM users WHERE id = ${userId}`;
// ^ Prisma automatically parameterizes
```

### Issue 4: XSS in User Input

❌ **BAD:**
```typescript
// Rendering unsanitized HTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

✅ **GOOD:**
```typescript
// Use React's default escaping
<div>{userInput}</div>

// Or sanitize with DOMPurify if HTML needed
import DOMPurify from 'isomorphic-dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### Issue 5: Client-Side-Only Auth

❌ **BAD:**
```typescript
'use client';

export function SensitiveComponent() {
  const { user } = useSession();

  if (!user) return <Login />;  // Can be bypassed with DevTools!

  return <div>{sensitiveData}</div>;
}
```

✅ **GOOD:**
```typescript
// Server component with server-side auth
import { auth } from '@repo/auth/server/next';

export default async function SensitiveComponent() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <div>{await fetchSensitiveData()}</div>;
}
```

---

## Incident Response

### Procedure: Security Incident Detected

1. **Immediate Actions** (0-15 minutes)
   - Notify orchestrator immediately
   - Assess scope (what data/systems affected?)
   - Isolate if needed (disable feature, revoke keys)

2. **Investigation** (15-60 minutes)
   - Review logs for extent of breach
   - Identify attack vector
   - List affected users/data

3. **Mitigation** (1-4 hours)
   - Deploy fix or workaround
   - Rotate compromised secrets
   - Verify exploit is patched

4. **Communication** (ongoing)
   - Update orchestrator with status
   - Document in memory
   - Prepare user notification if needed

5. **Post-Mortem** (24-48 hours)
   - Write incident report
   - Identify root cause
   - Create prevention tasks

---

## Troubleshooting

### Issue: pnpm audit shows false positive

**Solution:**
```bash
# Check if vulnerability is exploitable in our usage
pnpm why <vulnerable-package>

# If not exploitable, add to audit ignore (with justification)
# .npmrc or pnpm-workspace.yaml
```

### Issue: SafeEnv validation fails in CI

**Solution:**
```bash
# Verify all required env vars are set in CI
# Check Doppler integration or CI secrets

# Temporary: Use fallback in SafeEnv
onValidationError: (error) => {
  if (process.env.CI) {
    console.warn('CI env validation failed:', error);
    return undefined as never;  // Allow CI to continue
  }
  throw error;
}
```

### Issue: Webhook signature verification failing

**Solution:**
1. Verify webhook secret is correct
2. Check signature header name
3. Ensure raw body is used (not parsed JSON)
4. Check timestamp tolerance
5. Review provider documentation for changes

---

**End of Extended Guide**

For quick reference, see `.claude/agents/security.md`

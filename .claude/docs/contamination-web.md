# Web Contamination Patterns and Boundaries

> **Purpose**: Define enforceable stage boundaries for the Forge web platform, analogous to FandomLens's 4-stage pipeline architecture.

## Web "Stages" Architecture

Unlike FandomLens's sequential stages (Vision → CoreML → CreateML), web development has **concurrent stages** that must maintain clear boundaries:

```
UI Stage ←→ Server Stage ←→ Edge Stage
    ↓           ↓              ↓
Packages Stage (shared across all)
    ↓
Data Stage (database access)
    ↓
Infra Stage (deployment & CI/CD)
```

## Stage Definitions

### UI Stage

**Location**: `apps/webapp`, `apps/storybook`, `apps/ciseco-nextjs`

**Owners**: `stack-tailwind-mantine`, `stack-next-react` (client components)

**Allowed**:
- React 19 client components (`'use client'`)
- Mantine v8 UI components
- Tailwind v4 utilities
- `/client/next` imports from packages
- Browser APIs (window, document, localStorage)
- Client-side state management

**Forbidden**:
- ❌ Node core modules (`fs`, `path`, `net`, `crypto`, `http`)
- ❌ Prisma client or database access
- ❌ Deep package imports (`@repo/pkg/src/*`)
- ❌ Server-only packages without `/client/next` exports
- ❌ Direct environment variable access (use `env.NEXT_PUBLIC_*`)

**Example Violations**:
```typescript
// ❌ BAD: Node core in client component
'use client';
import fs from 'fs';  // VIOLATION

// ❌ BAD: Prisma in client
import { prisma } from '@repo/db-prisma';  // VIOLATION

// ❌ BAD: Deep package import
import { helper } from '@repo/auth/src/utils';  // VIOLATION

// ✅ GOOD: Proper client imports
import { Button } from '@mantine/core';
import { useAuth } from '@repo/auth/client/next';
```

---

### Server Stage

**Location**: `apps/*/app/**/actions`, `apps/*/app/**/route.ts`, server components

**Owners**: `stack-next-react` (server), `stack-prisma`, `stack-auth`

**Allowed**:
- Next.js server components and server actions
- `/server/next` imports from packages
- Node core modules
- Prisma database access
- Server-side environment variables
- Async operations

**Forbidden**:
- ❌ Browser APIs (window, document, localStorage)
- ❌ Client-only React hooks (useState, useEffect without 'use client')
- ❌ DOM manipulation
- ❌ Client-side state management in server files

**Example Violations**:
```typescript
// ❌ BAD: Browser API in server action
'use server';
export async function updateProfile() {
    const token = window.localStorage.getItem('token');  // VIOLATION
}

// ❌ BAD: Client hook in server component
export default async function Page() {
    const [state, setState] = useState(null);  // VIOLATION
    return <div>{state}</div>;
}

// ✅ GOOD: Proper server patterns
'use server';
import { db } from '@repo/db-prisma';
import { auth } from '@repo/auth/server/next';

export async function updateProfile(data: FormData) {
    const session = await auth();
    return db.user.update({ where: { id: session.user.id }, data });
}
```

---

### Edge Stage

**Location**: `apps/*/middleware.ts`, edge API routes

**Owners**: `stack-auth`, `stack-next-react`

**Allowed**:
- `/server/edge` imports from packages
- Web APIs (fetch, Response, Request, Headers, URL)
- Edge-compatible database clients
- Lightweight operations (auth checks, redirects, headers)

**Forbidden**:
- ❌ Node core modules (fs, path, net, crypto, http)
- ❌ Standard Prisma client (use edge-compatible client resolver)
- ❌ Heavy computations (risk timeouts)
- ❌ File system access

**Example Violations**:
```typescript
// ❌ BAD: Node core in middleware
import { NextResponse } from 'next/server';
import fs from 'fs';  // VIOLATION

export function middleware(request: Request) {
    const config = fs.readFileSync('./config.json');  // VIOLATION
}

// ❌ BAD: Standard Prisma in edge
import { db } from '@repo/db-prisma';  // VIOLATION (not edge-compatible)

export function middleware() {
    await db.user.findMany();  // VIOLATION
}

// ✅ GOOD: Edge-compatible patterns
import { NextResponse } from 'next/server';
import { auth } from '@repo/auth/server/edge';
import { getOptimalClient } from '@repo/db-prisma/prisma/clients/resolver';

export async function middleware(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Edge-compatible client
    const client = getOptimalClient({ runtime: 'edge' });
    const user = await client.user.findUnique({ where: { id: session.user.id } });

    return NextResponse.next();
}
```

---

### Packages Stage

**Location**: `packages/*/src/**`

**Owners**: All domain specialists (per package)

**Allowed**:
- ESM modules (`"type": "module"`)
- Relative imports (`../utils`, `./types`)
- `@repo/*` cross-package imports (public exports only)
- Dual environment exports (`env` and `safeEnv()`)
- Framework-agnostic logic

**Forbidden**:
- ❌ `@/` app imports
- ❌ Next.js-only imports (unless in dedicated `/client/next` or `/server/next` entry)
- ❌ Deep imports from other packages (`@repo/pkg/src/*`)
- ❌ Direct environment variable access (use env pattern)
- ❌ Framework-specific code in base exports

**Example Violations**:
```typescript
// ❌ BAD: App import in package
// packages/utils/src/helpers.ts
import { config } from '@/lib/config';  // VIOLATION

// ❌ BAD: Next.js in base package export
// packages/utils/src/index.ts
import { cookies } from 'next/headers';  // VIOLATION

// ❌ BAD: Deep package import
import { helper } from '@repo/auth/src/internal/utils';  // VIOLATION

// ✅ GOOD: Framework-agnostic package
// packages/utils/src/helpers.ts
export function formatDate(date: Date): string {
    return date.toISOString();
}

// ✅ GOOD: Framework-specific entry point
// packages/auth/src/server-next.ts
import { cookies } from 'next/headers';  // OK in /server/next entry

export async function getSession() {
    const token = cookies().get('session');
    return validateToken(token);
}
```

---

### Data Stage

**Location**: `packages/pkgs-databases/**`

**Owner**: `stack-prisma`

**Allowed**:
- Prisma schema and migrations
- Prisma client and resolvers
- Validator fragments (Zod schemas)
- Transaction-aware functions
- Database utilities

**Forbidden**:
- ❌ UI framework imports (React, Mantine, Tailwind)
- ❌ Next.js imports
- ❌ Browser APIs
- ❌ Client-side logic

**Example Violations**:
```typescript
// ❌ BAD: React in database package
import { useState } from 'react';  // VIOLATION

export function useUser(id: string) {
    const [user, setUser] = useState(null);  // VIOLATION
}

// ❌ BAD: Next.js in database package
import { cookies } from 'next/headers';  // VIOLATION

// ✅ GOOD: Pure database logic
import { Prisma, PrismaClient } from '@prisma/client';
import { z } from 'zod';

export const userSelectBasic = {
    select: { id: true, email: true, name: true }
} satisfies Prisma.UserSelect;

export const createUserInput = z.object({
    email: z.string().email(),
    name: z.string().min(2)
});
```

---

### Infra Stage

**Location**: `infra/**`, `.github/workflows/**`

**Owner**: `infra`

**Allowed**:
- Terraform configurations
- GitHub Actions workflows
- CI/CD scripts
- Deployment configurations

**Forbidden**:
- ❌ Application runtime code
- ❌ `@repo/*` imports
- ❌ Database queries
- ❌ Business logic

---

## Contamination Rules Reference

### Import Matrices

#### Next.js Import Rules

| Context | Allowed Imports | Forbidden Imports |
|---------|----------------|-------------------|
| Client Component | `/client/next`, Mantine, React client hooks | Node core, Prisma, `/server/next` |
| Server Component | `/server/next`, Prisma, Node core | Browser APIs, client hooks |
| Edge Middleware | `/server/edge`, Web APIs | Node core, standard Prisma |
| Package Base | Framework-agnostic only | Next.js, React, Mantine |
| Package `/client/next` | Next.js client imports | Node core, Prisma |
| Package `/server/next` | Next.js server imports | Browser APIs |
| Package `/server/edge` | Edge-compatible only | Node core |

#### Environment Variable Rules

| Context | Pattern | Example |
|---------|---------|---------|
| Next.js Apps | `import { env } from "#/root/env"` | Direct access for webpack |
| Packages | Export both `env` and `safeEnv()` | Dual pattern for flexibility |
| Client Components | `env.NEXT_PUBLIC_*` | Never `safeEnv()` in client |
| Package Validation | Never throw, return fallbacks | `return undefined as never` |
| App Validation | Always throw on error | Type safety enforcement |

---

## Automated Checks

### Ripgrep Patterns

```bash
# Packages: no Next.js imports
rg -n "from ['\"]next/" packages/*/src

# Packages: no @/ app imports
rg -n "from ['\"]@/" packages/*/src

# Apps: no deep package imports
rg -n "@repo/.+?/src/" apps

# Client: no Node core
rg -l "from ['\"]( fs|path|net|crypto)['\"]" apps | \
    xargs -I {} sh -c 'grep -l "use client\|\.client\." {}'

# Edge: no Node core
rg -n "from ['\"]( fs|path|net|crypto|http|https)['\"]" apps/**/middleware.{ts,tsx}

# Edge: no standard Prisma
rg -n "from ['\"]@repo/db-prisma['\"]" apps/**/middleware.{ts,tsx}

# Data: no UI frameworks
rg -n "from ['\"]( react|next|@mantine)['\"]" packages/pkgs-databases/src
```

### Pre-commit Hook

Located at `.git/hooks/pre-commit` (installed via script):

```bash
#!/bin/bash
set -euo pipefail

# Detect scope
SCOPE=$(node scripts/detect-scope.mjs "$CLAUDE_FILE_PATHS" || echo ".")

# Quality gates
pnpm lint --filter "$SCOPE"
pnpm typecheck --filter "$SCOPE"
pnpm vitest --filter "$SCOPE" --run

# Contamination checks
node scripts/validate.mjs contamination

# Coverage gate
node scripts/validate.mjs coverage --scope "$SCOPE"
```

### CI Workflow

Located at `.github/workflows/agentic-quality.yml`:

```yaml
name: Agentic Quality Gates
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: node scripts/detect-scope.mjs
      - run: pnpm repo:preflight
      - run: node scripts/validate.mjs contamination
      - run: pnpm turbo run storybook:smoke
```

---

## Common Violation Scenarios

### Scenario 1: Using Node APIs in Client Component

**Problem**:
```typescript
'use client';
import fs from 'fs';

export function FileUploader() {
    const files = fs.readdirSync('./uploads');  // VIOLATION
}
```

**Fix**:
```typescript
'use client';

export function FileUploader() {
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // Call server action instead
        fetch('/api/files').then(r => r.json()).then(setFiles);
    }, []);
}
```

---

### Scenario 2: Using Browser APIs in Server Action

**Problem**:
```typescript
'use server';

export async function savePreference(key: string, value: string) {
    localStorage.setItem(key, value);  // VIOLATION
}
```

**Fix**:
```typescript
'use server';
import { cookies } from 'next/headers';

export async function savePreference(key: string, value: string) {
    cookies().set(`pref_${key}`, value);
}
```

---

### Scenario 3: Deep Importing Package Internals

**Problem**:
```typescript
// apps/webapp/app/page.tsx
import { helper } from '@repo/auth/src/internal/utils';  // VIOLATION
```

**Fix**:
```typescript
// apps/webapp/app/page.tsx
import { helper } from '@repo/auth';  // Use public export

// packages/auth/package.json
{
  "exports": {
    ".": "./src/index.ts",
    "./utils": "./src/utils.ts"
  }
}
```

---

### Scenario 4: Using Standard Prisma in Edge Middleware

**Problem**:
```typescript
// apps/webapp/middleware.ts
import { db } from '@repo/db-prisma';  // VIOLATION

export async function middleware() {
    const user = await db.user.findMany();  // Won't work in edge
}
```

**Fix**:
```typescript
// apps/webapp/middleware.ts
import { getOptimalClient } from '@repo/db-prisma/prisma/clients/resolver';

export async function middleware() {
    const client = getOptimalClient({ runtime: 'edge' });
    const user = await client.user.findMany();  // Edge-compatible
}
```

---

## Allowlist for False Positives

If you encounter legitimate use cases that trigger false positives, document them here:

### Allowed Exceptions

None currently. All violations should be fixed, not allowlisted.

If you believe you have a legitimate exception, escalate to orchestrator for architectural review.

---

## Escalation Path

If contamination detected:
1. Run manual checks to identify all violations
2. Analyze why contamination occurred (misunderstanding? legitimate need?)
3. If legitimate need: Escalate to orchestrator for architectural review
4. If misunderstanding: Fix by moving code to correct stage
5. Document decision in `.claude/memory/architectural-decisions.md`

**When to Allow Exceptions**:
- NEVER for Packages importing apps (architectural boundary)
- NEVER for Client importing Node core (security risk)
- NEVER for Edge importing Node core (runtime incompatibility)
- Rare: Cross-stage utilities in `packages/utils` with explicit documentation

---

## References

- **FandomLens Contamination**: `apple/classifier/FandomLens/AGENTS.md` (lines 483-630)
- **Next.js Import Patterns**: `/apps/docs/ai-hints/next-import-patterns.mdx`
- **Environment Configuration**: `/apps/docs/ai-hints/environment-configuration.mdx`
- **Prisma Patterns**: `/apps/docs/ai-hints/prisma-patterns.mdx`

---

*Last updated: 2025-10-06*
*For contamination enforcement in Forge web platform*


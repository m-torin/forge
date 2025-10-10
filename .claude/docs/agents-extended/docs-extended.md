# Docs Extended Documentation

> **Extended guide for Mintlify documentation, AI hints, architecture guides, and documentation patterns**

---

## 1. Mintlify Configuration Patterns

### mint.json Structure

```json
{
  "name": "Forge Docs",
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "favicon": "/favicon.png",
  "colors": {
    "primary": "#0A6EFF",
    "light": "#BAD7FF",
    "dark": "#042B66",
    "anchors": {
      "from": "#0A6EFF",
      "to": "#3689FF"
    }
  },
  "topbarLinks": [
    {
      "name": "Support",
      "url": "mailto:support@forge.com"
    }
  ],
  "topbarCtaButton": {
    "name": "Dashboard",
    "url": "https://app.forge.com"
  },
  "tabs": [
    {
      "name": "API Reference",
      "url": "api-reference"
    },
    {
      "name": "Guides",
      "url": "guides"
    }
  ],
  "anchors": [
    {
      "name": "Community",
      "icon": "discord",
      "url": "https://discord.gg/forge"
    },
    {
      "name": "Blog",
      "icon": "newspaper",
      "url": "https://blog.forge.com"
    }
  ],
  "navigation": [
    {
      "group": "Get Started",
      "pages": [
        "introduction",
        "quickstart",
        "development"
      ]
    },
    {
      "group": "Core Concepts",
      "pages": [
        "concepts/architecture",
        "concepts/authentication",
        "concepts/database"
      ]
    },
    {
      "group": "API Documentation",
      "pages": [
        "api-reference/introduction",
        {
          "group": "User",
          "pages": [
            "api-reference/user/get-user",
            "api-reference/user/update-user"
          ]
        }
      ]
    }
  ],
  "footerSocials": {
    "twitter": "https://twitter.com/forge",
    "github": "https://github.com/forge",
    "linkedin": "https://www.linkedin.com/company/forge"
  },
  "analytics": {
    "posthog": {
      "apiKey": "phc_..."
    },
    "ga4": {
      "measurementId": "G-..."
    }
  },
  "feedback": {
    "thumbsRating": true,
    "suggestEdit": true,
    "raiseIssue": true
  }
}
```

### Page Frontmatter

```mdx
---
title: 'Quick Start Guide'
description: 'Get started with Forge in 5 minutes'
icon: 'rocket'
mode: 'wide'
---

# Quick Start

<Info>
  This guide assumes you have Node.js 22+ and pnpm 10+ installed.
</Info>

## Installation

<Steps>
  <Step title="Clone the repository">
    ```bash
    git clone https://github.com/your-org/forge-forge.git
    cd forge-forge
    ```
  </Step>

  <Step title="Install dependencies">
    ```bash
    pnpm install
    ```
  </Step>

  <Step title="Start development">
    ```bash
    pnpm dev
    ```
  </Step>
</Steps>

## Next Steps

<CardGroup cols={2}>
  <Card title="Authentication" icon="shield" href="/concepts/authentication">
    Learn about Better Auth integration
  </Card>

  <Card title="Database" icon="database" href="/concepts/database">
    Prisma ORM and schema design
  </Card>
</CardGroup>
```

---

## 2. AI Hints Authoring Guidelines

### Purpose of AI Hints

AI hints help Claude and other AI assistants understand:
- Architecture patterns and decisions
- Common workflows and commands
- Package structure and boundaries
- Code organization principles

### Hint File Structure

```mdx
---
title: 'Environment Configuration'
---

# Environment Configuration

## Overview

Forge uses `@t3-oss/env-nextjs` for type-safe environment validation.

## Key Patterns

### App-Level Configuration

```typescript
// apps/webapp/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { databaseEnv } from '@repo/db-prisma/env';

export const env = createEnv({
  extends: [databaseEnv],  // Inherit from packages
  server: {
    API_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
  },
  runtimeEnv: {
    API_SECRET: process.env.API_SECRET,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  onValidationError: (error) => {
    console.error('❌ Invalid environment:', error);
    throw new Error('Invalid environment variables');
  },
});
```

### Package-Level Configuration

```typescript
// packages/ai/env.ts
export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().optional(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  onValidationError: (error) => {
    console.warn('Package env failed:', error);
    // Packages return fallbacks, don't throw!
    return undefined as never;
  },
});

export function safeEnv() {
  return env || { OPENAI_API_KEY: '' };
}
```

## Common Pitfalls

❌ **Don't**: Throw in package env validation
✅ **Do**: Return fallbacks and warn

❌ **Don't**: Use `process.env` directly
✅ **Do**: Import from `env.ts`

## Related

- [Environment Configuration](/packages/environment)
- [SafeEnv Pattern](/architecture/safeenv)
```

### Best Practices for AI Hints

1. **Focus on Patterns**: Show the "why" not just the "what"
2. **Include Examples**: Real code from the repo is better than abstract examples
3. **Link Related Concepts**: Cross-reference other hints and docs
4. **Keep Updated**: Review hints quarterly to ensure accuracy
5. **Be Concise**: AI hints should be scannable, not novels

---

## 3. Navigation Structure Patterns

### Hierarchical Navigation

```json
{
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction", "quickstart"]
    },
    {
      "group": "Architecture",
      "pages": [
        "architecture/overview",
        {
          "group": "Monorepo",
          "pages": [
            "architecture/monorepo/structure",
            "architecture/monorepo/packages",
            "architecture/monorepo/apps"
          ]
        },
        {
          "group": "Stage Boundaries",
          "pages": [
            "architecture/stages/overview",
            "architecture/stages/ui",
            "architecture/stages/server",
            "architecture/stages/data"
          ]
        }
      ]
    }
  ]
}
```

### Breadcrumb Navigation

Mintlify automatically generates breadcrumbs from navigation structure:

```
Home > Architecture > Monorepo > Structure
```

### Search Configuration

```json
{
  "search": {
    "prompt": "Search documentation..."
  },
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path"
    }
  ]
}
```

---

## 4. API Reference Documentation

### OpenAPI Integration

```json
{
  "openapi": [
    {
      "url": "https://api.forge.com/openapi.json",
      "actions": [
        "GET /users",
        "POST /users",
        "GET /users/:id"
      ]
    }
  ]
}
```

### Manual API Documentation

```mdx
---
title: 'Get User'
api: 'GET /api/users/:id'
---

# Get User

Retrieve a user by ID.

## Path Parameters

<ParamField path="id" type="string" required>
  The unique identifier for the user
</ParamField>

## Response

<ResponseField name="id" type="string">
  Unique user identifier
</ResponseField>

<ResponseField name="email" type="string">
  User's email address
</ResponseField>

<ResponseField name="name" type="string">
  User's full name
</ResponseField>

<RequestExample>

```bash cURL
curl -X GET https://api.forge.com/users/123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript TypeScript
const user = await fetch('https://api.forge.com/users/123', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

</RequestExample>

<ResponseExample>

```json 200
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe"
}
```

```json 404
{
  "error": "User not found"
}
```

</ResponseExample>
```

---

## 5. Component Showcase

### Custom MDX Components

```typescript
// components/CodeBlock.tsx
import { Pre } from '@mintlify/components';

export function CodeBlock({ children, filename, highlightLines }) {
  return (
    <div className="code-block-wrapper">
      {filename && <div className="code-filename">{filename}</div>}
      <Pre highlightLines={highlightLines}>{children}</Pre>
    </div>
  );
}
```

### Callout Components

```mdx
<Note>
  This is a general note or tip
</Note>

<Info>
  This provides additional context
</Info>

<Warning>
  This warns about potential issues
</Warning>

<Tip>
  This is a helpful tip or best practice
</Tip>

<Check>
  This indicates a requirement is met
</Check>
```

### Interactive Examples

```mdx
<Tabs>
  <Tab title="TypeScript">
    ```typescript
    const greeting: string = "Hello, World!";
    ```
  </Tab>

  <Tab title="JavaScript">
    ```javascript
    const greeting = "Hello, World!";
    ```
  </Tab>
</Tabs>

<Accordion title="Advanced Options">
  Advanced configuration options go here...
</Accordion>

<AccordionGroup>
  <Accordion title="Option 1">
    Details for option 1
  </Accordion>

  <Accordion title="Option 2">
    Details for option 2
  </Accordion>
</AccordionGroup>
```

---

## 6. Versioning & Updates

### Version Selector

```json
{
  "versions": ["v2", "v1"],
  "version": "v2"
}
```

### Changelog Integration

```mdx
---
title: 'Changelog'
---

# Changelog

## v2.0.0 - 2025-10-07

<AccordionGroup>
  <Accordion title="✨ New Features">
    - Added AI chatbot integration
    - Better Auth organizations support
    - Enhanced performance monitoring
  </Accordion>

  <Accordion title="🐛 Bug Fixes">
    - Fixed edge runtime compatibility
    - Resolved TypeScript type errors
    - Updated dependency versions
  </Accordion>

  <Accordion title="⚠️ Breaking Changes">
    - Removed legacy API endpoints
    - Updated environment variable names
    - Changed database schema
  </Accordion>
</AccordionGroup>

<Info>
  For migration guide, see [Migration Guide](/guides/migration-v2).
</Info>
```

---

## 7. Search Optimization

### Metadata Optimization

```mdx
---
title: 'Environment Configuration Guide'
description: 'Learn how to configure environment variables with SafeEnv'
keywords: ['environment', 'env', 'config', 'safeenv', 'validation']
---
```

### Content Structure for Search

```mdx
# Main Title (H1) - Only one per page

Brief introduction paragraph with key terms.

## Section Heading (H2)

Content for this section...

### Subsection (H3)

More specific content...

## Another Section (H2)

Keep hierarchy consistent for better search indexing.
```

### Search Synonyms

```json
{
  "search": {
    "synonyms": {
      "env": ["environment", "configuration", "config"],
      "db": ["database", "prisma", "postgres"],
      "auth": ["authentication", "authorization", "login"]
    }
  }
}
```

---

## 8. Anti-Patterns & Common Mistakes

### ❌ Anti-Pattern: Deep Nesting

```json
// WRONG - Too deep, hard to navigate
{
  "navigation": [
    {
      "group": "Guides",
      "pages": [
        {
          "group": "Backend",
          "pages": [
            {
              "group": "Database",
              "pages": [
                {
                  "group": "Prisma",  // ❌ 4 levels deep!
                  "pages": ["guide"]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

// RIGHT - Flatten structure
{
  "navigation": [
    {
      "group": "Database Guides",
      "pages": [
        "guides/database/prisma",
        "guides/database/migrations"
      ]
    }
  ]
}
```

### ❌ Anti-Pattern: Inconsistent Naming

```
// WRONG - Inconsistent conventions
quickstart.mdx
getting_started.mdx
GettingStarted.mdx
get-started.mdx

// RIGHT - Consistent kebab-case
quickstart.mdx
getting-started.mdx
setup-guide.mdx
```

### ❌ Anti-Pattern: Missing Code Examples

```mdx
<!-- WRONG - Abstract explanation only -->
The SafeEnv pattern validates environment variables at runtime.
You should use it in all packages.

<!-- RIGHT - Concrete examples -->
The SafeEnv pattern validates environment variables:

```typescript
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
});
```

Use this pattern in all packages to ensure type safety.
```

### ❌ Anti-Pattern: Stale Documentation

```mdx
<!-- WRONG - References old patterns -->
Use `react-hook-form` for form validation.  ❌ (We use @mantine/form now)

<!-- RIGHT - Current patterns -->
Use `@mantine/form` with Zod for form validation:  ✅

```typescript
import { useForm, zodResolver } from '@mantine/form';
```
```

### ❌ Anti-Pattern: No Cross-References

```mdx
<!-- WRONG - Isolated content -->
This guide covers authentication.  ❌ (No links to related topics)

<!-- RIGHT - Well-linked -->
This guide covers authentication.  ✅

Related topics:
- [Database Setup](/guides/database)
- [API Security](/concepts/security)
- [Better Auth Configuration](/packages/auth)
```

---

## Resources

### Official Documentation
- **Mintlify**: https://mintlify.com/docs
- **MDX**: https://mdxjs.com/
- **React**: https://react.dev/

### Internal Resources
- **Agent doc**: `.claude/agents/docs.md`
- **Docs app**: `apps/docs/`
- **AI hints**: `apps/docs/ai-hints/`

### Context7 MCP Quick Access
```bash
mcp__context7__get-library-docs("/mintlify/mint")
```

---

*Last updated: 2025-10-07*
*Part of the Forge two-tier agent documentation system*

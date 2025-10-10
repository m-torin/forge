# @repo/pkgs-databases/prisma

Modern Prisma 6 package with full edge runtime support and tree-shaking
optimization.

## 🚀 Features

- **Edge Runtime Support**: Vercel Edge Functions, Cloudflare Workers, Deno
  Deploy
- **Tree-shakeable**: Optimized bundle sizes with domain-specific exports
- **Multiple Adapters**: PostgreSQL, Neon, PlanetScale, Turso, D1, SQLite
- **Auto-detection**: Runtime and adapter selection
- **Query Compiler**: Rust-free deployments with queryCompiler preview
- **Connection Pooling**: Vercel Fluid support for serverless

## 📦 Installation

```bash
# Core package
pnpm add @repo/pkgs-databases

# Peer dependencies (install only what you need)
pnpm add @prisma/adapter-neon        # For Neon
pnpm add @prisma/adapter-planetscale # For PlanetScale
pnpm add @prisma/adapter-turso       # For Turso
pnpm add @prisma/adapter-d1          # For Cloudflare D1
```

## Supported Database Providers

| Provider      | Node.js | Edge Runtime | Adapter Package                  |
| ------------- | ------- | ------------ | -------------------------------- |
| PostgreSQL    | ✅      | ⚠️ Limited   | `@prisma/adapter-pg`             |
| Neon          | ✅      | ✅           | `@prisma/adapter-neon`           |
| PlanetScale   | ✅      | ✅           | `@prisma/adapter-planetscale`    |
| Turso         | ✅      | ✅           | `@prisma/adapter-turso`          |
| SQLite        | ✅      | ⚠️ Limited   | `@prisma/adapter-better-sqlite3` |
| Cloudflare D1 | ❌      | ✅           | `@prisma/adapter-d1`             |

## 🎯 Quick Start

### Auto-detection (Recommended)

```typescript
import { createOptimizedClient } from "@repo/pkgs-databases/prisma";

// Automatically detects runtime and selects optimal adapter
const db = await createOptimizedClient();

const users = await db.user.findMany();
```

### Runtime-specific

```typescript
// Edge runtimes (Vercel Edge, Cloudflare Workers)
import { createEdgeClient } from "@repo/pkgs-databases/prisma/edge";

const db = await createEdgeClient({
  autoSelectAdapter: true // Detects provider from env
});

// Node.js
import { createNodeClient } from "@repo/pkgs-databases/prisma/node";

const db = await createNodeClient();
```

### Specific Adapters

```typescript
// Neon (edge-optimized)
import { createNeonAdapter } from "@repo/pkgs-databases/prisma/adapters/neon";
import { createEdgeClient } from "@repo/pkgs-databases/prisma/edge";

const adapter = await createNeonAdapter({
  connectionString: env.DATABASE_URL,
  pooling: true
});

const db = await createEdgeClient({ adapter });

// PlanetScale (edge-optimized)
import { createPlanetScaleAdapter } from "@repo/pkgs-databases/prisma/adapters/planetscale";

const adapter = await createPlanetScaleAdapter({
  connectionString: env.DATABASE_URL
});

// Turso (SQLite on edge)
import { createTursoAdapter } from "@repo/pkgs-databases/prisma/adapters/turso";

const adapter = await createTursoAdapter({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});
```

## 🌳 Tree-shaking Imports

Import only what you need for optimal bundle sizes:

```typescript
// Domain-specific models and operations
import {
  type Product,
  createProduct,
  findProductById
} from "@repo/pkgs-databases/prisma/exports/ecommerce";

import {
  type Order,
  createOrder,
  findOrderById
} from "@repo/pkgs-databases/prisma/exports/orders";

import {
  type User,
  createUser,
  findUserById
} from "@repo/pkgs-databases/prisma/exports/auth";

// CMS operations
import {
  type CompanyContent,
  createContent,
  findContentBySlug
} from "@repo/pkgs-databases/prisma/exports/cms";
```

## 🔧 Configuration

### Environment Variables

```bash
# Database connection
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Provider-specific (auto-detected)
NEON_DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/db"
PLANETSCALE_DATABASE_URL="mysql://user:pass@host.planetscale.sh:3306/db"
TURSO_DATABASE_URL="libsql://your-db.turso.io"
TURSO_AUTH_TOKEN="your-token"

# Cloudflare D1 (uses binding)
# DATABASE_BINDING_NAME="D1_DB"
```

### Prisma Schema

The package uses dual generators for optimal edge support:

```prisma
generator client {
  provider        = "prisma-client-js"
  output          = "../src/generated/client"
  previewFeatures = ["driverAdapters"]
}

generator edge {
  provider        = "prisma-client-js"
  output          = "../src/generated/edge"
  previewFeatures = ["queryCompiler", "driverAdapters"]
  engineType      = "binary"
}
```

## 📱 Runtime Support

| Runtime                | Support | Optimal Client     | Notes                                |
| ---------------------- | ------- | ------------------ | ------------------------------------ |
| **Vercel Edge**        | ✅      | `createEdgeClient` | Auto-detects, supports Fluid pooling |
| **Cloudflare Workers** | ✅      | `createEdgeClient` | D1 binding support                   |
| **Deno Deploy**        | ✅      | `createEdgeClient` | Web-standard APIs                    |
| **Node.js**            | ✅      | `createNodeClient` | Full feature set                     |
| **Bun**                | ✅      | `createNodeClient` | Compatibility mode                   |

## 🎨 Available Exports

### Core Exports

```typescript
// Runtime detection and auto-configuration
import {
  detectRuntime,
  autoSelectAdapter,
  createOptimizedClient
} from "@repo/pkgs-databases/prisma";

// Essential types
import type {
  DatabaseProvider,
  AdapterOptions,
  RuntimeEnvironment
} from "@repo/pkgs-databases/prisma";
```

### Runtime-specific

```typescript
// Edge runtime
import { createEdgeClient } from "@repo/pkgs-databases/prisma/edge";
import { createEdgeAdapter } from "@repo/pkgs-databases/prisma/edge";

// Node.js runtime
import { createNodeClient } from "@repo/pkgs-databases/prisma/node";
import { createNodeAdapter } from "@repo/pkgs-databases/prisma/node";
```

### Database Adapters

```typescript
import { createNeonAdapter } from "@repo/pkgs-databases/prisma/adapters/neon";
import { createPlanetScaleAdapter } from "@repo/pkgs-databases/prisma/adapters/planetscale";
import { createTursoAdapter } from "@repo/pkgs-databases/prisma/adapters/turso";
import { createD1Adapter } from "@repo/pkgs-databases/prisma/adapters/d1";
import { createSQLiteAdapter } from "@repo/pkgs-databases/prisma/adapters/sqlite";
import { createPostgreSQLAdapter } from "@repo/pkgs-databases/prisma/adapters/postgresql";
```

### Domain Models

```typescript
// E-commerce
import "@repo/pkgs-databases/prisma/exports/ecommerce";

// Order management
import "@repo/pkgs-databases/prisma/exports/orders";

// Authentication
import "@repo/pkgs-databases/prisma/exports/auth";

// Content management
import "@repo/pkgs-databases/prisma/exports/cms";
```

## 🚀 Advanced Usage

### Connection Pooling

```typescript
import { createNeonAdapter } from "@repo/pkgs-databases/prisma/adapters/neon";
import { createEdgeClient } from "@repo/pkgs-databases/prisma/edge";

// Enable Vercel Fluid connection pooling
const adapter = await createNeonAdapter({
  connectionString: env.DATABASE_URL,
  pooling: true, // Enables pgBouncer/Fluid
  maxConnections: 10
});

const db = await createEdgeClient({ adapter });
```

### Custom Adapter Configuration

```typescript
import { createEdgeClient } from "@repo/pkgs-databases/prisma/edge";
import { createNeonAdapter } from "@repo/pkgs-databases/prisma/adapters/neon";

const adapter = await createNeonAdapter({
  connectionString: env.DATABASE_URL,
  pooling: true,
  ssl: { rejectUnauthorized: false },
  connectionTimeout: 30000
});

const db = await createEdgeClient({
  adapter,
  log: ["query", "error"],
  errorFormat: "pretty"
});
```

### Transaction Support

```typescript
import { createOptimizedClient } from "@repo/pkgs-databases/prisma";
import { createUser } from "@repo/pkgs-databases/prisma/exports/auth";

const db = await createOptimizedClient();

// Interactive transactions work across all runtimes
const result = await db.$transaction(async (tx) => {
  const user = await createUser(
    {
      email: "user@example.com",
      name: "John Doe"
    },
    tx
  ); // Pass transaction client

  return user;
});
```

## 📊 Bundle Size Optimization

The package is designed for optimal tree-shaking:

```typescript
// ❌ Imports everything (~500kb+)
import * from '@repo/pkgs-databases/prisma'

// ✅ Imports only what you need (~50kb)
import { createEdgeClient } from '@repo/pkgs-databases/prisma/edge'
import { createNeonAdapter } from '@repo/pkgs-databases/prisma/adapters/neon'
import { createUser, findUserById } from '@repo/pkgs-databases/prisma/exports/auth'
```

## 🛠 Development

```bash
# Generate Prisma clients
pnpm generate

# Run migrations
pnpm migrate

# Open Prisma Studio
pnpm studio

# Type checking
pnpm typecheck
```

## 🎯 Best Practices

1. **Use specific imports** for optimal bundle sizes
2. **Auto-detect runtime** with `createOptimizedClient()` when possible
3. **Enable connection pooling** for serverless environments
4. **Use domain exports** (`/exports/ecommerce`) for better organization
5. **Pass transaction clients** to ORM functions for atomicity

## 📚 Type Safety

All functions are fully typed with TypeScript:

```typescript
import {
  type User,
  type UserCreateInput,
  createUser,
  userSelectBasic
} from "@repo/pkgs-databases/prisma/exports/auth";

// Type-safe user creation
const userData: UserCreateInput = {
  email: "user@example.com",
  name: "John Doe"
};

const user: User = await createUser(userData);

// Type-safe queries with fragments
const basicUser = await db.user.findUnique({
  where: { id: "123" },
  select: userSelectBasic.select // Reusable, type-safe
});
```

## Provider-Specific Examples

### PostgreSQL

#### Basic Usage

```typescript
import { createPostgreSQLAdapter } from "@repo/pkgs-databases/prisma/adapters/postgresql";

const adapter = await createPostgreSQLAdapter({
  connectionString: process.env.DATABASE_URL,
  schema: "public" // Optional
});

const { PrismaClient } = await import("./src/generated/client/client");
const prisma = new PrismaClient({ adapter });
```

### Neon (Serverless PostgreSQL)

```typescript
import { createNeonAdapter } from "@repo/pkgs-databases/prisma/adapters/neon";
import { createEdgeClient } from "@repo/pkgs-databases/prisma/edge";

const adapter = await createNeonAdapter({
  connectionString: env.NEON_DATABASE_URL,
  pooling: true, // Enable serverless pooling
  maxConnections: 5
});

const db = await createEdgeClient({ adapter });
```

### PlanetScale (Serverless MySQL)

```typescript
import { createPlanetScaleAdapter } from "@repo/pkgs-databases/prisma/adapters/planetscale";

const adapter = await createPlanetScaleAdapter({
  connectionString: env.PLANETSCALE_DATABASE_URL
});

const db = await createEdgeClient({ adapter });
```

### Turso (Distributed SQLite)

```typescript
import { createTursoAdapter } from "@repo/pkgs-databases/prisma/adapters/turso";

const adapter = await createTursoAdapter({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN
});

const db = await createEdgeClient({ adapter });
```

### SQLite (Local)

```typescript
import { createSQLiteAdapter } from "@repo/pkgs-databases/prisma/adapters/sqlite";

const adapter = await createSQLiteAdapter({
  url: "file:./dev.db"
});

const { PrismaClient } = await import("./src/generated/client/client");
const prisma = new PrismaClient({ adapter });
```

### Cloudflare D1

```typescript
import { createD1Adapter } from "@repo/pkgs-databases/prisma/adapters/d1";

// In Cloudflare Worker
export default {
  async fetch(request: Request, env: Env) {
    const adapter = await createD1Adapter({
      binding: env.DATABASE // D1 binding
    });

    const { PrismaClient } = await import("./src/generated/edge/client");
    const prisma = new PrismaClient({ adapter });

    const users = await prisma.user.findMany();
    return new Response(JSON.stringify(users));
  }
};
```

---

**Built for modern edge-first applications with Prisma 6 and full TypeScript
support.**

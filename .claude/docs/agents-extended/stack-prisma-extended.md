# Stack-Prisma Extended Guide

**Tier 2 Documentation** - Detailed Prisma ORM patterns, troubleshooting, and advanced techniques.

**Quick Reference**: See `.claude/agents/stack-prisma.md` for essentials.

---

## Table of Contents

1. [Common Patterns (Detailed)](#common-patterns-detailed)
2. [Anti-Patterns and How to Fix Them](#anti-patterns-and-how-to-fix-them)
3. [Migration Strategies](#migration-strategies)
4. [Query Optimization Techniques](#query-optimization-techniques)
5. [Transaction Patterns](#transaction-patterns)
6. [SafeEnv Schema Management](#safeenv-schema-management)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Performance Profiling](#performance-profiling)

---

## Common Patterns (Detailed)

### Transaction-Aware Functions

**Pattern**: Always accept optional transaction client parameter for composability

```typescript
import { createNodeClient } from '@repo/db-prisma/node';
import type { PrismaTransactionClient } from '@repo/db-prisma/types';

const db = createNodeClient();

export async function createPostWithTags(
  data: { title: string; authorId: string; tags: string[] },
  client: PrismaTransactionClient = db
) {
  return client.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: { title: data.title, authorId: data.authorId },
    });

    await tx.tag.createMany({
      data: data.tags.map(name => ({ name, postId: post.id })),
      skipDuplicates: true, // Important: handle existing tags
    });

    return tx.post.findUnique({
      where: { id: post.id },
      include: { tags: true, author: { select: { id: true, name: true } } },
    });
  });
}

// Usage: Can be called standalone or within larger transaction
await createPostWithTags({ title: 'Hello', authorId: 'user_123', tags: ['news'] });

// Or composed in larger transaction
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email: 'test@example.com' } });
  const post = await createPostWithTags({ title: 'Welcome', authorId: user.id, tags: ['intro'] }, tx);
  return { user, post };
});
```

### Proper Error Handling

**Pattern**: Use Prisma error codes for specific handling

```typescript
import { Prisma } from '@prisma/client';

async function createUser(email: string, name: string) {
  try {
    return await db.user.create({
      data: { email, name },
    });
  } catch (error) {
    // Check if it's a known Prisma error
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint violation
      if (error.code === 'P2002') {
        const field = error.meta?.target as string[];
        throw new Error(`${field.join(', ')} already exists`);
      }

      // P2025: Record not found
      if (error.code === 'P2025') {
        throw new Error('Record not found');
      }

      // P2003: Foreign key constraint violation
      if (error.code === 'P2003') {
        throw new Error('Referenced record does not exist');
      }
    }

    // Unknown error - rethrow
    throw error;
  }
}
```

**Common Prisma Error Codes**:
- `P2002` - Unique constraint violation
- `P2025` - Record not found
- `P2003` - Foreign key constraint failed
- `P2014` - Relation violation (required relation missing)
- `P2021` - Table does not exist
- `P2022` - Column does not exist

### Optimized Queries with Includes

**Pattern**: Use selective includes to avoid over-fetching

```typescript
// ✅ GOOD: Selective include with nested select
const posts = await db.post.findMany({
  where: { published: true },
  select: {
    id: true,
    title: true,
    excerpt: true,
    createdAt: true,
    author: {
      select: {
        id: true,
        name: true,
        avatar: true,
      },
    },
    _count: {
      select: {
        comments: true,
        likes: true,
      },
    },
  },
  take: 10,
  orderBy: { createdAt: 'desc' },
});

// ✅ BETTER: Use validator fragments for reusability
import { postSelectBasic } from '@repo/db-prisma/prisma/fragments';

const posts = await db.post.findMany({
  where: { published: true },
  ...postSelectBasic, // Reusable, type-safe select
  take: 10,
  orderBy: { createdAt: 'desc' },
});
```

### Pagination Patterns

**Cursor-based pagination** (recommended for large datasets):

```typescript
async function getPaginatedPosts(cursor?: string, pageSize = 20) {
  const posts = await db.post.findMany({
    take: pageSize + 1, // Fetch one extra to check if there's a next page
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
  });

  const hasMore = posts.length > pageSize;
  const items = hasMore ? posts.slice(0, -1) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  return { items, nextCursor, hasMore };
}
```

**Offset-based pagination** (use for small datasets only):

```typescript
async function getPosts(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;

  const [posts, total] = await db.$transaction([
    db.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true },
    }),
    db.post.count(),
  ]);

  return {
    items: posts,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}
```

### Batch Operations

**Pattern**: Use `createMany`, `updateMany`, `deleteMany` for efficiency

```typescript
// ✅ GOOD: Batch insert
await db.tag.createMany({
  data: [
    { name: 'javascript', slug: 'javascript' },
    { name: 'typescript', slug: 'typescript' },
    { name: 'prisma', slug: 'prisma' },
  ],
  skipDuplicates: true, // Ignore unique constraint violations
});

// ✅ GOOD: Batch update
await db.post.updateMany({
  where: { published: false, createdAt: { lt: thirtyDaysAgo } },
  data: { status: 'archived' },
});

// ❌ BAD: Individual inserts in loop
for (const tag of tags) {
  await db.tag.create({ data: tag }); // N queries instead of 1!
}
```

---

## Anti-Patterns and How to Fix Them

### N+1 Query Problem

**❌ Problem**:
```typescript
// Fetches posts, then 1 query per post for author (N+1)
const posts = await db.post.findMany({ take: 50 });

for (const post of posts) {
  const author = await db.user.findUnique({
    where: { id: post.authorId },
  });
  console.log(`${post.title} by ${author.name}`);
}
// Result: 51 queries (1 for posts + 50 for authors)
```

**✅ Solution**: Use `include` or nested `select`
```typescript
const posts = await db.post.findMany({
  take: 50,
  include: {
    author: {
      select: { id: true, name: true },
    },
  },
});

for (const post of posts) {
  console.log(`${post.title} by ${post.author.name}`);
}
// Result: 1 query with JOIN
```

### Missing Transaction for Related Writes

**❌ Problem**: Non-atomic operations can leave data inconsistent
```typescript
// If second operation fails, first succeeds (inconsistent state)
const post = await db.post.create({
  data: { title, authorId },
});

await db.tag.create({
  data: { name, postId: post.id },
}); // May fail, leaving orphaned post
```

**✅ Solution**: Use transaction
```typescript
await db.$transaction(async (tx) => {
  const post = await tx.post.create({
    data: { title, authorId },
  });

  await tx.tag.create({
    data: { name, postId: post.id },
  });

  return post;
});
// Both succeed or both fail (atomic)
```

### Over-Fetching Data

**❌ Problem**: Fetching all columns when only few needed
```typescript
// Fetches ALL user fields (email, password, bio, avatar, etc.)
const users = await db.user.findMany();
const names = users.map(u => u.name); // Only need name!
```

**✅ Solution**: Use `select` to fetch only needed fields
```typescript
const users = await db.user.findMany({
  select: { id: true, name: true },
});
const names = users.map(u => u.name);
// Result: 90% less data transferred
```

### Hardcoded Database URL

**❌ Problem**: No environment flexibility, secrets in code
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: { url: 'postgresql://user:pass@localhost:5432/mydb' },
  },
});
```

**✅ Solution**: Use SafeEnv for validated environment variables
```typescript
import { createNodeClient } from '@repo/db-prisma/node';

const db = createNodeClient(); // Reads from SafeEnv-validated DATABASE_URL
```

### Missing Indexes

**❌ Problem**: Queries on unindexed columns are slow
```prisma
model Post {
  id       String @id
  authorId String // No index!
  status   String // No index!
  createdAt DateTime
}
```

**Query**: `db.post.findMany({ where: { authorId: 'user_123' } })` → Full table scan (slow)

**✅ Solution**: Add indexes for commonly queried columns
```prisma
model Post {
  id       String @id
  authorId String
  status   String
  createdAt DateTime

  @@index([authorId])       // Single column
  @@index([status, createdAt]) // Composite for filtered sorting
  @@index([authorId, status])  // Composite for common filter
}
```

---

## Migration Strategies

### Development Migrations

**Use**: `prisma migrate dev` for iterative development

```bash
# Make schema changes in schema.prisma
# Then generate migration
pnpm prisma migrate dev --name add_comments_table

# This will:
# 1. Create migration SQL file
# 2. Apply migration to dev database
# 3. Regenerate Prisma Client
```

**Best practices**:
- Name migrations descriptively: `add_user_roles`, `add_post_published_index`
- Review generated SQL before committing
- Test migration on dev database first
- Keep migrations small and focused

### Production Migrations

**Use**: `prisma migrate deploy` for production (no prompt, no schema drift fix)

```bash
# In production environment
pnpm prisma migrate deploy

# This will:
# 1. Apply pending migrations in order
# 2. Skip if already applied
# 3. Fail fast on error (no rollback)
```

**Pre-production checklist**:
- [ ] Migration tested on staging database
- [ ] Downtime window scheduled (if needed)
- [ ] Backup taken
- [ ] Rollback plan documented
- [ ] Approval from infra team

### Handling Breaking Changes

**Scenario**: Renaming a column (breaking change for running apps)

**Strategy**: Multi-phase migration

**Phase 1**: Add new column alongside old (additive, no breaking)
```prisma
model User {
  id        String @id
  email     String @unique  // Old column
  emailAddr String? @unique // New column (nullable)
}
```

Migration: `add_email_addr_column`

**Phase 2**: Deploy code that writes to both columns (dual write)
```typescript
await db.user.create({
  data: {
    email: emailValue,
    emailAddr: emailValue, // Write to both
  },
});
```

**Phase 3**: Backfill old data (script)
```typescript
await db.$executeRaw`UPDATE users SET email_addr = email WHERE email_addr IS NULL`;
```

**Phase 4**: Switch all reads to new column, make it required
```prisma
model User {
  id        String @id
  email     String? @unique // Now nullable (still reading old data)
  emailAddr String @unique  // Now required
}
```

Migration: `make_email_addr_required`

**Phase 5**: Remove old column
```prisma
model User {
  id        String @id
  emailAddr String @unique
}
```

Migration: `drop_email_column`

### Rolling Back Migrations

**Development**: Use `prisma migrate reset` (⚠️ destructive)
```bash
pnpm prisma migrate reset # Drops database, reapplies all migrations
```

**Production**: Manual rollback (no built-in support)
```bash
# 1. Write manual rollback SQL (reverse of migration)
# 2. Execute against production database
# 3. Remove migration from _prisma_migrations table
```

---

## Query Optimization Techniques

### Using EXPLAIN ANALYZE

**Find slow query**:
```bash
# Enable query logging in Prisma
DATABASE_URL="postgresql://...?log=query" pnpm dev
```

**Analyze query plan**:
```typescript
// Get raw SQL from Prisma query
const query = db.post.findMany({
  where: { authorId: 'user_123' },
  include: { tags: true },
});

// Use $queryRaw to run EXPLAIN
const plan = await db.$queryRaw`
  EXPLAIN ANALYZE
  SELECT * FROM posts WHERE author_id = 'user_123'
`;

console.log(plan);
// Look for:
// - Seq Scan (bad) vs Index Scan (good)
// - High execution time
// - High rows estimate
```

### Index Strategies

**Single-column index**: For equality checks
```prisma
model Post {
  authorId String
  @@index([authorId]) // For: WHERE authorId = ?
}
```

**Composite index**: For multi-column filters
```prisma
model Post {
  status String
  createdAt DateTime
  @@index([status, createdAt]) // For: WHERE status = ? ORDER BY createdAt
}
```

**Partial index**: For filtered queries (PostgreSQL)
```prisma
model Post {
  published Boolean
  createdAt DateTime
  @@index([createdAt], where: "published = true")
  // Only indexes published posts (smaller, faster)
}
```

### Query Hints

**Avoid**: Over-including relations (creates large JOINs)
```typescript
// ❌ Bad: Deeply nested includes
const post = await db.post.findUnique({
  where: { id },
  include: {
    author: {
      include: {
        posts: {
          include: {
            tags: true,
            comments: { include: { author: true } },
          },
        },
      },
    },
  },
}); // Massive query with many JOINs
```

**Prefer**: Separate targeted queries
```typescript
// ✅ Good: Fetch only what's needed, separate queries
const post = await db.post.findUnique({
  where: { id },
  include: { author: { select: { id: true, name: true } } },
});

if (needComments) {
  const comments = await db.comment.findMany({
    where: { postId: id },
    take: 10,
    include: { author: { select: { name: true } } },
  });
}
```

### Connection Pooling

**Issue**: Each Prisma Client creates new connection pool

**Solution**: Singleton pattern (already implemented in `@repo/db-prisma`)

```typescript
// packages/pkgs-databases/prisma/src/node.ts
let prismaClientSingleton: PrismaClient | null = null;

export function createNodeClient(): PrismaClient {
  if (!prismaClientSingleton) {
    prismaClientSingleton = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClientSingleton;
}
```

**Connection pool configuration**:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
```

---

## Transaction Patterns

### Basic Transaction

```typescript
await db.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { email } });
  const profile = await tx.profile.create({ data: { userId: user.id } });
  return { user, profile };
});
```

### Transaction with Timeout

```typescript
await db.$transaction(
  async (tx) => {
    // Long-running operations
    const result = await tx.someModel.updateMany({ ... });
    return result;
  },
  {
    maxWait: 5000, // Max wait to get connection (ms)
    timeout: 10000, // Max transaction duration (ms)
  }
);
```

### Transaction with Isolation Level

```typescript
await db.$transaction(
  async (tx) => {
    const count = await tx.user.count();
    await tx.user.create({ data: { email } });
    return count + 1;
  },
  {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  }
);
```

**Isolation levels**:
- `ReadUncommitted` - Lowest isolation (fastest, least safe)
- `ReadCommitted` - Default (good balance)
- `RepeatableRead` - Prevents non-repeatable reads
- `Serializable` - Highest isolation (slowest, safest)

### Composable Transactions

**Pattern**: Functions accept optional transaction client

```typescript
async function createUser(
  data: { email: string },
  client: PrismaTransactionClient = db
) {
  return client.user.create({ data });
}

async function createProfile(
  userId: string,
  client: PrismaTransactionClient = db
) {
  return client.profile.create({ data: { userId } });
}

// Compose in transaction
await db.$transaction(async (tx) => {
  const user = await createUser({ email: 'test@example.com' }, tx);
  const profile = await createProfile(user.id, tx);
  return { user, profile };
});
```

---

## SafeEnv Schema Management

### Database URL Validation

**Location**: `packages/pkgs-databases/prisma/src/env.ts`

```typescript
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const databaseEnv = createEnv({
  server: {
    DATABASE_URL: z.string().url().startsWith('postgresql://'),
    DATABASE_URL_POOLED: z.string().url().optional(),
    DATABASE_MIGRATION_URL: z.string().url().optional(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  onValidationError: (error) => {
    console.error('❌ Invalid database environment variables:', error.flatten().fieldErrors);
    throw new Error('Invalid database configuration');
  },
});
```

### Multiple Database Support

**Pattern**: Separate clients for different databases

```typescript
// Primary database
export function createNodeClient() {
  return new PrismaClient({
    datasources: { db: { url: databaseEnv.DATABASE_URL } },
  });
}

// Analytics database (separate connection)
export function createAnalyticsClient() {
  return new PrismaClient({
    datasources: { db: { url: databaseEnv.ANALYTICS_DATABASE_URL } },
  });
}
```

### Connection String Patterns

**Development**:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb?schema=public"
```

**Production** (with connection pooling):
```env
DATABASE_URL="postgresql://user:pass@host:5432/mydb?connection_limit=10&pool_timeout=20&schema=public"
DATABASE_URL_POOLED="postgresql://user:pass@pooler.host:5432/mydb?pgbouncer=true"
```

**Migration URL** (direct connection, no pooler):
```env
DATABASE_MIGRATION_URL="postgresql://user:pass@host:5432/mydb?schema=public"
```

---

## Troubleshooting Guide

### Migration Errors

**Error**: `The migration X failed`

**Cause**: SQL syntax error or constraint violation

**Solution**:
1. Check migration SQL file in `prisma/migrations/`
2. Identify problematic SQL statement
3. Fix schema.prisma or write custom SQL
4. Mark migration as rolled back: `prisma migrate resolve --rolled-back X`
5. Create new migration with fix

**Error**: `Database schema is not in sync`

**Cause**: Manual database changes or migration drift

**Solution**:
```bash
# Reset dev database (⚠️ destructive)
pnpm prisma migrate reset

# Or create baseline migration
pnpm prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script > fix.sql

# Review and apply fix.sql manually
```

### Query Performance Issues

**Symptom**: Query takes >1 second

**Diagnosis**:
1. Enable query logging: `DATABASE_URL="...?log=query"`
2. Run `EXPLAIN ANALYZE` on slow query
3. Check for missing indexes
4. Check for N+1 query pattern

**Solutions**:
- Add index: `@@index([column])`
- Use `select` to reduce data fetching
- Use `include` instead of separate queries
- Add pagination with `take` and `skip`

### Type Generation Errors

**Error**: `Property X does not exist on type`

**Cause**: Prisma Client not regenerated after schema change

**Solution**:
```bash
pnpm prisma generate
pnpm typecheck
```

**Error**: `Cannot find module '@prisma/client'`

**Cause**: Prisma Client not installed or not generated

**Solution**:
```bash
pnpm install
pnpm prisma generate
```

### Connection Errors

**Error**: `Can't reach database server`

**Cause**: Database not running or wrong connection string

**Solution**:
1. Verify database is running
2. Check DATABASE_URL format
3. Test connection: `psql $DATABASE_URL`
4. Check firewall/network access

**Error**: `Too many connections`

**Cause**: Connection pool exhausted

**Solution**:
1. Reduce `connection_limit` in DATABASE_URL
2. Use connection pooling (PgBouncer)
3. Close connections properly: `await prisma.$disconnect()`

---

## Performance Profiling

### Measuring Query Performance

**Built-in logging**:
```typescript
const db = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

db.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Prisma Query Event

```typescript
interface QueryEvent {
  timestamp: Date;
  query: string;       // SQL query
  params: string;      // Query parameters
  duration: number;    // Execution time in ms
  target: string;      // Database target
}
```

### Performance Monitoring

**Track slow queries**:
```typescript
const SLOW_QUERY_THRESHOLD = 200; // ms

db.$on('query', (e) => {
  if (e.duration > SLOW_QUERY_THRESHOLD) {
    console.warn(`🐌 Slow query (${e.duration}ms): ${e.query}`);
    // Send to monitoring service (Sentry, DataDog, etc.)
  }
});
```

### Query Count Tracking

```typescript
let queryCount = 0;

db.$on('query', () => {
  queryCount++;
});

// In your request handler
const startCount = queryCount;
await handleRequest(req);
const queriesExecuted = queryCount - startCount;

if (queriesExecuted > 10) {
  console.warn(`⚠️ High query count: ${queriesExecuted} queries`);
  // Likely N+1 problem
}
```

---

**End of Extended Guide** | For quick reference, see `.claude/agents/stack-prisma.md`

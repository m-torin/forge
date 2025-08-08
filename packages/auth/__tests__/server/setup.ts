// Common server test setup - centralized mocks now handled in vitest.setup.ts
// This file kept for any server-specific test configuration

// Note: Better Auth, Next.js, Prisma, Observability, and other common mocks are now
// centralized in the package's vitest.setup.ts file using @repo/qa mocks
//
// Previously duplicated mocks that are now centralized:
// - better-auth (all plugins and adapters)
// - next/headers
// - @repo/observability/server/next
// - @repo/database
// - server-only
// - env modules
//
// This significantly reduces maintenance burden and ensures consistency
// across all auth package tests.

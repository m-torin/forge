/**
 * Database exports for server environments (non-Next.js)
 * Complete database solution with Prisma ORM, server actions, and observability
 *
 * @example
 * ```typescript
 * import { prisma, createUserAction } from '@repo/database/prisma';
 *
 * // Direct Prisma client usage
 * const user = await prisma.user.findUnique({
 *   where: { id: 'user123' }
 * });
 *
 * // Using server actions
 * const newUser = await createUserAction({
 *   data: { email: 'user@example.com', name: 'John Doe' }
 * });
 *
 * // Using ORM functions
 * import { findUniqueUserOrm } from '@repo/database/prisma';
 * const userById = await findUniqueUserOrm({
 *   where: { id: 'user123' }
 * });
 *
 * ```
 */

// ============================================================================
// CORE PRISMA CLIENT
// ============================================================================

// Export standard Prisma client directly
export { prisma, prismaClientSingleton } from './clients/standard';
export type { PrismaClient } from './clients/standard';

// Re-export from the generated Prisma client
export * from '../../prisma-generated/client';

// ============================================================================
// OBSERVABILITY UTILITIES
// ============================================================================

// Export observability utilities (server-only)
export * as observability from './src/observability';

// ============================================================================
// SERVER ACTIONS
// ============================================================================

// Export server actions
export * from './src/server-actions';

// ============================================================================
// ORM FUNCTIONS
// ============================================================================

// Export ORM functions
export * from './src/orm';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// Export validation utilities for working with Zod schemas
export * from './validation';

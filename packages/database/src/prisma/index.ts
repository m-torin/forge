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
 * // Using transaction utilities
 * import { executeTransaction } from '@repo/database/prisma';
 * const result = await executeTransaction(async (tx) => {
 *   // transaction logic
 * });
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
// ORM FUNCTIONS
// ============================================================================

// Export ORM functions (primary database interface)
export * from './src/orm';

// ============================================================================
// TRANSACTION UTILITIES
// ============================================================================

// Export transaction utilities
export * from './src/utils/transaction';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

// Export validation utilities for working with Zod schemas
export * from './validation';

// Export validation extension error type
export { ValidationError } from './extensions';

// ============================================================================
// SERVER ACTIONS (SEPARATE NAMESPACE)
// ============================================================================

// Export server actions under a namespace to avoid conflicts
export * as actions from './src/server-actions';

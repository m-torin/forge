/**
 * Database exports for Next.js server-side environments
 * Use this in Next.js applications, server components, API routes, and middleware.
 *
 * @example
 * ```typescript
 * import { prisma, createUserAction } from '@repo/database/prisma/server/next';
 *
 * // In a Next.js server component
 * export default async function UserProfile({ userId }: { userId: string }) {
 *   const user = await prisma.user.findUnique({
 *     where: { id: userId },
 *     include: { profile: true }
 *   });
 *
 *   return <div>{user?.name}</div>;
 * }
 *
 * // In a Next.js API route
 * export async function POST(request: Request) {
 *   const body = await request.json();
 *   const user = await createUserAction({ data: body });
 *   return Response.json(user);
 * }
 *
 * // Using server actions in forms
 * import { createUserAction } from '@repo/database/prisma/server/next';
 *
 * export async function createUser(formData: FormData) {
 *   'use server';
 *   const name = formData.get('name') as string;
 *   const email = formData.get('email') as string;
 *
 *   return await createUserAction({
 *     data: { name, email }
 *   });
 * }
 * ```
 *
 * For non-Next.js applications, use '@repo/database/prisma' instead.
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

// Export observability utilities (with runtime detection for Next.js)
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

/**
 * soft-delete-middleware.ts
 * Middleware to implement soft deletes by transforming delete operations to updates setting a soft-delete field.
 * Guarded by model allowlist to avoid schema errors on models without the soft-delete field.
 * Based on Prisma docs: https://www.prisma.io/docs/concepts/components/prisma-client/client-extensions/middleware#soft-delete-middleware
 */

export type SoftDeleteOptions = {
  models?: Set<string>;
  field?: 'deletedAt' | 'deleted';
};

const DEFAULT_MODELS = new Set<string>([
  'User',
  'Product',
  'Brand',
  'Collection',
  'Fandom',
  'Location',
  'Media',
  'ProductCategory',
  'Series',
  'Story',
  'Taxonomy',
  'Address',
  'Cart',
  'Order',
]);

export function softDeleteMiddleware(prisma: any, options: SoftDeleteOptions = {}) {
  const models = options.models ?? DEFAULT_MODELS;
  const field = options.field ?? 'deletedAt';

  // Skip middleware if client doesn't support it (e.g., build stub)
  if (!prisma.$use || typeof prisma.$use !== 'function') {
    console.warn('[Soft Delete Middleware] $use method not available, skipping middleware setup');
    return;
  }

  prisma.$use(async (params: any, next: (p: any) => Promise<any>) => {
    // Skip models without soft-delete support
    if (!params?.model || !models.has(params.model)) {
      return next(params);
    }

    // Transform deletes into updates setting soft-delete field
    if (params.action === 'delete') {
      params.action = 'update';
      params.args = params.args ?? {};
      params.args.data = {
        ...(params.args.data ?? {}),
        [field]: field === 'deletedAt' ? new Date() : true,
      };
    } else if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      params.args = params.args ?? {};
      const data = params.args.data ?? {};
      params.args.data = { ...data, [field]: field === 'deletedAt' ? new Date() : true };
    }

    // Read operations: exclude soft-deleted by default
    if (params.action === 'findUnique' || params.action === 'findUniqueOrThrow') {
      // Switch to findFirst to allow adding extra filter beyond unique fields
      params.action = params.action === 'findUnique' ? 'findFirst' : 'findFirstOrThrow';
      params.args.where = params.args.where ?? {};
      if (params.args.where[field] === undefined) {
        params.args.where[field] = field === 'deletedAt' ? null : false;
      }
    } else if (
      params.action === 'findFirst' ||
      params.action === 'findFirstOrThrow' ||
      params.action === 'findMany'
    ) {
      params.args = params.args ?? {};
      params.args.where = params.args.where ?? {};
      if (params.args.where[field] === undefined) {
        params.args.where[field] = field === 'deletedAt' ? null : false;
      }
    }

    // Updates should not touch soft-deleted rows by default
    if (params.action === 'update') {
      params.action = 'updateMany';
      params.args.where = params.args.where ?? {};
      if (params.args.where[field] === undefined) {
        params.args.where[field] = field === 'deletedAt' ? null : false;
      }
    } else if (params.action === 'updateMany') {
      params.args.where = params.args.where ?? {};
      if (params.args.where[field] === undefined) {
        params.args.where[field] = field === 'deletedAt' ? null : false;
      }
    }

    return next(params);
  });
}

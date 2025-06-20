import type { Prisma } from '../../client';

import { z } from 'zod';

export const RegistryItemCreateManyCollectionInputSchema: z.ZodType<Prisma.RegistryItemCreateManyCollectionInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  quantity: z.number().int().optional(),
  priority: z.number().int().optional(),
  notes: z.string().optional().nullable(),
  purchased: z.boolean().optional(),
  registryId: z.string(),
  productId: z.string().optional().nullable()
}).strict();

export default RegistryItemCreateManyCollectionInputSchema;

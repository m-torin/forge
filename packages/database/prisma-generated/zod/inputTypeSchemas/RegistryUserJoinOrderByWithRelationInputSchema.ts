import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { RegistryOrderByWithRelationInputSchema } from './RegistryOrderByWithRelationInputSchema';

export const RegistryUserJoinOrderByWithRelationInputSchema: z.ZodType<Prisma.RegistryUserJoinOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      role: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      registryId: z.lazy(() => SortOrderSchema).optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      registry: z.lazy(() => RegistryOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default RegistryUserJoinOrderByWithRelationInputSchema;

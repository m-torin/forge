import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinSelectSchema } from '../inputTypeSchemas/RegistryPurchaseJoinSelectSchema';
import { RegistryPurchaseJoinIncludeSchema } from '../inputTypeSchemas/RegistryPurchaseJoinIncludeSchema';

export const RegistryPurchaseJoinArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinDefaultArgs> = z.object({
  select: z.lazy(() => RegistryPurchaseJoinSelectSchema).optional(),
  include: z.lazy(() => RegistryPurchaseJoinIncludeSchema).optional(),
}).strict();

export default RegistryPurchaseJoinArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinCreateManyInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinCreateManyInputSchema'

export const RegistryPurchaseJoinCreateManyArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateManyArgs> = z.object({
  data: z.union([ RegistryPurchaseJoinCreateManyInputSchema,RegistryPurchaseJoinCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RegistryPurchaseJoinCreateManyArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinCreateManyInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinCreateManyInputSchema'

export const RegistryPurchaseJoinCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateManyAndReturnArgs> = z.object({
  data: z.union([ RegistryPurchaseJoinCreateManyInputSchema,RegistryPurchaseJoinCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default RegistryPurchaseJoinCreateManyAndReturnArgsSchema;

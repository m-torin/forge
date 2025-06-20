import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinWhereInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinWhereInputSchema'

export const RegistryPurchaseJoinDeleteManyArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinDeleteManyArgs> = z.object({
  where: RegistryPurchaseJoinWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default RegistryPurchaseJoinDeleteManyArgsSchema;

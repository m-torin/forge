import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryWhereInputSchema } from '../inputTypeSchemas/InventoryWhereInputSchema'

export const InventoryDeleteManyArgsSchema: z.ZodType<Prisma.InventoryDeleteManyArgs> = z.object({
  where: InventoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default InventoryDeleteManyArgsSchema;

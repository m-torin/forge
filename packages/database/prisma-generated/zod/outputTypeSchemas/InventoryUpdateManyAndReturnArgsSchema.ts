import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryUpdateManyMutationInputSchema } from '../inputTypeSchemas/InventoryUpdateManyMutationInputSchema'
import { InventoryUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/InventoryUncheckedUpdateManyInputSchema'
import { InventoryWhereInputSchema } from '../inputTypeSchemas/InventoryWhereInputSchema'

export const InventoryUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.InventoryUpdateManyAndReturnArgs> = z.object({
  data: z.union([ InventoryUpdateManyMutationInputSchema,InventoryUncheckedUpdateManyInputSchema ]),
  where: InventoryWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default InventoryUpdateManyAndReturnArgsSchema;

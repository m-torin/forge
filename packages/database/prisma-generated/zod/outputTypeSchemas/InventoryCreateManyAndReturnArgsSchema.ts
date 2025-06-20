import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryCreateManyInputSchema } from '../inputTypeSchemas/InventoryCreateManyInputSchema'

export const InventoryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InventoryCreateManyAndReturnArgs> = z.object({
  data: z.union([ InventoryCreateManyInputSchema,InventoryCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default InventoryCreateManyAndReturnArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductCreateManyInputSchema } from '../inputTypeSchemas/ProductCreateManyInputSchema'

export const ProductCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductCreateManyAndReturnArgs> = z.object({
  data: z.union([ ProductCreateManyInputSchema,ProductCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ProductCreateManyAndReturnArgsSchema;

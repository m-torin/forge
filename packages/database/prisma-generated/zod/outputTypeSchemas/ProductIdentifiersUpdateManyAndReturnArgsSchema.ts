import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIdentifiersUpdateManyMutationInputSchema } from '../inputTypeSchemas/ProductIdentifiersUpdateManyMutationInputSchema'
import { ProductIdentifiersUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ProductIdentifiersUncheckedUpdateManyInputSchema'
import { ProductIdentifiersWhereInputSchema } from '../inputTypeSchemas/ProductIdentifiersWhereInputSchema'

export const ProductIdentifiersUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyAndReturnArgs> = z.object({
  data: z.union([ ProductIdentifiersUpdateManyMutationInputSchema,ProductIdentifiersUncheckedUpdateManyInputSchema ]),
  where: ProductIdentifiersWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ProductIdentifiersUpdateManyAndReturnArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyUpdateManyMutationInputSchema } from '../inputTypeSchemas/TaxonomyUpdateManyMutationInputSchema'
import { TaxonomyUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TaxonomyUncheckedUpdateManyInputSchema'
import { TaxonomyWhereInputSchema } from '../inputTypeSchemas/TaxonomyWhereInputSchema'

export const TaxonomyUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TaxonomyUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TaxonomyUpdateManyMutationInputSchema,TaxonomyUncheckedUpdateManyInputSchema ]),
  where: TaxonomyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TaxonomyUpdateManyAndReturnArgsSchema;

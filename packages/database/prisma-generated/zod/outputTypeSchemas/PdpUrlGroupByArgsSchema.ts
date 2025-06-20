import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlWhereInputSchema } from '../inputTypeSchemas/PdpUrlWhereInputSchema'
import { PdpUrlOrderByWithAggregationInputSchema } from '../inputTypeSchemas/PdpUrlOrderByWithAggregationInputSchema'
import { PdpUrlScalarFieldEnumSchema } from '../inputTypeSchemas/PdpUrlScalarFieldEnumSchema'
import { PdpUrlScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/PdpUrlScalarWhereWithAggregatesInputSchema'

export const PdpUrlGroupByArgsSchema: z.ZodType<Prisma.PdpUrlGroupByArgs> = z.object({
  where: PdpUrlWhereInputSchema.optional(),
  orderBy: z.union([ PdpUrlOrderByWithAggregationInputSchema.array(),PdpUrlOrderByWithAggregationInputSchema ]).optional(),
  by: PdpUrlScalarFieldEnumSchema.array(),
  having: PdpUrlScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PdpUrlGroupByArgsSchema;

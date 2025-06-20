import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyWhereInputSchema } from '../inputTypeSchemas/PasskeyWhereInputSchema'
import { PasskeyOrderByWithAggregationInputSchema } from '../inputTypeSchemas/PasskeyOrderByWithAggregationInputSchema'
import { PasskeyScalarFieldEnumSchema } from '../inputTypeSchemas/PasskeyScalarFieldEnumSchema'
import { PasskeyScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/PasskeyScalarWhereWithAggregatesInputSchema'

export const PasskeyGroupByArgsSchema: z.ZodType<Prisma.PasskeyGroupByArgs> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  orderBy: z.union([ PasskeyOrderByWithAggregationInputSchema.array(),PasskeyOrderByWithAggregationInputSchema ]).optional(),
  by: PasskeyScalarFieldEnumSchema.array(),
  having: PasskeyScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default PasskeyGroupByArgsSchema;

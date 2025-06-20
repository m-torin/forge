import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorWhereInputSchema } from '../inputTypeSchemas/TwoFactorWhereInputSchema'
import { TwoFactorOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TwoFactorOrderByWithAggregationInputSchema'
import { TwoFactorScalarFieldEnumSchema } from '../inputTypeSchemas/TwoFactorScalarFieldEnumSchema'
import { TwoFactorScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TwoFactorScalarWhereWithAggregatesInputSchema'

export const TwoFactorGroupByArgsSchema: z.ZodType<Prisma.TwoFactorGroupByArgs> = z.object({
  where: TwoFactorWhereInputSchema.optional(),
  orderBy: z.union([ TwoFactorOrderByWithAggregationInputSchema.array(),TwoFactorOrderByWithAggregationInputSchema ]).optional(),
  by: TwoFactorScalarFieldEnumSchema.array(),
  having: TwoFactorScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default TwoFactorGroupByArgsSchema;

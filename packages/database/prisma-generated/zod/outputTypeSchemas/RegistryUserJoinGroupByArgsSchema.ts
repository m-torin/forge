import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinWhereInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereInputSchema'
import { RegistryUserJoinOrderByWithAggregationInputSchema } from '../inputTypeSchemas/RegistryUserJoinOrderByWithAggregationInputSchema'
import { RegistryUserJoinScalarFieldEnumSchema } from '../inputTypeSchemas/RegistryUserJoinScalarFieldEnumSchema'
import { RegistryUserJoinScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/RegistryUserJoinScalarWhereWithAggregatesInputSchema'

export const RegistryUserJoinGroupByArgsSchema: z.ZodType<Prisma.RegistryUserJoinGroupByArgs> = z.object({
  where: RegistryUserJoinWhereInputSchema.optional(),
  orderBy: z.union([ RegistryUserJoinOrderByWithAggregationInputSchema.array(),RegistryUserJoinOrderByWithAggregationInputSchema ]).optional(),
  by: RegistryUserJoinScalarFieldEnumSchema.array(),
  having: RegistryUserJoinScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default RegistryUserJoinGroupByArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinWhereInputSchema } from '../inputTypeSchemas/PdpJoinWhereInputSchema';
import { PdpJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/PdpJoinOrderByWithRelationInputSchema';
import { PdpJoinWhereUniqueInputSchema } from '../inputTypeSchemas/PdpJoinWhereUniqueInputSchema';

export const PdpJoinAggregateArgsSchema: z.ZodType<Prisma.PdpJoinAggregateArgs> = z
  .object({
    where: PdpJoinWhereInputSchema.optional(),
    orderBy: z
      .union([PdpJoinOrderByWithRelationInputSchema.array(), PdpJoinOrderByWithRelationInputSchema])
      .optional(),
    cursor: PdpJoinWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default PdpJoinAggregateArgsSchema;

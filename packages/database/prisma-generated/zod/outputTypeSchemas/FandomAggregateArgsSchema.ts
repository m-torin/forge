import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomWhereInputSchema } from '../inputTypeSchemas/FandomWhereInputSchema';
import { FandomOrderByWithRelationInputSchema } from '../inputTypeSchemas/FandomOrderByWithRelationInputSchema';
import { FandomWhereUniqueInputSchema } from '../inputTypeSchemas/FandomWhereUniqueInputSchema';

export const FandomAggregateArgsSchema: z.ZodType<Prisma.FandomAggregateArgs> = z
  .object({
    where: FandomWhereInputSchema.optional(),
    orderBy: z
      .union([FandomOrderByWithRelationInputSchema.array(), FandomOrderByWithRelationInputSchema])
      .optional(),
    cursor: FandomWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default FandomAggregateArgsSchema;

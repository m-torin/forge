import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorWhereInputSchema } from '../inputTypeSchemas/TwoFactorWhereInputSchema';
import { TwoFactorOrderByWithRelationInputSchema } from '../inputTypeSchemas/TwoFactorOrderByWithRelationInputSchema';
import { TwoFactorWhereUniqueInputSchema } from '../inputTypeSchemas/TwoFactorWhereUniqueInputSchema';

export const TwoFactorAggregateArgsSchema: z.ZodType<Prisma.TwoFactorAggregateArgs> = z
  .object({
    where: TwoFactorWhereInputSchema.optional(),
    orderBy: z
      .union([
        TwoFactorOrderByWithRelationInputSchema.array(),
        TwoFactorOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: TwoFactorWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default TwoFactorAggregateArgsSchema;

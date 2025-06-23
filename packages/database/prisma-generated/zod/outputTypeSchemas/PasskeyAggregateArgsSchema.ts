import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyWhereInputSchema } from '../inputTypeSchemas/PasskeyWhereInputSchema';
import { PasskeyOrderByWithRelationInputSchema } from '../inputTypeSchemas/PasskeyOrderByWithRelationInputSchema';
import { PasskeyWhereUniqueInputSchema } from '../inputTypeSchemas/PasskeyWhereUniqueInputSchema';

export const PasskeyAggregateArgsSchema: z.ZodType<Prisma.PasskeyAggregateArgs> = z
  .object({
    where: PasskeyWhereInputSchema.optional(),
    orderBy: z
      .union([PasskeyOrderByWithRelationInputSchema.array(), PasskeyOrderByWithRelationInputSchema])
      .optional(),
    cursor: PasskeyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default PasskeyAggregateArgsSchema;

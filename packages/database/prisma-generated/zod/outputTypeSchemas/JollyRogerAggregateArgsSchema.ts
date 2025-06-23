import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerWhereInputSchema } from '../inputTypeSchemas/JollyRogerWhereInputSchema';
import { JollyRogerOrderByWithRelationInputSchema } from '../inputTypeSchemas/JollyRogerOrderByWithRelationInputSchema';
import { JollyRogerWhereUniqueInputSchema } from '../inputTypeSchemas/JollyRogerWhereUniqueInputSchema';

export const JollyRogerAggregateArgsSchema: z.ZodType<Prisma.JollyRogerAggregateArgs> = z
  .object({
    where: JollyRogerWhereInputSchema.optional(),
    orderBy: z
      .union([
        JollyRogerOrderByWithRelationInputSchema.array(),
        JollyRogerOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: JollyRogerWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default JollyRogerAggregateArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { ApiKeyWhereInputSchema } from '../inputTypeSchemas/ApiKeyWhereInputSchema';
import { ApiKeyOrderByWithRelationInputSchema } from '../inputTypeSchemas/ApiKeyOrderByWithRelationInputSchema';
import { ApiKeyWhereUniqueInputSchema } from '../inputTypeSchemas/ApiKeyWhereUniqueInputSchema';

export const ApiKeyAggregateArgsSchema: z.ZodType<Prisma.ApiKeyAggregateArgs> = z
  .object({
    where: ApiKeyWhereInputSchema.optional(),
    orderBy: z
      .union([ApiKeyOrderByWithRelationInputSchema.array(), ApiKeyOrderByWithRelationInputSchema])
      .optional(),
    cursor: ApiKeyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default ApiKeyAggregateArgsSchema;

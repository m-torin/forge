import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinWhereInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereInputSchema';
import { RegistryUserJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/RegistryUserJoinOrderByWithRelationInputSchema';
import { RegistryUserJoinWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereUniqueInputSchema';

export const RegistryUserJoinAggregateArgsSchema: z.ZodType<Prisma.RegistryUserJoinAggregateArgs> =
  z
    .object({
      where: RegistryUserJoinWhereInputSchema.optional(),
      orderBy: z
        .union([
          RegistryUserJoinOrderByWithRelationInputSchema.array(),
          RegistryUserJoinOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: RegistryUserJoinWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
    })
    .strict();

export default RegistryUserJoinAggregateArgsSchema;

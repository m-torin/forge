import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryWhereInputSchema } from '../inputTypeSchemas/RegistryWhereInputSchema';

export const RegistryDeleteManyArgsSchema: z.ZodType<Prisma.RegistryDeleteManyArgs> = z
  .object({
    where: RegistryWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default RegistryDeleteManyArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemWhereInputSchema } from '../inputTypeSchemas/RegistryItemWhereInputSchema';

export const RegistryItemDeleteManyArgsSchema: z.ZodType<Prisma.RegistryItemDeleteManyArgs> = z
  .object({
    where: RegistryItemWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default RegistryItemDeleteManyArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemCreateManyInputSchema } from '../inputTypeSchemas/RegistryItemCreateManyInputSchema';

export const RegistryItemCreateManyArgsSchema: z.ZodType<Prisma.RegistryItemCreateManyArgs> = z
  .object({
    data: z.union([RegistryItemCreateManyInputSchema, RegistryItemCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default RegistryItemCreateManyArgsSchema;

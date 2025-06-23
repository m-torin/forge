import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemCreateManyInputSchema } from '../inputTypeSchemas/RegistryItemCreateManyInputSchema';

export const RegistryItemCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryItemCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([RegistryItemCreateManyInputSchema, RegistryItemCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryItemCreateManyAndReturnArgsSchema;

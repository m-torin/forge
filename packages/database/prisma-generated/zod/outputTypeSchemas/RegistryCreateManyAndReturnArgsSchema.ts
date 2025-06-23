import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryCreateManyInputSchema } from '../inputTypeSchemas/RegistryCreateManyInputSchema';

export const RegistryCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([RegistryCreateManyInputSchema, RegistryCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryCreateManyAndReturnArgsSchema;

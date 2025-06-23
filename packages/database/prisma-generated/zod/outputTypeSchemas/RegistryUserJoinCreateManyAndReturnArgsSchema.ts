import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinCreateManyInputSchema } from '../inputTypeSchemas/RegistryUserJoinCreateManyInputSchema';

export const RegistryUserJoinCreateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryUserJoinCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        RegistryUserJoinCreateManyInputSchema,
        RegistryUserJoinCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default RegistryUserJoinCreateManyAndReturnArgsSchema;

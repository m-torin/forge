import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinUpdateManyMutationInputSchema } from '../inputTypeSchemas/RegistryUserJoinUpdateManyMutationInputSchema';
import { RegistryUserJoinUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RegistryUserJoinUncheckedUpdateManyInputSchema';
import { RegistryUserJoinWhereInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereInputSchema';

export const RegistryUserJoinUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryUserJoinUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        RegistryUserJoinUpdateManyMutationInputSchema,
        RegistryUserJoinUncheckedUpdateManyInputSchema,
      ]),
      where: RegistryUserJoinWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default RegistryUserJoinUpdateManyAndReturnArgsSchema;

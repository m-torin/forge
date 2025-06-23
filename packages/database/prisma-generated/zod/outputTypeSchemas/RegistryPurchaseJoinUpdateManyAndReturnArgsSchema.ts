import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryPurchaseJoinUpdateManyMutationInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinUpdateManyMutationInputSchema';
import { RegistryPurchaseJoinUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinUncheckedUpdateManyInputSchema';
import { RegistryPurchaseJoinWhereInputSchema } from '../inputTypeSchemas/RegistryPurchaseJoinWhereInputSchema';

export const RegistryPurchaseJoinUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        RegistryPurchaseJoinUpdateManyMutationInputSchema,
        RegistryPurchaseJoinUncheckedUpdateManyInputSchema,
      ]),
      where: RegistryPurchaseJoinWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default RegistryPurchaseJoinUpdateManyAndReturnArgsSchema;

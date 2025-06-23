import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryItemUpdateManyMutationInputSchema } from '../inputTypeSchemas/RegistryItemUpdateManyMutationInputSchema';
import { RegistryItemUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/RegistryItemUncheckedUpdateManyInputSchema';
import { RegistryItemWhereInputSchema } from '../inputTypeSchemas/RegistryItemWhereInputSchema';

export const RegistryItemUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.RegistryItemUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        RegistryItemUpdateManyMutationInputSchema,
        RegistryItemUncheckedUpdateManyInputSchema,
      ]),
      where: RegistryItemWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default RegistryItemUpdateManyAndReturnArgsSchema;

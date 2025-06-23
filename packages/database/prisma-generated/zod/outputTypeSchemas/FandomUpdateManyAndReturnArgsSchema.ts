import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomUpdateManyMutationInputSchema } from '../inputTypeSchemas/FandomUpdateManyMutationInputSchema';
import { FandomUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/FandomUncheckedUpdateManyInputSchema';
import { FandomWhereInputSchema } from '../inputTypeSchemas/FandomWhereInputSchema';

export const FandomUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.FandomUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([FandomUpdateManyMutationInputSchema, FandomUncheckedUpdateManyInputSchema]),
      where: FandomWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default FandomUpdateManyAndReturnArgsSchema;

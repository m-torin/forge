import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinUpdateManyMutationInputSchema } from '../inputTypeSchemas/PdpJoinUpdateManyMutationInputSchema';
import { PdpJoinUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PdpJoinUncheckedUpdateManyInputSchema';
import { PdpJoinWhereInputSchema } from '../inputTypeSchemas/PdpJoinWhereInputSchema';

export const PdpJoinUpdateManyArgsSchema: z.ZodType<Prisma.PdpJoinUpdateManyArgs> = z
  .object({
    data: z.union([PdpJoinUpdateManyMutationInputSchema, PdpJoinUncheckedUpdateManyInputSchema]),
    where: PdpJoinWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default PdpJoinUpdateManyArgsSchema;

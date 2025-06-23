import { z } from 'zod';
import type { Prisma } from '../../client';
import { VerificationUpdateManyMutationInputSchema } from '../inputTypeSchemas/VerificationUpdateManyMutationInputSchema';
import { VerificationUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/VerificationUncheckedUpdateManyInputSchema';
import { VerificationWhereInputSchema } from '../inputTypeSchemas/VerificationWhereInputSchema';

export const VerificationUpdateManyArgsSchema: z.ZodType<Prisma.VerificationUpdateManyArgs> = z
  .object({
    data: z.union([
      VerificationUpdateManyMutationInputSchema,
      VerificationUncheckedUpdateManyInputSchema,
    ]),
    where: VerificationWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default VerificationUpdateManyArgsSchema;

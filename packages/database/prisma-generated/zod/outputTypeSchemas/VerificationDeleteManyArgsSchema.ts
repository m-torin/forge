import { z } from 'zod';
import type { Prisma } from '../../client';
import { VerificationWhereInputSchema } from '../inputTypeSchemas/VerificationWhereInputSchema';

export const VerificationDeleteManyArgsSchema: z.ZodType<Prisma.VerificationDeleteManyArgs> = z
  .object({
    where: VerificationWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default VerificationDeleteManyArgsSchema;

import { z } from 'zod';
import type { Prisma } from '../../client';
import { VerificationCreateManyInputSchema } from '../inputTypeSchemas/VerificationCreateManyInputSchema'

export const VerificationCreateManyArgsSchema: z.ZodType<Prisma.VerificationCreateManyArgs> = z.object({
  data: z.union([ VerificationCreateManyInputSchema,VerificationCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default VerificationCreateManyArgsSchema;

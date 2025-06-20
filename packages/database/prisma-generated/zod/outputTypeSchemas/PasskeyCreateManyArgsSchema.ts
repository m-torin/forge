import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyCreateManyInputSchema } from '../inputTypeSchemas/PasskeyCreateManyInputSchema'

export const PasskeyCreateManyArgsSchema: z.ZodType<Prisma.PasskeyCreateManyArgs> = z.object({
  data: z.union([ PasskeyCreateManyInputSchema,PasskeyCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PasskeyCreateManyArgsSchema;

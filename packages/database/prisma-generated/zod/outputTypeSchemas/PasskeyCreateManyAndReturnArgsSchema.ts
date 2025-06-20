import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyCreateManyInputSchema } from '../inputTypeSchemas/PasskeyCreateManyInputSchema'

export const PasskeyCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PasskeyCreateManyAndReturnArgs> = z.object({
  data: z.union([ PasskeyCreateManyInputSchema,PasskeyCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PasskeyCreateManyAndReturnArgsSchema;

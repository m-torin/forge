import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomCreateManyInputSchema } from '../inputTypeSchemas/FandomCreateManyInputSchema'

export const FandomCreateManyAndReturnArgsSchema: z.ZodType<Prisma.FandomCreateManyAndReturnArgs> = z.object({
  data: z.union([ FandomCreateManyInputSchema,FandomCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default FandomCreateManyAndReturnArgsSchema;

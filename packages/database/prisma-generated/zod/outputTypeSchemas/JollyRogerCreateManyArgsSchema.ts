import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerCreateManyInputSchema } from '../inputTypeSchemas/JollyRogerCreateManyInputSchema'

export const JollyRogerCreateManyArgsSchema: z.ZodType<Prisma.JollyRogerCreateManyArgs> = z.object({
  data: z.union([ JollyRogerCreateManyInputSchema,JollyRogerCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default JollyRogerCreateManyArgsSchema;

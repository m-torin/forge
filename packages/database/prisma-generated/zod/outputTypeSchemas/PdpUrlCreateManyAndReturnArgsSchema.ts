import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlCreateManyInputSchema } from '../inputTypeSchemas/PdpUrlCreateManyInputSchema'

export const PdpUrlCreateManyAndReturnArgsSchema: z.ZodType<Prisma.PdpUrlCreateManyAndReturnArgs> = z.object({
  data: z.union([ PdpUrlCreateManyInputSchema,PdpUrlCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default PdpUrlCreateManyAndReturnArgsSchema;

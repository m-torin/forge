import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpUrlUpdateManyMutationInputSchema } from '../inputTypeSchemas/PdpUrlUpdateManyMutationInputSchema'
import { PdpUrlUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PdpUrlUncheckedUpdateManyInputSchema'
import { PdpUrlWhereInputSchema } from '../inputTypeSchemas/PdpUrlWhereInputSchema'

export const PdpUrlUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PdpUrlUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PdpUrlUpdateManyMutationInputSchema,PdpUrlUncheckedUpdateManyInputSchema ]),
  where: PdpUrlWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PdpUrlUpdateManyAndReturnArgsSchema;

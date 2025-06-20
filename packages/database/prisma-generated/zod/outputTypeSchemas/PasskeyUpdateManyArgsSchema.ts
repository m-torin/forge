import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyUpdateManyMutationInputSchema } from '../inputTypeSchemas/PasskeyUpdateManyMutationInputSchema'
import { PasskeyUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PasskeyUncheckedUpdateManyInputSchema'
import { PasskeyWhereInputSchema } from '../inputTypeSchemas/PasskeyWhereInputSchema'

export const PasskeyUpdateManyArgsSchema: z.ZodType<Prisma.PasskeyUpdateManyArgs> = z.object({
  data: z.union([ PasskeyUpdateManyMutationInputSchema,PasskeyUncheckedUpdateManyInputSchema ]),
  where: PasskeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PasskeyUpdateManyArgsSchema;

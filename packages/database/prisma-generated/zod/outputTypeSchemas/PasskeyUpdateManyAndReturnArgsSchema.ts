import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyUpdateManyMutationInputSchema } from '../inputTypeSchemas/PasskeyUpdateManyMutationInputSchema'
import { PasskeyUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/PasskeyUncheckedUpdateManyInputSchema'
import { PasskeyWhereInputSchema } from '../inputTypeSchemas/PasskeyWhereInputSchema'

export const PasskeyUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.PasskeyUpdateManyAndReturnArgs> = z.object({
  data: z.union([ PasskeyUpdateManyMutationInputSchema,PasskeyUncheckedUpdateManyInputSchema ]),
  where: PasskeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PasskeyUpdateManyAndReturnArgsSchema;

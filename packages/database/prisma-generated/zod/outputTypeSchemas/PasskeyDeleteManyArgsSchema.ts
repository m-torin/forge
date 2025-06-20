import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyWhereInputSchema } from '../inputTypeSchemas/PasskeyWhereInputSchema'

export const PasskeyDeleteManyArgsSchema: z.ZodType<Prisma.PasskeyDeleteManyArgs> = z.object({
  where: PasskeyWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default PasskeyDeleteManyArgsSchema;

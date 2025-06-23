import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerWhereInputSchema } from '../inputTypeSchemas/JollyRogerWhereInputSchema';

export const JollyRogerDeleteManyArgsSchema: z.ZodType<Prisma.JollyRogerDeleteManyArgs> = z
  .object({
    where: JollyRogerWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default JollyRogerDeleteManyArgsSchema;

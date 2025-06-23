import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerUpdateManyMutationInputSchema } from '../inputTypeSchemas/JollyRogerUpdateManyMutationInputSchema';
import { JollyRogerUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/JollyRogerUncheckedUpdateManyInputSchema';
import { JollyRogerWhereInputSchema } from '../inputTypeSchemas/JollyRogerWhereInputSchema';

export const JollyRogerUpdateManyArgsSchema: z.ZodType<Prisma.JollyRogerUpdateManyArgs> = z
  .object({
    data: z.union([
      JollyRogerUpdateManyMutationInputSchema,
      JollyRogerUncheckedUpdateManyInputSchema,
    ]),
    where: JollyRogerWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default JollyRogerUpdateManyArgsSchema;

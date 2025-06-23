import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerSelectSchema } from '../inputTypeSchemas/JollyRogerSelectSchema';
import { JollyRogerIncludeSchema } from '../inputTypeSchemas/JollyRogerIncludeSchema';

export const JollyRogerArgsSchema: z.ZodType<Prisma.JollyRogerDefaultArgs> = z
  .object({
    select: z.lazy(() => JollyRogerSelectSchema).optional(),
    include: z.lazy(() => JollyRogerIncludeSchema).optional(),
  })
  .strict();

export default JollyRogerArgsSchema;

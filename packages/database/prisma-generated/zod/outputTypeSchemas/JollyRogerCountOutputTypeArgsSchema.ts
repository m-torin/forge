import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerCountOutputTypeSelectSchema } from './JollyRogerCountOutputTypeSelectSchema';

export const JollyRogerCountOutputTypeArgsSchema: z.ZodType<Prisma.JollyRogerCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => JollyRogerCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default JollyRogerCountOutputTypeSelectSchema;

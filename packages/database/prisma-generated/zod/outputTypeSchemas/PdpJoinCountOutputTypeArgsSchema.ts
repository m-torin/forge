import { z } from 'zod';
import type { Prisma } from '../../client';
import { PdpJoinCountOutputTypeSelectSchema } from './PdpJoinCountOutputTypeSelectSchema';

export const PdpJoinCountOutputTypeArgsSchema: z.ZodType<Prisma.PdpJoinCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => PdpJoinCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default PdpJoinCountOutputTypeSelectSchema;

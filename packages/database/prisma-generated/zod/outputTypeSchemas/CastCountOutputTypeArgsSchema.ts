import { z } from 'zod';
import type { Prisma } from '../../client';
import { CastCountOutputTypeSelectSchema } from './CastCountOutputTypeSelectSchema';

export const CastCountOutputTypeArgsSchema: z.ZodType<Prisma.CastCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => CastCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export default CastCountOutputTypeSelectSchema;

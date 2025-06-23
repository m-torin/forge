import { z } from 'zod';
import type { Prisma } from '../../client';
import { FandomCountOutputTypeSelectSchema } from './FandomCountOutputTypeSelectSchema';

export const FandomCountOutputTypeArgsSchema: z.ZodType<Prisma.FandomCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => FandomCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export default FandomCountOutputTypeSelectSchema;

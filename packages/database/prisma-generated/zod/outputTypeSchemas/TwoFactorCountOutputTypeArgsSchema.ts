import { z } from 'zod';
import type { Prisma } from '../../client';
import { TwoFactorCountOutputTypeSelectSchema } from './TwoFactorCountOutputTypeSelectSchema';

export const TwoFactorCountOutputTypeArgsSchema: z.ZodType<Prisma.TwoFactorCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => TwoFactorCountOutputTypeSelectSchema).nullish(),
}).strict();

export default TwoFactorCountOutputTypeSelectSchema;

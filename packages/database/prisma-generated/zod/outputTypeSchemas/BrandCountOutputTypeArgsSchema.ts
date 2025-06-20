import { z } from 'zod';
import type { Prisma } from '../../client';
import { BrandCountOutputTypeSelectSchema } from './BrandCountOutputTypeSelectSchema';

export const BrandCountOutputTypeArgsSchema: z.ZodType<Prisma.BrandCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => BrandCountOutputTypeSelectSchema).nullish(),
}).strict();

export default BrandCountOutputTypeSelectSchema;

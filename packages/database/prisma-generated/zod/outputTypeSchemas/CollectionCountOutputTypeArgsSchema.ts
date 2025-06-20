import { z } from 'zod';
import type { Prisma } from '../../client';
import { CollectionCountOutputTypeSelectSchema } from './CollectionCountOutputTypeSelectSchema';

export const CollectionCountOutputTypeArgsSchema: z.ZodType<Prisma.CollectionCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => CollectionCountOutputTypeSelectSchema).nullish(),
}).strict();

export default CollectionCountOutputTypeSelectSchema;

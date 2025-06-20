import { z } from 'zod';
import type { Prisma } from '../../client';
import { AddressCountOutputTypeSelectSchema } from './AddressCountOutputTypeSelectSchema';

export const AddressCountOutputTypeArgsSchema: z.ZodType<Prisma.AddressCountOutputTypeDefaultArgs> = z.object({
  select: z.lazy(() => AddressCountOutputTypeSelectSchema).nullish(),
}).strict();

export default AddressCountOutputTypeSelectSchema;

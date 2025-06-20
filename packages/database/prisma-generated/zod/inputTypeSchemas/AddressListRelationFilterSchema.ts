import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';

export const AddressListRelationFilterSchema: z.ZodType<Prisma.AddressListRelationFilter> = z.object({
  every: z.lazy(() => AddressWhereInputSchema).optional(),
  some: z.lazy(() => AddressWhereInputSchema).optional(),
  none: z.lazy(() => AddressWhereInputSchema).optional()
}).strict();

export default AddressListRelationFilterSchema;

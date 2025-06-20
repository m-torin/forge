import { z } from 'zod';
import type { Prisma } from '../../client';

export const AddressCountOutputTypeSelectSchema: z.ZodType<Prisma.AddressCountOutputTypeSelect> = z.object({
  orderShippingAddresses: z.boolean().optional(),
  orderBillingAddresses: z.boolean().optional(),
}).strict();

export default AddressCountOutputTypeSelectSchema;

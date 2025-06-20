import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';
import { AddressUpdateWithoutOrderBillingAddressesInputSchema } from './AddressUpdateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema';

export const AddressUpdateToOneWithWhereWithoutOrderBillingAddressesInputSchema: z.ZodType<Prisma.AddressUpdateToOneWithWhereWithoutOrderBillingAddressesInput> = z.object({
  where: z.lazy(() => AddressWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AddressUpdateWithoutOrderBillingAddressesInputSchema),z.lazy(() => AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema) ]),
}).strict();

export default AddressUpdateToOneWithWhereWithoutOrderBillingAddressesInputSchema;

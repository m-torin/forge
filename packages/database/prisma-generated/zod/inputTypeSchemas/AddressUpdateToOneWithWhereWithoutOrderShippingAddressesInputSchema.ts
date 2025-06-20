import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';
import { AddressUpdateWithoutOrderShippingAddressesInputSchema } from './AddressUpdateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema';

export const AddressUpdateToOneWithWhereWithoutOrderShippingAddressesInputSchema: z.ZodType<Prisma.AddressUpdateToOneWithWhereWithoutOrderShippingAddressesInput> = z.object({
  where: z.lazy(() => AddressWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => AddressUpdateWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema) ]),
}).strict();

export default AddressUpdateToOneWithWhereWithoutOrderShippingAddressesInputSchema;

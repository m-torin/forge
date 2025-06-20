import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressUpdateWithoutOrderShippingAddressesInputSchema } from './AddressUpdateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema';
import { AddressCreateWithoutOrderShippingAddressesInputSchema } from './AddressCreateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';

export const AddressUpsertWithoutOrderShippingAddressesInputSchema: z.ZodType<Prisma.AddressUpsertWithoutOrderShippingAddressesInput> = z.object({
  update: z.union([ z.lazy(() => AddressUpdateWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema) ]),
  create: z.union([ z.lazy(() => AddressCreateWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema) ]),
  where: z.lazy(() => AddressWhereInputSchema).optional()
}).strict();

export default AddressUpsertWithoutOrderShippingAddressesInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressCreateWithoutOrderShippingAddressesInputSchema } from './AddressCreateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema';

export const AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema: z.ZodType<Prisma.AddressCreateOrConnectWithoutOrderShippingAddressesInput> =
  z
    .object({
      where: z.lazy(() => AddressWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => AddressCreateWithoutOrderShippingAddressesInputSchema),
        z.lazy(() => AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema),
      ]),
    })
    .strict();

export default AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema;

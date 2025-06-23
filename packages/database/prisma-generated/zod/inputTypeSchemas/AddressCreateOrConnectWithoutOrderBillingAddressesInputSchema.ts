import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressCreateWithoutOrderBillingAddressesInputSchema } from './AddressCreateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema';

export const AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema: z.ZodType<Prisma.AddressCreateOrConnectWithoutOrderBillingAddressesInput> =
  z
    .object({
      where: z.lazy(() => AddressWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => AddressCreateWithoutOrderBillingAddressesInputSchema),
        z.lazy(() => AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema),
      ]),
    })
    .strict();

export default AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema;

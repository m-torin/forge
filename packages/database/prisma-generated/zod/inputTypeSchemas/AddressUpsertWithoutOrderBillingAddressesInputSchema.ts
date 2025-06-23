import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressUpdateWithoutOrderBillingAddressesInputSchema } from './AddressUpdateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema';
import { AddressCreateWithoutOrderBillingAddressesInputSchema } from './AddressCreateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';

export const AddressUpsertWithoutOrderBillingAddressesInputSchema: z.ZodType<Prisma.AddressUpsertWithoutOrderBillingAddressesInput> =
  z
    .object({
      update: z.union([
        z.lazy(() => AddressUpdateWithoutOrderBillingAddressesInputSchema),
        z.lazy(() => AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema),
      ]),
      create: z.union([
        z.lazy(() => AddressCreateWithoutOrderBillingAddressesInputSchema),
        z.lazy(() => AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema),
      ]),
      where: z.lazy(() => AddressWhereInputSchema).optional(),
    })
    .strict();

export default AddressUpsertWithoutOrderBillingAddressesInputSchema;

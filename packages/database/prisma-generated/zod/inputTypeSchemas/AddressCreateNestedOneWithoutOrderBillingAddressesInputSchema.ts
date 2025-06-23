import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressCreateWithoutOrderBillingAddressesInputSchema } from './AddressCreateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema';
import { AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema } from './AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';

export const AddressCreateNestedOneWithoutOrderBillingAddressesInputSchema: z.ZodType<Prisma.AddressCreateNestedOneWithoutOrderBillingAddressesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => AddressCreateWithoutOrderBillingAddressesInputSchema),
          z.lazy(() => AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema),
        ])
        .optional(),
      connectOrCreate: z
        .lazy(() => AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema)
        .optional(),
      connect: z.lazy(() => AddressWhereUniqueInputSchema).optional(),
    })
    .strict();

export default AddressCreateNestedOneWithoutOrderBillingAddressesInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressCreateWithoutOrderShippingAddressesInputSchema } from './AddressCreateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema';
import { AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema } from './AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';

export const AddressCreateNestedOneWithoutOrderShippingAddressesInputSchema: z.ZodType<Prisma.AddressCreateNestedOneWithoutOrderShippingAddressesInput> = z.object({
  create: z.union([ z.lazy(() => AddressCreateWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema).optional(),
  connect: z.lazy(() => AddressWhereUniqueInputSchema).optional()
}).strict();

export default AddressCreateNestedOneWithoutOrderShippingAddressesInputSchema;

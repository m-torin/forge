import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressCreateWithoutOrderShippingAddressesInputSchema } from './AddressCreateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema';
import { AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema } from './AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema';
import { AddressUpsertWithoutOrderShippingAddressesInputSchema } from './AddressUpsertWithoutOrderShippingAddressesInputSchema';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressUpdateToOneWithWhereWithoutOrderShippingAddressesInputSchema } from './AddressUpdateToOneWithWhereWithoutOrderShippingAddressesInputSchema';
import { AddressUpdateWithoutOrderShippingAddressesInputSchema } from './AddressUpdateWithoutOrderShippingAddressesInputSchema';
import { AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema } from './AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema';

export const AddressUpdateOneWithoutOrderShippingAddressesNestedInputSchema: z.ZodType<Prisma.AddressUpdateOneWithoutOrderShippingAddressesNestedInput> = z.object({
  create: z.union([ z.lazy(() => AddressCreateWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUncheckedCreateWithoutOrderShippingAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AddressCreateOrConnectWithoutOrderShippingAddressesInputSchema).optional(),
  upsert: z.lazy(() => AddressUpsertWithoutOrderShippingAddressesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => AddressWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => AddressWhereInputSchema) ]).optional(),
  connect: z.lazy(() => AddressWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AddressUpdateToOneWithWhereWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUpdateWithoutOrderShippingAddressesInputSchema),z.lazy(() => AddressUncheckedUpdateWithoutOrderShippingAddressesInputSchema) ]).optional(),
}).strict();

export default AddressUpdateOneWithoutOrderShippingAddressesNestedInputSchema;

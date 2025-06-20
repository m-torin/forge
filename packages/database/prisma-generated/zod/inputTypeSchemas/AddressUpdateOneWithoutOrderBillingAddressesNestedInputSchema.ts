import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressCreateWithoutOrderBillingAddressesInputSchema } from './AddressCreateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema';
import { AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema } from './AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema';
import { AddressUpsertWithoutOrderBillingAddressesInputSchema } from './AddressUpsertWithoutOrderBillingAddressesInputSchema';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';
import { AddressUpdateToOneWithWhereWithoutOrderBillingAddressesInputSchema } from './AddressUpdateToOneWithWhereWithoutOrderBillingAddressesInputSchema';
import { AddressUpdateWithoutOrderBillingAddressesInputSchema } from './AddressUpdateWithoutOrderBillingAddressesInputSchema';
import { AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema } from './AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema';

export const AddressUpdateOneWithoutOrderBillingAddressesNestedInputSchema: z.ZodType<Prisma.AddressUpdateOneWithoutOrderBillingAddressesNestedInput> = z.object({
  create: z.union([ z.lazy(() => AddressCreateWithoutOrderBillingAddressesInputSchema),z.lazy(() => AddressUncheckedCreateWithoutOrderBillingAddressesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => AddressCreateOrConnectWithoutOrderBillingAddressesInputSchema).optional(),
  upsert: z.lazy(() => AddressUpsertWithoutOrderBillingAddressesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => AddressWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => AddressWhereInputSchema) ]).optional(),
  connect: z.lazy(() => AddressWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => AddressUpdateToOneWithWhereWithoutOrderBillingAddressesInputSchema),z.lazy(() => AddressUpdateWithoutOrderBillingAddressesInputSchema),z.lazy(() => AddressUncheckedUpdateWithoutOrderBillingAddressesInputSchema) ]).optional(),
}).strict();

export default AddressUpdateOneWithoutOrderBillingAddressesNestedInputSchema;

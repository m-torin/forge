import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressTypeSchema } from './AddressTypeSchema';
import { OrderUncheckedCreateNestedManyWithoutShippingAddressInputSchema } from './OrderUncheckedCreateNestedManyWithoutShippingAddressInputSchema';
import { OrderUncheckedCreateNestedManyWithoutBillingAddressInputSchema } from './OrderUncheckedCreateNestedManyWithoutBillingAddressInputSchema';

export const AddressUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.AddressUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  type: z.lazy(() => AddressTypeSchema).optional(),
  isDefault: z.boolean().optional(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  street1: z.string(),
  street2: z.string().optional().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string().optional(),
  isValidated: z.boolean().optional(),
  validatedAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  orderShippingAddresses: z.lazy(() => OrderUncheckedCreateNestedManyWithoutShippingAddressInputSchema).optional(),
  orderBillingAddresses: z.lazy(() => OrderUncheckedCreateNestedManyWithoutBillingAddressInputSchema).optional()
}).strict();

export default AddressUncheckedCreateWithoutUserInputSchema;

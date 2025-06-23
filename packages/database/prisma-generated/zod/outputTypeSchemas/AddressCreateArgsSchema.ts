import { z } from 'zod';
import type { Prisma } from '../../client';
import { AddressIncludeSchema } from '../inputTypeSchemas/AddressIncludeSchema';
import { AddressCreateInputSchema } from '../inputTypeSchemas/AddressCreateInputSchema';
import { AddressUncheckedCreateInputSchema } from '../inputTypeSchemas/AddressUncheckedCreateInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { OrderFindManyArgsSchema } from '../outputTypeSchemas/OrderFindManyArgsSchema';
import { AddressCountOutputTypeArgsSchema } from '../outputTypeSchemas/AddressCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const AddressSelectSchema: z.ZodType<Prisma.AddressSelect> = z
  .object({
    id: z.boolean().optional(),
    userId: z.boolean().optional(),
    type: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    firstName: z.boolean().optional(),
    lastName: z.boolean().optional(),
    company: z.boolean().optional(),
    phone: z.boolean().optional(),
    street1: z.boolean().optional(),
    street2: z.boolean().optional(),
    city: z.boolean().optional(),
    state: z.boolean().optional(),
    postalCode: z.boolean().optional(),
    country: z.boolean().optional(),
    isValidated: z.boolean().optional(),
    validatedAt: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    orderShippingAddresses: z
      .union([z.boolean(), z.lazy(() => OrderFindManyArgsSchema)])
      .optional(),
    orderBillingAddresses: z.union([z.boolean(), z.lazy(() => OrderFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => AddressCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const AddressCreateArgsSchema: z.ZodType<Prisma.AddressCreateArgs> = z
  .object({
    select: AddressSelectSchema.optional(),
    include: z.lazy(() => AddressIncludeSchema).optional(),
    data: z.union([AddressCreateInputSchema, AddressUncheckedCreateInputSchema]),
  })
  .strict();

export default AddressCreateArgsSchema;

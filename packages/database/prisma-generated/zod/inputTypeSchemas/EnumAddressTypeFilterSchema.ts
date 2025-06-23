import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressTypeSchema } from './AddressTypeSchema';
import { NestedEnumAddressTypeFilterSchema } from './NestedEnumAddressTypeFilterSchema';

export const EnumAddressTypeFilterSchema: z.ZodType<Prisma.EnumAddressTypeFilter> = z
  .object({
    equals: z.lazy(() => AddressTypeSchema).optional(),
    in: z
      .lazy(() => AddressTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => AddressTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => AddressTypeSchema), z.lazy(() => NestedEnumAddressTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default EnumAddressTypeFilterSchema;

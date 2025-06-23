import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { AddressCountOrderByAggregateInputSchema } from './AddressCountOrderByAggregateInputSchema';
import { AddressMaxOrderByAggregateInputSchema } from './AddressMaxOrderByAggregateInputSchema';
import { AddressMinOrderByAggregateInputSchema } from './AddressMinOrderByAggregateInputSchema';

export const AddressOrderByWithAggregationInputSchema: z.ZodType<Prisma.AddressOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      isDefault: z.lazy(() => SortOrderSchema).optional(),
      firstName: z.lazy(() => SortOrderSchema).optional(),
      lastName: z.lazy(() => SortOrderSchema).optional(),
      company: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      phone: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      street1: z.lazy(() => SortOrderSchema).optional(),
      street2: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      city: z.lazy(() => SortOrderSchema).optional(),
      state: z.lazy(() => SortOrderSchema).optional(),
      postalCode: z.lazy(() => SortOrderSchema).optional(),
      country: z.lazy(() => SortOrderSchema).optional(),
      isValidated: z.lazy(() => SortOrderSchema).optional(),
      validatedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => AddressCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => AddressMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => AddressMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default AddressOrderByWithAggregationInputSchema;

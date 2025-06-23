import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumLocationTypeFilterSchema } from './EnumLocationTypeFilterSchema';
import { LocationTypeSchema } from './LocationTypeSchema';
import { EnumLodgingTypeNullableFilterSchema } from './EnumLodgingTypeNullableFilterSchema';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const LocationScalarWhereInputSchema: z.ZodType<Prisma.LocationScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => LocationScalarWhereInputSchema),
        z.lazy(() => LocationScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => LocationScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => LocationScalarWhereInputSchema),
        z.lazy(() => LocationScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    locationType: z
      .union([z.lazy(() => EnumLocationTypeFilterSchema), z.lazy(() => LocationTypeSchema)])
      .optional(),
    lodgingType: z
      .union([z.lazy(() => EnumLodgingTypeNullableFilterSchema), z.lazy(() => LodgingTypeSchema)])
      .optional()
      .nullable(),
    isFictional: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  })
  .strict();

export default LocationScalarWhereInputSchema;

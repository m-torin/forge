import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { LocationTypeSchema } from './LocationTypeSchema';
import { EnumLocationTypeFieldUpdateOperationsInputSchema } from './EnumLocationTypeFieldUpdateOperationsInputSchema';
import { LodgingTypeSchema } from './LodgingTypeSchema';
import { NullableEnumLodgingTypeFieldUpdateOperationsInputSchema } from './NullableEnumLodgingTypeFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { FandomUncheckedUpdateManyWithoutLocationsNestedInputSchema } from './FandomUncheckedUpdateManyWithoutLocationsNestedInputSchema';
import { PdpJoinUncheckedUpdateManyWithoutLocationsNestedInputSchema } from './PdpJoinUncheckedUpdateManyWithoutLocationsNestedInputSchema';
import { TaxonomyUncheckedUpdateManyWithoutLocationsNestedInputSchema } from './TaxonomyUncheckedUpdateManyWithoutLocationsNestedInputSchema';
import { JrFindReplaceRejectUncheckedUpdateManyWithoutLocationsNestedInputSchema } from './JrFindReplaceRejectUncheckedUpdateManyWithoutLocationsNestedInputSchema';

export const LocationUncheckedUpdateWithoutProductsInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateWithoutProductsInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  name: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  slug: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  locationType: z.union([ z.lazy(() => LocationTypeSchema),z.lazy(() => EnumLocationTypeFieldUpdateOperationsInputSchema) ]).optional(),
  lodgingType: z.union([ z.lazy(() => LodgingTypeSchema),z.lazy(() => NullableEnumLodgingTypeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  isFictional: z.union([ z.boolean(),z.lazy(() => BoolFieldUpdateOperationsInputSchema) ]).optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  deletedAt: z.union([ z.coerce.date(),z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  deletedById: z.union([ z.string(),z.lazy(() => NullableStringFieldUpdateOperationsInputSchema) ]).optional().nullable(),
  fandoms: z.lazy(() => FandomUncheckedUpdateManyWithoutLocationsNestedInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinUncheckedUpdateManyWithoutLocationsNestedInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyUncheckedUpdateManyWithoutLocationsNestedInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUncheckedUpdateManyWithoutLocationsNestedInputSchema).optional()
}).strict();

export default LocationUncheckedUpdateWithoutProductsInputSchema;

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
import { ProductUpdateManyWithoutLocationsNestedInputSchema } from './ProductUpdateManyWithoutLocationsNestedInputSchema';
import { FandomUpdateManyWithoutLocationsNestedInputSchema } from './FandomUpdateManyWithoutLocationsNestedInputSchema';
import { PdpJoinUpdateManyWithoutLocationsNestedInputSchema } from './PdpJoinUpdateManyWithoutLocationsNestedInputSchema';
import { TaxonomyUpdateManyWithoutLocationsNestedInputSchema } from './TaxonomyUpdateManyWithoutLocationsNestedInputSchema';
import { JrFindReplaceRejectUpdateManyWithoutLocationsNestedInputSchema } from './JrFindReplaceRejectUpdateManyWithoutLocationsNestedInputSchema';
import { UserUpdateOneWithoutDeletedLocationsNestedInputSchema } from './UserUpdateOneWithoutDeletedLocationsNestedInputSchema';

export const LocationUpdateInputSchema: z.ZodType<Prisma.LocationUpdateInput> = z.object({
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
  products: z.lazy(() => ProductUpdateManyWithoutLocationsNestedInputSchema).optional(),
  fandoms: z.lazy(() => FandomUpdateManyWithoutLocationsNestedInputSchema).optional(),
  pdpJoins: z.lazy(() => PdpJoinUpdateManyWithoutLocationsNestedInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyUpdateManyWithoutLocationsNestedInputSchema).optional(),
  jrFindReplaceRejects: z.lazy(() => JrFindReplaceRejectUpdateManyWithoutLocationsNestedInputSchema).optional(),
  deletedBy: z.lazy(() => UserUpdateOneWithoutDeletedLocationsNestedInputSchema).optional()
}).strict();

export default LocationUpdateInputSchema;

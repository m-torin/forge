import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { LocationTypeSchema } from '../inputTypeSchemas/LocationTypeSchema';
import { LodgingTypeSchema } from '../inputTypeSchemas/LodgingTypeSchema';

/////////////////////////////////////////
// LOCATION SCHEMA
/////////////////////////////////////////

export const LocationSchema = z.object({
  locationType: LocationTypeSchema,
  lodgingType: LodgingTypeSchema.nullable(),
  id: z.string().cuid(),
  name: z.string(),
  slug: z.string(),
  isFictional: z.boolean(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
});

export type Location = z.infer<typeof LocationSchema>;

export default LocationSchema;

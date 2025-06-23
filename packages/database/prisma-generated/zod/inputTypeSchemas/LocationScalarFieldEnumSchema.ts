import { z } from 'zod';

export const LocationScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'slug',
  'locationType',
  'lodgingType',
  'isFictional',
  'copy',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'deletedById',
]);

export default LocationScalarFieldEnumSchema;

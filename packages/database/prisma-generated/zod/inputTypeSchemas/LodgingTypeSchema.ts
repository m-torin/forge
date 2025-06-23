import { z } from 'zod';

export const LodgingTypeSchema = z.enum([
  'DISNEY_RESORT',
  'UNIVERSAL_RESORT',
  'ONSITE_HOTEL',
  'OFFSITE_HOTEL',
  'SHIP',
  'CAMPGROUND',
  'OTHER',
]);

export type LodgingTypeType = `${z.infer<typeof LodgingTypeSchema>}`;

export default LodgingTypeSchema;

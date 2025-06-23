import { z } from 'zod';

export const RegistryTypeSchema = z.enum([
  'WISHLIST',
  'GIFT',
  'WEDDING',
  'BABY',
  'BIRTHDAY',
  'HOLIDAY',
  'OTHER',
]);

export type RegistryTypeType = `${z.infer<typeof RegistryTypeSchema>}`;

export default RegistryTypeSchema;

import { z } from 'zod';
import { AddressTypeSchema } from '../inputTypeSchemas/AddressTypeSchema';

/////////////////////////////////////////
// ADDRESS SCHEMA
/////////////////////////////////////////

export const AddressSchema = z.object({
  type: AddressTypeSchema,
  id: z.string().cuid(),
  userId: z.string().nullable(),
  isDefault: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().nullable(),
  phone: z.string().nullable(),
  street1: z.string(),
  street2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  isValidated: z.boolean(),
  validatedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type Address = z.infer<typeof AddressSchema>;

export default AddressSchema;

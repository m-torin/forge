import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  role: z.string(),
  banned: z.boolean(),
  banReason: z.string().nullable(),
  banExpires: z.coerce.date().nullable(),
  deletedAt: z.coerce.date().nullable(),
  bio: z.string().nullable(),
  expertise: z.string().array(),
  isVerifiedAuthor: z.boolean(),
  authorSince: z.coerce.date().nullable(),
  preferences: JsonValueSchema.nullable(),
  isSuspended: z.boolean(),
  suspensionDetails: JsonValueSchema.nullable(),
});

export type User = z.infer<typeof UserSchema>;

export default UserSchema;

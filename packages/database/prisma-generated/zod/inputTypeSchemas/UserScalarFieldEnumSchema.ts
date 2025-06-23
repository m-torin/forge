import { z } from 'zod';

export const UserScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'email',
  'emailVerified',
  'image',
  'phoneNumber',
  'createdAt',
  'updatedAt',
  'role',
  'banned',
  'banReason',
  'banExpires',
  'deletedAt',
  'bio',
  'expertise',
  'isVerifiedAuthor',
  'authorSince',
  'preferences',
  'isSuspended',
  'suspensionDetails',
]);

export default UserScalarFieldEnumSchema;

import { z } from 'zod';

export const MemberScalarFieldEnumSchema = z.enum([
  'id',
  'userId',
  'organizationId',
  'role',
  'createdAt',
  'updatedAt',
]);

export default MemberScalarFieldEnumSchema;

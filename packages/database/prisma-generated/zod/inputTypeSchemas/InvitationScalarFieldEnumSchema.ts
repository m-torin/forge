import { z } from 'zod';

export const InvitationScalarFieldEnumSchema = z.enum([
  'id',
  'email',
  'invitedById',
  'organizationId',
  'role',
  'teamId',
  'status',
  'expiresAt',
  'createdAt',
  'updatedAt',
]);

export default InvitationScalarFieldEnumSchema;

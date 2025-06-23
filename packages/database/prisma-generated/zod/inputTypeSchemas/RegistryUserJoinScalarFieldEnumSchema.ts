import { z } from 'zod';

export const RegistryUserJoinScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'role',
  'userId',
  'registryId',
]);

export default RegistryUserJoinScalarFieldEnumSchema;

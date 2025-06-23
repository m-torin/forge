import { z } from 'zod';

export const TwoFactorScalarFieldEnumSchema = z.enum([
  'id',
  'userId',
  'secret',
  'secretHash',
  'enabled',
  'verified',
  'createdAt',
  'updatedAt',
]);

export default TwoFactorScalarFieldEnumSchema;

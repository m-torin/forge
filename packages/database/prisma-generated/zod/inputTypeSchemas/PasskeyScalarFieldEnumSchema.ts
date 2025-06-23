import { z } from 'zod';

export const PasskeyScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'userId',
  'credentialId',
  'publicKey',
  'counter',
  'deviceType',
  'backedUp',
  'transports',
  'createdAt',
  'updatedAt',
  'lastUsedAt',
]);

export default PasskeyScalarFieldEnumSchema;

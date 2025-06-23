import { z } from 'zod';

export const PdpUrlScalarFieldEnumSchema = z.enum([
  'id',
  'name',
  'url',
  'pdpJoinId',
  'urlType',
  'isActive',
  'copy',
  'createdAt',
]);

export default PdpUrlScalarFieldEnumSchema;

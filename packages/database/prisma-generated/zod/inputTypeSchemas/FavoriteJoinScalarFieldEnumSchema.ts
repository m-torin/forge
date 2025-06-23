import { z } from 'zod';

export const FavoriteJoinScalarFieldEnumSchema = z.enum([
  'id',
  'createdAt',
  'updatedAt',
  'userId',
  'productId',
  'collectionId',
]);

export default FavoriteJoinScalarFieldEnumSchema;

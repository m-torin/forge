import { z } from 'zod';

/////////////////////////////////////////
// FAVORITE JOIN SCHEMA
/////////////////////////////////////////

export const FavoriteJoinSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  productId: z.string().nullable(),
  collectionId: z.string().nullable(),
});

export type FavoriteJoin = z.infer<typeof FavoriteJoinSchema>;

export default FavoriteJoinSchema;

import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { CartStatusSchema } from '../inputTypeSchemas/CartStatusSchema';

/////////////////////////////////////////
// CART SCHEMA
/////////////////////////////////////////

export const CartSchema = z.object({
  status: CartStatusSchema,
  id: z.string().cuid(),
  userId: z.string().nullable(),
  sessionId: z.string().nullable(),
  expiresAt: z.coerce.date().nullable(),
  currency: z.string(),
  notes: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  abandonedAt: z.coerce.date().nullable(),
  recoveredAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

export type Cart = z.infer<typeof CartSchema>;

export default CartSchema;

import { z } from 'zod';

export const CartStatusSchema = z.enum(['ACTIVE','ABANDONED','CONVERTED','MERGED']);

export type CartStatusType = `${z.infer<typeof CartStatusSchema>}`

export default CartStatusSchema;

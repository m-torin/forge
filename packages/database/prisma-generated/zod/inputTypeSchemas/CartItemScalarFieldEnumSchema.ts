import { z } from 'zod';

export const CartItemScalarFieldEnumSchema = z.enum(['id','cartId','productId','variantId','quantity','price','isGift','giftMessage','registryId','savedForLater','metadata','createdAt','updatedAt']);

export default CartItemScalarFieldEnumSchema;

import { z } from 'zod';

export const RegistryPurchaseJoinScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','purchaseDate','quantity','status','transactionId','orderNumber','price','currency','trackingNumber','trackingUrl','estimatedDelivery','actualDelivery','isGift','giftMessage','giftWrapped','thankYouSent','thankYouSentAt','thankYouMessage','notes','purchaserId','registryItemId','notifiedOwner','notifiedDate']);

export default RegistryPurchaseJoinScalarFieldEnumSchema;

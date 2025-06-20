import { z } from 'zod';

export const PdpJoinScalarFieldEnumSchema = z.enum(['id','productId','brandId','canonicalUrl','iframeUrl','tempMediaUrls','lastScanned','copy','createdAt','updatedAt']);

export default PdpJoinScalarFieldEnumSchema;

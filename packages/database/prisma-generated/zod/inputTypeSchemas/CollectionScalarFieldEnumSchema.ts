import { z } from 'zod';

export const CollectionScalarFieldEnumSchema = z.enum(['id','name','slug','type','status','userId','copy','parentId','createdAt','updatedAt','deletedAt','deletedById']);

export default CollectionScalarFieldEnumSchema;

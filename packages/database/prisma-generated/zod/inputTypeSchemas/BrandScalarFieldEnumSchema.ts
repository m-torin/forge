import { z } from 'zod';

export const BrandScalarFieldEnumSchema = z.enum(['id','name','slug','type','status','baseUrl','copy','parentId','displayOrder','createdAt','updatedAt','deletedAt','deletedById']);

export default BrandScalarFieldEnumSchema;

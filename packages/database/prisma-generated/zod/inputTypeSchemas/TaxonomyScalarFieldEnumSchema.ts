import { z } from 'zod';

export const TaxonomyScalarFieldEnumSchema = z.enum(['id','name','slug','type','status','copy','createdAt','updatedAt','deletedAt','deletedById']);

export default TaxonomyScalarFieldEnumSchema;

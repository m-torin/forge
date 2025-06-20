import { z } from 'zod';

export const CastScalarFieldEnumSchema = z.enum(['id','name','slug','isFictional','copy','createdAt','updatedAt','deletedAt','deletedById']);

export default CastScalarFieldEnumSchema;

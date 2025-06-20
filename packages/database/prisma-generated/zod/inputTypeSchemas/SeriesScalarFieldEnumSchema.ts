import { z } from 'zod';

export const SeriesScalarFieldEnumSchema = z.enum(['id','name','slug','fandomId','displayOrder','isFictional','copy','createdAt','updatedAt','deletedAt','deletedById']);

export default SeriesScalarFieldEnumSchema;

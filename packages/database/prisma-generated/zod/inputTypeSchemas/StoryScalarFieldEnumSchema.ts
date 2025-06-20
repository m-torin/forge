import { z } from 'zod';

export const StoryScalarFieldEnumSchema = z.enum(['id','name','slug','seriesId','fandomId','displayOrder','isFictional','copy','createdAt','updatedAt','deletedAt','deletedById']);

export default StoryScalarFieldEnumSchema;

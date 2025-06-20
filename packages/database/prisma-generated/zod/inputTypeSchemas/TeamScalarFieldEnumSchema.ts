import { z } from 'zod';

export const TeamScalarFieldEnumSchema = z.enum(['id','name','description','organizationId','createdAt','updatedAt']);

export default TeamScalarFieldEnumSchema;

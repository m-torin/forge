import { z } from 'zod';

export const TeamMemberScalarFieldEnumSchema = z.enum(['id','userId','teamId','role','createdAt','updatedAt']);

export default TeamMemberScalarFieldEnumSchema;

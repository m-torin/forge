import { z } from 'zod';
import { RegistryUserRoleSchema } from '../inputTypeSchemas/RegistryUserRoleSchema';

/////////////////////////////////////////
// REGISTRY USER JOIN SCHEMA
/////////////////////////////////////////

export const RegistryUserJoinSchema = z.object({
  role: RegistryUserRoleSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  registryId: z.string(),
});

export type RegistryUserJoin = z.infer<typeof RegistryUserJoinSchema>;

export default RegistryUserJoinSchema;

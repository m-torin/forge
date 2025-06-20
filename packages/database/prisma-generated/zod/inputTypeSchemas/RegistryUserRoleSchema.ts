import { z } from 'zod';

export const RegistryUserRoleSchema = z.enum(['OWNER','EDITOR','VIEWER']);

export type RegistryUserRoleType = `${z.infer<typeof RegistryUserRoleSchema>}`

export default RegistryUserRoleSchema;

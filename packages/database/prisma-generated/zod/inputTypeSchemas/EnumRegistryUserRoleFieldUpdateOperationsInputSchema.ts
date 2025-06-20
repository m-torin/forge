import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const EnumRegistryUserRoleFieldUpdateOperationsInputSchema: z.ZodType<Prisma.EnumRegistryUserRoleFieldUpdateOperationsInput> = z.object({
  set: z.lazy(() => RegistryUserRoleSchema).optional()
}).strict();

export default EnumRegistryUserRoleFieldUpdateOperationsInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';

export const RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema: z.ZodType<Prisma.RegistryUserJoinUserIdRegistryIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  registryId: z.string()
}).strict();

export default RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema;

import type { Prisma } from '../../client';

import { z } from 'zod';

export const UserCreateexpertiseInputSchema: z.ZodType<Prisma.UserCreateexpertiseInput> = z
  .object({
    set: z.string().array(),
  })
  .strict();

export default UserCreateexpertiseInputSchema;

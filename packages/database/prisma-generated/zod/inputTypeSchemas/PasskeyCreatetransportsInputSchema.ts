import type { Prisma } from '../../client';

import { z } from 'zod';

export const PasskeyCreatetransportsInputSchema: z.ZodType<Prisma.PasskeyCreatetransportsInput> = z
  .object({
    set: z.string().array(),
  })
  .strict();

export default PasskeyCreatetransportsInputSchema;

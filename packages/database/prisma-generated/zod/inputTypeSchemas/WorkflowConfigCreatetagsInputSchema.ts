import type { Prisma } from '../../client';

import { z } from 'zod';

export const WorkflowConfigCreatetagsInputSchema: z.ZodType<Prisma.WorkflowConfigCreatetagsInput> =
  z
    .object({
      set: z.string().array(),
    })
    .strict();

export default WorkflowConfigCreatetagsInputSchema;

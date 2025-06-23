import type { Prisma } from '../../client';

import { z } from 'zod';

export const WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema: z.ZodType<Prisma.WorkflowConfigWorkflowSlugUserIdCompoundUniqueInput> =
  z
    .object({
      workflowSlug: z.string(),
      userId: z.string(),
    })
    .strict();

export default WorkflowConfigWorkflowSlugUserIdCompoundUniqueInputSchema;

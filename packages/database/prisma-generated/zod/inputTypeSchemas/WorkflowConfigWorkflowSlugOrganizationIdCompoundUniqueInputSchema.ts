import type { Prisma } from '../../client';

import { z } from 'zod';

export const WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema: z.ZodType<Prisma.WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInput> =
  z
    .object({
      workflowSlug: z.string(),
      organizationId: z.string(),
    })
    .strict();

export default WorkflowConfigWorkflowSlugOrganizationIdCompoundUniqueInputSchema;

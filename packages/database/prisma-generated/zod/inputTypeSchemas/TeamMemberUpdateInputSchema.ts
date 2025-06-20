import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutTeamMembershipsNestedInputSchema } from './UserUpdateOneRequiredWithoutTeamMembershipsNestedInputSchema';
import { TeamUpdateOneRequiredWithoutTeamMembersNestedInputSchema } from './TeamUpdateOneRequiredWithoutTeamMembersNestedInputSchema';

export const TeamMemberUpdateInputSchema: z.ZodType<Prisma.TeamMemberUpdateInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  role: z.union([ z.string(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutTeamMembershipsNestedInputSchema).optional(),
  team: z.lazy(() => TeamUpdateOneRequiredWithoutTeamMembersNestedInputSchema).optional()
}).strict();

export default TeamMemberUpdateInputSchema;

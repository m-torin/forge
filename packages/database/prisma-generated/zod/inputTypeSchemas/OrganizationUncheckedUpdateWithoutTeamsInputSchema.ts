import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema } from './MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema';
import { InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema } from './InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema';

export const OrganizationUncheckedUpdateWithoutTeamsInputSchema: z.ZodType<Prisma.OrganizationUncheckedUpdateWithoutTeamsInput> =
  z
    .object({
      id: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      name: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      slug: z.union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)]).optional(),
      logo: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      description: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      metadata: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      members: z
        .lazy(() => MemberUncheckedUpdateManyWithoutOrganizationNestedInputSchema)
        .optional(),
      invitations: z
        .lazy(() => InvitationUncheckedUpdateManyWithoutOrganizationNestedInputSchema)
        .optional(),
    })
    .strict();

export default OrganizationUncheckedUpdateWithoutTeamsInputSchema;

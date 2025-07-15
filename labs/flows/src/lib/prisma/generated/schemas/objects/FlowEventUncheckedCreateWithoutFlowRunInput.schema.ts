import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';

import type { Prisma } from '@prisma/client';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ]),
);

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.coerce.date().optional(),
    flowId: z.string(),
    id: z.number().int().optional(),
    nodeId: z.string(),
    payload: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    startedBy: StartedBySchema,
  })
  .strict();

export const FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema = Schema;

import { Prisma } from '@prisma/client';

export function isRecordObject(
  value: Prisma.JsonValue,
): value is Prisma.JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

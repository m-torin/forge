import {
  PrismaClient,
  Prisma,
  Node,
  Edge,
  Tag,
  Secret,
  Flow,
} from '@prisma/client';
import { logChange } from '../auditLog';

const _prisma = new PrismaClient();

/**
 * Represents a Flow with its related entities.
 */
export type FullFlow = Flow & {
  nodes: Node[];
  edges: Edge[];
  tags: Tag[];
  secrets: Secret[];
};

/**
 * Generic helper function to upsert related entities.
 * @param tx - The Prisma transaction client.
 * @param entities - An array of entities to upsert.
 * @param entityName - The name of the entity in Prisma Client.
 * @param createDataCallback - Callback to prepare data for creation.
 * @param updateDataCallback - Callback to prepare data for updating.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 * @param existingEntities - Existing entities in the database.
 */
export const upsertEntities = async <T extends { id: string | number }>(
  tx: Prisma.TransactionClient,
  entities: T[] = [],
  entityName: keyof Prisma.TransactionClient,
  createDataCallback: (entity: T) => any,
  updateDataCallback: (entity: T) => any,
  flowId: string,
  changedBy: string,
  existingEntities: T[] = [],
): Promise<void> => {
  const upsertPromises = entities.map(async (entity) => {
    const existingEntity = existingEntities.find((e) => e.id === entity.id);
    const data = existingEntity
      ? updateDataCallback(entity)
      : createDataCallback(entity);

    const createPayload = {
      ...data,
      flowId,
    };

    await (tx[entityName] as any).upsert({
      where: { id: entity.id },
      update: data,
      create: createPayload,
    });

    await logEntityChange(
      entityName.toString(),
      entity.id.toString(),
      flowId,
      existingEntity ? 'UPDATE' : 'CREATE',
      existingEntity || null,
      entity,
      changedBy,
    );
  });

  await Promise.all(upsertPromises);
};

/**
 * Generic helper function to handle deletions of entities.
 * @param tx - The Prisma transaction client.
 * @param existingEntities - Existing entities in the database.
 * @param incomingEntities - Incoming entities from the request.
 * @param entityName - The name of the entity in Prisma Client.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 */
export const handleDeletions = async <T extends { id: string | number }>(
  tx: Prisma.TransactionClient,
  existingEntities: T[] = [],
  incomingEntities: T[] = [],
  entityName: keyof Prisma.TransactionClient,
  flowId: string,
  changedBy: string,
): Promise<void> => {
  const incomingIds = new Set(incomingEntities.map((e) => e.id));
  const entitiesToDelete = existingEntities.filter(
    (e) => !incomingIds.has(e.id),
  );

  const deletePromises = entitiesToDelete.map(async (entity) => {
    await (tx[entityName] as any).update({
      where: { id: entity.id },
      data: { deleted: true },
    });

    await logEntityChange(
      entityName.toString(),
      entity.id.toString(),
      flowId,
      'DELETE',
      entity,
      null,
      changedBy,
    );
  });

  await Promise.all(deletePromises);
};

/**
 * Helper function to log entity changes.
 * @param entityName - The name of the entity.
 * @param entityId - The ID of the entity.
 * @param flowId - The ID of the associated flow.
 * @param action - The action performed (CREATE, UPDATE, DELETE, ASSIGN, UNASSIGN).
 * @param previousData - The previous state of the entity.
 * @param newData - The new state of the entity.
 * @param changedBy - The ID of the user making the change.
 */
export const logEntityChange = async (
  entityName: string,
  entityId: string | number,
  flowId: string,
  action: string,
  previousData: any,
  newData: any,
  changedBy: string,
): Promise<void> => {
  if (!changedBy) {
    throw new Error('changedBy is required to log entity changes.');
  }

  await logChange(
    `${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`,
    entityId.toString(),
    flowId,
    action,
    previousData,
    newData,
    changedBy,
  );
};

/**
 * Simplified error handling function that never returns (always throws).
 * @param error - The Prisma client known request error.
 * @throws Will throw an error based on the Prisma error code.
 */
export const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): Error => {
  switch (error.code) {
    case 'P2002':
      const target = (error.meta?.target as string[]) || [];
      return new Error(
        `Unique constraint failed on the fields: ${target.join(', ')}`,
      );
    case 'P2025':
      return new Error('Record to update not found.');
    default:
      return new Error(`Prisma error: ${error.message}`);
  }
};

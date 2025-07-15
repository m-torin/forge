import { prisma, AuditLog } from '#/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * Fetches an audit log by its unique identifier.
 * @param {string} auditLogId - The unique identifier of the audit log.
 * @returns {Promise<AuditLog | null>} - A promise that resolves to the audit log or null if not found.
 */
export const getAuditLogById = async (
  auditLogId: string,
): Promise<AuditLog | null> => {
  return await prisma.auditLog.findUnique({
    where: { id: auditLogId },
  });
};

/**
 * Fetches all audit logs for a given user ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<AuditLog[] | null>} - A promise that resolves to the list of audit logs or null if not found.
 */
export const getAuditLogsByUserId = async (
  userId: string,
): Promise<AuditLog[] | null> => {
  return await prisma.auditLog.findMany({
    where: { userId },
  });
};

/**
 * Creates a new audit log in the database.
 * @param {Prisma.AuditLogCreateInput} data - The data for creating the audit log.
 * @returns {Promise<AuditLog>} - A promise that resolves to the created audit log.
 */
export const createAuditLog = async (
  data: Prisma.AuditLogCreateInput,
): Promise<AuditLog> => {
  return await prisma.auditLog.create({
    data,
  });
};

/**
 * Fetches all audit logs for a given Flow ID.
 * @param {string} flowId - The ID of the flow.
 * @returns {Promise<AuditLog[] | null>} - A promise that resolves to the list of audit logs or null if not found.
 */
export const getAuditLogsByFlowId = async (
  flowId: string,
): Promise<AuditLog[] | null> => {
  return await prisma.auditLog.findMany({
    where: { flowId },
  });
};

/**
 * Deletes an audit log by its unique identifier.
 * @param {string} auditLogId - The unique identifier of the audit log.
 * @returns {Promise<AuditLog | null>} - A promise that resolves to the deleted audit log or null if not found.
 */
export const deleteAuditLog = async (
  auditLogId: string,
): Promise<AuditLog | null> => {
  return await prisma.auditLog.delete({
    where: { id: auditLogId },
  });
};

/**
 * Updates an existing audit log in the database.
 * @param {string} auditLogId - The unique identifier of the audit log.
 * @param {Prisma.AuditLogUpdateInput} data - The data for updating the audit log.
 * @returns {Promise<AuditLog | null>} - A promise that resolves to the updated audit log or null if not found.
 */
export const updateAuditLog = async (
  auditLogId: string,
  data: Prisma.AuditLogUpdateInput,
): Promise<AuditLog | null> => {
  return await prisma.auditLog
    .update({
      where: { id: auditLogId },
      data,
    })
    .catch(() => null);
};

/**
 * Logs changes to the AuditLog table.
 * @param {string} entityType - Type of the entity (Flow, Node, Edge, Tag, Secret).
 * @param {string} entityId - ID of the entity.
 * @param {string} flowId - ID of the associated Flow.
 * @param {string} changeType - Type of change (CREATE, UPDATE, DELETE, ASSIGN, UNASSIGN).
 * @param {object|null} before - State before change.
 * @param {object|null} after - State after change.
 * @param {string} changedBy - User ID who made the change.
 */
export async function logChange(
  entityType: string,
  entityId: string,
  flowId: string,
  changeType: string,
  before: object | null,
  after: object | null,
  changedBy: string,
) {
  if (!changedBy) {
    throw new Error('changedBy is required to log changes.');
  }

  await prisma.auditLog.create({
    data: {
      entityType,
      entityId,
      flowId,
      changeType,
      before: before ? JSON.stringify(before) : Prisma.JsonNull,
      after: after ? JSON.stringify(after) : Prisma.JsonNull,
      userId: changedBy,
      timestamp: new Date(),
    },
  });
}

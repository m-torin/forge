import { Prisma, Secret } from '@prisma/client';
import { logEntityChange } from './helpers';

/**
 * Generic helper function to upsert related Secrets.
 * @param tx - The Prisma transaction client.
 * @param secrets - An array of secrets to upsert.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 * @param existingSecrets - Existing secrets in the database.
 */
export const upsertSecrets = async (
  tx: Prisma.TransactionClient,
  secrets: Secret[] = [],
  flowId: string,
  changedBy: string,
  existingSecrets: Secret[] = [],
): Promise<void> => {
  const upsertPromises = secrets.map(async (secret) => {
    const existingSecret = existingSecrets.find((e) => e.id === secret.id);
    const data = existingSecret ? secret : { ...secret, flowId };

    const createPayload = {
      ...data,
      flowId,
      metadata: data.metadata ?? Prisma.DbNull, // Handle metadata appropriately
    };

    await tx.secret.upsert({
      where: { id: secret.id },
      update: {
        ...data,
        metadata: data.metadata ?? Prisma.DbNull, // Handle metadata appropriately
      },
      create: createPayload,
    });

    await logEntityChange(
      'Secret',
      secret.id.toString(),
      flowId,
      existingSecret ? 'UPDATE' : 'CREATE',
      existingSecret || null,
      secret,
      changedBy,
    );
  });

  await Promise.all(upsertPromises);
};

/**
 * Generic helper function to handle deletions of Secrets.
 * @param tx - The Prisma transaction client.
 * @param existingSecrets - Existing secrets in the database.
 * @param incomingSecrets - Incoming secrets from the request.
 * @param flowId - The ID of the associated flow.
 * @param changedBy - The ID of the user making the change.
 */
export const handleSecretDeletions = async (
  tx: Prisma.TransactionClient,
  existingSecrets: Secret[] = [],
  incomingSecrets: Secret[] = [],
  flowId: string,
  changedBy: string,
): Promise<void> => {
  const incomingIds = new Set(incomingSecrets.map((e) => e.id));
  const entitiesToDelete = existingSecrets.filter(
    (e) => !incomingIds.has(e.id),
  );

  const deletePromises = entitiesToDelete.map(async (secret) => {
    await tx.secret.update({
      where: { id: secret.id },
      data: { deleted: true },
    });

    await logEntityChange(
      'Secret',
      secret.id.toString(),
      flowId,
      'DELETE',
      secret,
      null,
      changedBy,
    );
  });

  await Promise.all(deletePromises);
};

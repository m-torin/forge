// secret.ts

import { encrypt, decrypt } from '#/lib/encryption';
import { prisma, Secret, SecretCategory } from '#/lib/prisma';
import { Prisma } from '@prisma/client';
import { logError } from '@repo/observability';

/**
 * Fetches all secrets by category.
 * @param {SecretCategory} category - The category of the secrets.
 * @returns {Promise<Secret[] | null>} - List of secrets or null.
 */
export const getSecretsByCategory = async (
  category: SecretCategory,
): Promise<Secret[] | null> => {
  try {
    const secrets = await prisma.secret.findMany({
      where: { category },
    });

    const decryptedSecrets = await Promise.all(
      secrets.map(async (secret: Secret) => ({
        ...secret,
        secret: secret.shouldEncrypt
          ? await decrypt(secret.secret)
          : secret.secret,
      })),
    );

    return decryptedSecrets;
  } catch (error) {
    logError('Error fetching secrets by category', { error, category });
    return null;
  }
};

/**
 * Fetches a secret by its unique identifier.
 * @param {number} secretId - The unique identifier of the secret.
 * @returns {Promise<Secret | null>} - The secret or null if not found.
 */
export const getSecretById = async (
  secretId: number,
): Promise<Secret | null> => {
  try {
    return await prisma.secret.findUnique({
      where: { id: secretId },
    });
  } catch (error) {
    logError(`Error fetching secret with ID ${secretId}`, { error, secretId });
    return null;
  }
};

/**
 * Creates a new secret in the database.
 * @param {Prisma.SecretCreateInput} data - The data for creating the secret.
 * @returns {Promise<Secret | null>} - The created secret or null if creation fails.
 */
export const createSecret = async (
  data: Prisma.SecretCreateInput,
): Promise<Secret | null> => {
  try {
    const { secret, shouldEncrypt } = data;
    const processedSecret = shouldEncrypt ? await encrypt(secret) : secret;

    return await prisma.secret.create({
      data: {
        ...data,
        secret: processedSecret,
      },
    });
  } catch (error) {
    logError('Error creating secret', { error });
    return null;
  }
};

/**
 * Fetches all secrets for a given Flow ID.
 * @param {string} flowId - The ID of the flow.
 * @returns {Promise<Secret[] | null>} - The list of secrets or null if an error occurs.
 */
export const getSecretsByFlowId = async (
  flowId: string,
): Promise<Secret[] | null> => {
  try {
    const secrets = await prisma.secret.findMany({
      where: { flowId },
    });

    const decryptedSecrets = await Promise.all(
      secrets.map(async (secret) => ({
        ...secret,
        secret: secret.shouldEncrypt
          ? await decrypt(secret.secret)
          : secret.secret,
      })),
    );

    return decryptedSecrets;
  } catch (error) {
    logError(`Error fetching secrets by flow ID ${flowId}`, { error, flowId });
    return null;
  }
};

/**
 * Fetches all secrets for a given Node ID.
 * @param {string} nodeId - The ID of the node.
 * @returns {Promise<Secret[] | null>} - The list of secrets or null if an error occurs.
 */
export const getSecretsByNodeId = async (
  nodeId: string,
): Promise<Secret[] | null> => {
  try {
    const secrets = await prisma.secret.findMany({
      where: { nodeId },
    });

    const decryptedSecrets = await Promise.all(
      secrets.map(async (secret) => ({
        ...secret,
        secret: secret.shouldEncrypt
          ? await decrypt(secret.secret)
          : secret.secret,
      })),
    );

    return decryptedSecrets;
  } catch (error) {
    logError(`Error fetching secrets by node ID ${nodeId}`, { error, nodeId });
    return null;
  }
};

/**
 * Deletes a secret by its unique identifier.
 * @param {number} secretId - The unique identifier of the secret.
 * @returns {Promise<Secret | null>} - The deleted secret or null if deletion fails.
 */
export const deleteSecret = async (
  secretId: number,
): Promise<Secret | null> => {
  try {
    return await prisma.secret.delete({
      where: { id: secretId },
    });
  } catch (error) {
    logError(`Error deleting secret with ID ${secretId}`, { error, secretId });
    return null;
  }
};

/**
 * Updates an existing secret in the database.
 * @param {number} secretId - The unique identifier of the secret.
 * @param {Prisma.SecretUpdateInput} data - The data for updating the secret.
 * @returns {Promise<Secret | null>} - The updated secret or null if update fails.
 */
export const updateSecret = async (
  secretId: number,
  data: Prisma.SecretUpdateInput,
): Promise<Secret | null> => {
  try {
    const { secret, shouldEncrypt } = data;

    let processedData: Prisma.SecretUpdateInput = { ...data };

    if (secret !== undefined && shouldEncrypt) {
      processedData.secret = await encrypt(secret as string);
    }

    return await prisma.secret.update({
      where: { id: secretId },
      data: processedData,
    });
  } catch (error) {
    logError(`Error updating secret with ID ${secretId}`, { error, secretId });
    return null;
  }
};

/**
 * Fetches all relevant secrets for a given context (global + node/flow specific)
 * @param {Object} params - The parameters for fetching secrets
 * @param {string} [params.nodeId] - Optional node ID to fetch node-specific secrets
 * @param {string} [params.flowId] - Optional flow ID to fetch flow-specific secrets
 * @returns {Promise<Secret[] | null>} - Array of decrypted secrets or null if error occurs
 */
export const getAllRelevantSecrets = async (params: {
  nodeId?: string;
  flowId?: string;
}): Promise<Secret[] | null> => {
  try {
    const { nodeId, flowId } = params;
    const secrets = await prisma.secret.findMany({
      where: {
        OR: [
          { category: SecretCategory.global },
          ...(nodeId ? [{ nodeId, category: SecretCategory.node }] : []),
          ...(flowId ? [{ flowId, category: SecretCategory.flow }] : []),
        ],
        deleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const decryptedSecrets = await Promise.all(
      secrets.map(async (secret) => ({
        ...secret,
        secret: secret.shouldEncrypt
          ? await decrypt(secret.secret)
          : secret.secret,
      })),
    );

    return decryptedSecrets;
  } catch (error) {
    logError('Error fetching relevant secrets', { error });
    return null;
  }
};

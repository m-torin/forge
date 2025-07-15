'use server';

import { Prisma } from '@prisma/client';
import { Secret, SecretCategory } from '#/lib/prisma';
import {
  getSecretById,
  createSecret,
  getSecretsByCategory,
  getSecretsByFlowId,
  getSecretsByNodeId,
  deleteSecret,
  updateSecret,
  getAllRelevantSecrets,
} from '#/lib/prisma/ormApi';
import { logError } from '@repo/observability';

/**
 * Fetches a secret by its unique identifier.
 * @param {number} secretId - The unique identifier of the secret.
 * @returns {Promise<Secret | null>} - A promise that resolves to the secret or null if not found.
 */
export const readSecretAction = async (
  secretId: number,
): Promise<Secret | null> => {
  try {
    return await getSecretById(secretId);
  } catch (error) {
    logError('Error in readSecretAction', { error });
    return null;
  }
};

/**
 * Creates a new secret.
 * @param {Prisma.SecretCreateInput} data - The data for creating the secret.
 * @returns {Promise<Secret | null>} - A promise that resolves to the created secret or null if the creation failed.
 */
export const createSecretAction = async (
  data: Prisma.SecretCreateInput,
): Promise<Secret | null> => {
  try {
    return await createSecret(data);
  } catch (error) {
    logError('Error in createSecretAction', { error });
    return null;
  }
};

/**
 * Fetches all secrets by category.
 * @param {SecretCategory} category - The category of the secrets (GLOBAL, FLOW, NODE).
 * @returns {Promise<Secret[] | null>} - A promise that resolves to the list of secrets or null if not found.
 */
export const getSecretsByCategoryAction = async (
  category: SecretCategory,
): Promise<Secret[] | null> => {
  try {
    return await getSecretsByCategory(category);
  } catch (error) {
    logError('Error in getSecretsByCategoryAction', { error });
    return null;
  }
};

/**
 * Fetches all secrets for a given Flow ID.
 * @param {string} flowId - The ID of the flow.
 * @returns {Promise<Secret[] | null>} - A promise that resolves to the list of secrets or null if not found.
 */
export const getSecretsByFlowIdAction = async (
  flowId: string,
): Promise<Secret[] | null> => {
  try {
    return await getSecretsByFlowId(flowId);
  } catch (error) {
    logError('Error in getSecretsByFlowIdAction', { error });
    return null;
  }
};

/**
 * Fetches all secrets for a given Node ID.
 * @param {string} nodeId - The ID of the node.
 * @returns {Promise<Secret[] | null>} - A promise that resolves to the list of secrets or null if not found.
 */
export const getSecretsByNodeIdAction = async (
  nodeId: string,
): Promise<Secret[] | null> => {
  try {
    return await getSecretsByNodeId(nodeId);
  } catch (error) {
    logError('Error in getSecretsByNodeIdAction', { error });
    return null;
  }
};

/**
 * Deletes a secret by its unique identifier.
 * @param {number} secretId - The unique identifier of the secret.
 * @returns {Promise<Secret | null>} - A promise that resolves to the deleted secret or null if not found.
 */
export const deleteSecretAction = async (
  secretId: number,
): Promise<Secret | null> => {
  try {
    return await deleteSecret(secretId);
  } catch (error) {
    logError('Error in deleteSecretAction', { error });
    return null;
  }
};

/**
 * Updates an existing secret.
 * @param {number} secretId - The unique identifier of the secret.
 * @param {Prisma.SecretUpdateInput} data - The data for updating the secret.
 * @returns {Promise<Secret | null>} - A promise that resolves to the updated secret or null if the update failed.
 */
export const updateSecretAction = async (
  secretId: number,
  data: Prisma.SecretUpdateInput,
): Promise<Secret | null> => {
  try {
    return await updateSecret(secretId, data);
  } catch (error) {
    logError('Error in updateSecretAction', { error });
    return null;
  }
};

/**
 * Server action to fetch all relevant secrets (global + node/flow specific)
 * @param {Object} params - The parameters for fetching secrets
 * @param {string} [params.nodeId] - Optional node ID to fetch node-specific secrets
 * @param {string} [params.flowId] - Optional flow ID to fetch flow-specific secrets
 * @returns {Promise<Secret[] | null>} - Array of decrypted secrets or null if error occurs
 */
export const getAllRelevantSecretsAction = async (params: {
  nodeId?: string;
  flowId?: string;
}): Promise<Secret[] | null> => {
  try {
    return await getAllRelevantSecrets(params);
  } catch (error) {
    logError('Error in getAllRelevantSecretsAction', { error });
    return null;
  }
};

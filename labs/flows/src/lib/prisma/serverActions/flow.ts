'use server';

import {
  createFlow,
  getFlow,
  getFlows,
} from '#/lib/prisma/ormApi';
import {
  FlowValues,
  Flow as PrismaFlow,
} from '#/lib/prisma';
import { DbData } from '#/app/flow/[cuid]/types';
import { logInfo, logError, logDebug } from '@repo/observability';

/**
 * Gets a single flow by its unique identifier and instance ID along with secrets and tags.
 * @param {string} flowId - The unique identifier of the flow.
 * @param {string} instanceId - The instance identifier of the flow.
 * @returns {Promise<{ flow: PrismaFlow | null, secrets: Secret[], tags: Tag[] } | null>}
 */
export const getFlowAction = async (
  flowId: string,
  instanceId: string,
): Promise<DbData | null> => {
  try {
    logInfo('Fetching flow with', { flowId, instanceId });

    const flow = await getFlow(flowId, instanceId);
    logDebug('Retrieved raw flow data', { flowId, instanceId, hasFlow: !!flow });

    if (!flow) return null;

    const dbData: DbData = {
      flow,
      tags: flow.tags ?? [],
      secrets: flow.secrets ?? [],
    };

    logDebug('Transformed DbData for client', {
      flowId: dbData.flow.id,
      tagsCount: dbData.tags.length,
      secretsCount: dbData.secrets.length
    });
    return dbData;
  } catch (error) {
    logError('getFlowAction error', { error });
    return null;
  }
};

/**
 * Gets all flows for a specific instance.
 * @param {string} instanceId - The instance identifier.
 * @returns {Promise<Flow[]>} - A promise that resolves to an array of flows.
 */
export const getFlowsAction = async (instanceId: string): Promise<PrismaFlow[]> => {
  logInfo('getFlowsAction', { instanceId });
  try {
    return await getFlows(instanceId);
  } catch (error) {
    logError('Failed to fetch flows', { error });
    // Return empty array for graceful degradation during build
    return [];
  }
};

/**
 * Gets a single flow by its unique identifier with instance validation.
 * @param {string} flowId - The unique identifier of the flow.
 * @param {string} instanceId - The instance ID for validation (optional, uses user's instance if not provided).
 * @returns {Promise<DbData | null>}
 */
export const getFlowByIdAction = async (
  flowId: string,
  instanceId?: string,
): Promise<DbData | null> => {
  try {
    logInfo('Fetching flow by id', { flowId, instanceId });

    // If no instanceId provided, get the user's instance
    let validatedInstanceId: string;
    if (instanceId) {
      validatedInstanceId = instanceId;
    } else {
      const { getUserInstanceId } = await import('./defaultInstance');
      validatedInstanceId = await getUserInstanceId();
    }

    // Use the secure getFlow method that validates instanceId
    const flow = await getFlow(flowId, validatedInstanceId);

    if (!flow) return null;

    const dbData: DbData = {
      flow,
      tags: flow.tags ?? [],
      secrets: flow.secrets ?? [],
    };

    return dbData;
  } catch (error) {
    logError('getFlowByIdAction error', { error });
    return null;
  }
};


/**
 * Creates a new flow with the provided values.
 * @param {FlowValues} values - The values needed to create the flow.
 * @returns {Promise<ReturnType<typeof createFlow>>} - A promise that resolves to the newly created flow.
 */
export const createFlowAction = async (
  values: FlowValues,
): Promise<ReturnType<typeof createFlow>> => {
  logInfo('createFlowAction', { values });
  return await createFlow(
    values.instanceId,
    values.flowName,
    values.flowMethod,
    values.authorId,
    [],
  );
};

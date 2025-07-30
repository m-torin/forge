import { useCallback } from 'react';
import { useReactFlow, ReactFlowInstance } from '@xyflow/react';
import { useCallbackRef } from '@mantine/hooks';
import { logError } from '@repo/observability';
import { isDemoModeClient } from '#/lib/demoMode';
import type { ReactFlowJsonObject } from '@xyflow/react';
import type { FbNode, FbEdge, FlowUpdate } from '../types';
import { useAppContext } from '@/app/flow/[cuid]/FlowProvider';
import { FlowMethodSchema } from '#/lib/prisma/generated/zod';
import { FlowCreateUpdateData, upsertFlowAction } from './action';
import {
  transformNodeForValidation,
  transformEdgeForValidation,
} from './transformations';
import {
  sanitizeFlowData,
  sanitizeJsonValue,
  safeClone,
} from './serializationUtils';

import { NodeTypesEnum } from '../nodes';
import { convertToPrismaEdgeType, convertToPrismaNodeType } from './typeUtils';

/**
 * Custom hook for saving the flow state
 */
export const useSaveFlow = () => {
  const { toObject, getNodes, getEdges }: ReactFlowInstance<FbNode, FbEdge> =
    useReactFlow<FbNode, FbEdge>();

  const { cuid: flowId, instanceId, prismaData } = useAppContext();

  const serializeFlow = useCallbackRef(
    (flow: ReactFlowJsonObject<FbNode, FbEdge>) => {
      const sanitized = sanitizeFlowData({
        nodes: flow.nodes as FbNode[],
        edges: flow.edges as FbEdge[],
        viewport: flow.viewport,
      });
      return safeClone(sanitized);
    },
  );

  return useCallback(
    async (updatedFlowData?: FlowUpdate) => {
      if (!flowId || !instanceId) {
        throw new Error('Flow ID and Instance ID are required');
      }

      try {
        const flow = toObject();
        const serializedFlow = serializeFlow(flow);

        if (typeof window !== 'undefined') {
          const localStorageData = {
            ...serializedFlow,
            flowData: updatedFlowData
              ? serializeFlow({
                  nodes: [],
                  edges: [],
                  viewport: updatedFlowData.viewport || null,
                } as ReactFlowJsonObject<FbNode, FbEdge>)
              : null,
          };
          localStorage.setItem(flowId, JSON.stringify(localStorageData));
        }

        const cleanFlowData = updatedFlowData
          ? {
              name: updatedFlowData.name,
              method: updatedFlowData.method,
              isEnabled: updatedFlowData.isEnabled,
              metadata: sanitizeJsonValue(updatedFlowData.metadata),
            }
          : null;

        const currentNodes = getNodes();
        const currentEdges = getEdges();

        // Transform nodes with proper typing
        const transformedNodes = currentNodes.map((node) => {
          const nodeForValidation = transformNodeForValidation(node, flowId);
          return {
            where: { id: node.id },
            create: {
              type: convertToPrismaNodeType(node.type || NodeTypesEnum.Default),
              name: nodeForValidation.name,
              rfId: nodeForValidation.rfId,
              metadata: nodeForValidation.metadata,
              position: nodeForValidation.position,
              createdAt: nodeForValidation.createdAt,
              updatedAt: nodeForValidation.updatedAt,
              deleted: nodeForValidation.deleted,
              arn: nodeForValidation.arn,
              infrastructureId: nodeForValidation.infrastructureId,
            },
            update: {
              metadata: sanitizeJsonValue(node.data?.metadata),
              position: sanitizeJsonValue(node.position),
              name: node.data?.name ?? null,
            },
          };
        });

        // Transform edges with proper typing
        const transformedEdges = currentEdges.map((edge) => ({
          where: { id: edge.id },
          create: {
            ...transformEdgeForValidation(edge, flowId),
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            // Convert to PrismaEdgeType
            type: convertToPrismaEdgeType(edge.type),
            metadata: sanitizeJsonValue(edge.data?.metadata),
          },
          update: {
            metadata: sanitizeJsonValue(edge.data?.metadata),
          },
        }));

        const transformedFlow: FlowCreateUpdateData = {
          id: flowId,
          instanceId,
          name: cleanFlowData?.name ?? prismaData?.flow?.name ?? '',
          method: FlowMethodSchema.parse(
            cleanFlowData?.method ?? prismaData?.flow?.method ?? 'observable',
          ),
          isEnabled:
            cleanFlowData?.isEnabled ?? prismaData?.flow?.isEnabled ?? false,
          metadata: sanitizeJsonValue(cleanFlowData?.metadata),
          viewport: sanitizeJsonValue(serializedFlow.viewport),
          nodes: {
            upsert: transformedNodes,
            delete:
              prismaData?.flow?.nodes
                ?.filter(Boolean)
                .filter((node: any) => !currentNodes.some((n) => n.id === node.id))
                .map((node: any) => ({ id: node.id })) ?? [],
          },
          edges: {
            upsert: transformedEdges,
            delete:
              prismaData?.flow?.edges
                ?.filter(Boolean)
                .filter((edge: any) => !currentEdges.some((e) => e.id === edge.id))
                .map((edge: any) => ({ id: edge.id })) ?? [],
          },
        };

        const result = await upsertFlowAction(transformedFlow);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        // In demo mode, suppress error logging to avoid console noise
        if (!isDemoModeClient()) {
          logError('Error in useSaveFlow', { error });
        }
        return {
          success: false,
          error: {
            code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'An unknown error occurred',
            details: error,
          },
        };
      }
    },
    [
      flowId,
      instanceId,
      toObject,
      getNodes,
      getEdges,
      prismaData,
      serializeFlow,
    ],
  );
};

import { Edge, Node, Prisma, Secret, Tag } from '@prisma/client';
import { prisma } from '#/lib/prisma';
import {
  deduplicateNodes,
  deduplicateEdges,
  deduplicateTags,
  deduplicateSecrets,
} from '../helpers/deduplicate';
import {
  upsertNodes,
  handleNodeDeletions,
  upsertEdges,
  handleEdgeDeletions,
  upsertTags,
  upsertSecrets,
  handleSecretDeletions,
  FullFlow,
  logEntityChange,
  handlePrismaError,
} from './flowUtils';
import { FlowWithRelations } from './types';
import { logInfo, logError } from '@repo/observability';

/**
 * Upserts a Flow along with its related Nodes, Edges, Tags, and Secrets.
 * @param flow - The flow data including related entities.
 * @param changedBy - The ID of the user making the change.
 * @returns {Promise<FullFlow>} - The upserted Flow object with all relations.
 */
export const upsertFlowWithNodesAndEdges = async (
  flow: FlowWithRelations,
  changedBy: string = '1', // Default to userId 1 if not provided
): Promise<FullFlow> => {
  // Flatten formData if present
  const flattenFormData = (items: any[]) =>
    items.map(({ formData, ...item }) => ({
      ...item,
      ...(formData || {}),
    }));

  const processedNodes = flattenFormData(flow.nodes as Node[]);
  const processedEdges = flattenFormData(flow.edges as Edge[]);
  const processedTags = flattenFormData(flow.tags as Tag[]);
  const processedSecrets = flattenFormData(flow.secrets as Secret[]);

  logInfo('Processed Data', {
    nodes: processedNodes,
    edges: processedEdges,
    tags: processedTags,
    secrets: processedSecrets,
  });

  // Deduplicate entities to avoid duplicates
  const deduplicatedNodes = deduplicateNodes(processedNodes) || [];
  const deduplicatedEdges = deduplicateEdges(processedEdges) || [];
  const deduplicatedTags = deduplicateTags(processedTags) || [];
  const deduplicatedSecrets = deduplicateSecrets(processedSecrets) || [];

  logInfo('Deduplicated Data', {
    nodes: deduplicatedNodes,
    edges: deduplicatedEdges,
    tags: deduplicatedTags,
    secrets: deduplicatedSecrets,
  });

  try {
    const finalUpdatedFlow: FullFlow = await prisma.$transaction(
      async (tx: Prisma.TransactionClient): Promise<FullFlow> => {
        // Check if the flow already exists
        const existingFlow = await tx.flow.findUnique({
          where: { id: flow.id },
          include: {
            nodes: true,
            edges: true,
            tags: true,
            secrets: true,
          },
        });

        // Prepare the data payload for the flow
        const flowPayload = {
          name: flow.name,
          method: flow.method,
          isEnabled: flow.isEnabled,
          instanceId: flow.instanceId,
          viewport: flow.viewport ?? Prisma.JsonNull,
          metadata: flow.metadata ?? Prisma.JsonNull,
          deleted: false,
        };

        let updatedFlow: FullFlow;

        if (existingFlow) {
          // Update existing Flow
          updatedFlow = (await tx.flow.update({
            where: { id: flow.id },
            data: flowPayload,
            include: { nodes: true, edges: true, tags: true, secrets: true },
          })) as FullFlow;

          // Log the update action
          await logEntityChange(
            'Flow',
            updatedFlow.id,
            updatedFlow.id,
            'UPDATE',
            existingFlow,
            updatedFlow,
            changedBy,
          );
        } else {
          // Create new Flow
          updatedFlow = (await tx.flow.create({
            data: {
              ...flowPayload,
              id: flow.id, // Ensure the ID is set
              nodes: {
                create: deduplicatedNodes.map((node) => ({
                  ...node,
                  flowId: flow.id,
                  metadata: node.metadata ?? Prisma.JsonNull,
                  position: node.position ?? Prisma.JsonNull,
                  deleted: false,
                })),
              },
              edges: {
                create: deduplicatedEdges.map((edge) => ({
                  ...edge,
                  flowId: flow.id,
                  metadata: edge.metadata ?? Prisma.JsonNull,
                  deleted: false,
                })),
              },
              secrets: {
                create: deduplicatedSecrets.map((secret) => ({
                  ...secret,
                  flowId: flow.id,
                  metadata: secret.metadata ?? Prisma.JsonNull,
                  deleted: false,
                })),
              },
              // Tags will be handled separately
            },
            include: { nodes: true, edges: true, tags: true, secrets: true },
          })) as FullFlow;

          // Log the creation action
          await logEntityChange(
            'Flow',
            updatedFlow.id,
            updatedFlow.id,
            'CREATE',
            null,
            updatedFlow,
            changedBy,
          );

          // Log changes for newly created entities
          await Promise.all([
            ...deduplicatedNodes.map((node) =>
              logEntityChange(
                'Node',
                node.id,
                updatedFlow.id,
                'CREATE',
                null,
                node,
                changedBy,
              ),
            ),
            ...deduplicatedEdges.map((edge) =>
              logEntityChange(
                'Edge',
                edge.id,
                updatedFlow.id,
                'CREATE',
                null,
                edge,
                changedBy,
              ),
            ),
            ...deduplicatedSecrets.map((secret) =>
              logEntityChange(
                'Secret',
                secret.id.toString(),
                updatedFlow.id,
                'CREATE',
                null,
                secret,
                changedBy,
              ),
            ),
            ...deduplicatedTags.map((tag) =>
              logEntityChange(
                'Tag',
                tag.id,
                updatedFlow.id,
                'CREATE',
                null,
                tag,
                changedBy,
              ),
            ),
          ]);
        }

        // Upsert related entities
        await upsertNodes(
          tx,
          deduplicatedNodes,
          updatedFlow.id,
          changedBy,
          existingFlow?.nodes,
        );

        await upsertEdges(
          tx,
          deduplicatedEdges,
          updatedFlow.id,
          changedBy,
          existingFlow?.edges,
        );

        await upsertSecrets(
          tx,
          deduplicatedSecrets,
          updatedFlow.id,
          changedBy,
          existingFlow?.secrets,
        );

        await upsertTags(
          tx,
          deduplicatedTags,
          updatedFlow.id,
          changedBy,
          existingFlow?.tags,
        );

        // Handle deletions for Nodes, Edges, and Secrets
        await handleNodeDeletions(
          tx,
          existingFlow?.nodes || [],
          deduplicatedNodes,
          updatedFlow.id,
          changedBy,
        );

        await handleEdgeDeletions(
          tx,
          existingFlow?.edges || [],
          deduplicatedEdges,
          updatedFlow.id,
          changedBy,
        );

        await handleSecretDeletions(
          tx,
          existingFlow?.secrets || [],
          deduplicatedSecrets,
          updatedFlow.id,
          changedBy,
        );

        return updatedFlow;
      },
    );

    // Log the final result
    logInfo('Final Upserted Flow', { finalUpdatedFlow });

    return finalUpdatedFlow;
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw handlePrismaError(error);
    } else {
      logError('Unexpected error during upsertFlow', { error });
      throw new Error('An unexpected error occurred while upserting the flow.');
    }
  }
};

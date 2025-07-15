// typeUtils.ts
import {
  NodeType as PrismaNodeType,
  EdgeType as PrismaEdgeType,
} from '@prisma/client';
import { logWarn } from '@repo/observability';
import { NodeTypesEnum, NodeTypes } from '../nodes';

/**
 * Type guard to check if a value is a valid NodeTypes
 */
export const isNodeTypes = (type: unknown): type is NodeTypes => {
  return (
    typeof type === 'string' &&
    Object.values(NodeTypesEnum).includes(type as NodeTypes)
  );
};

/**
 * Convert any node type to NodeTypesEnum (our source of truth)
 */
export const convertToNodeTypesEnum = (
  type: NodeTypes | PrismaNodeType | undefined,
): NodeTypes => {
  if (!type) return NodeTypesEnum.Default;

  if (isNodeTypes(type)) return type;

  const enumValue = Object.values(NodeTypesEnum).find((enumType) => {
    return (
      (enumType as string).toLowerCase() === (type as string).toLowerCase()
    );
  });

  if (enumValue) return enumValue;

  logWarn('Unknown node type, defaulting to NodeTypesEnum.Default', {
    unknownType: type,
    defaultType: NodeTypesEnum.Default
  });

  return NodeTypesEnum.Default;
};

/**
 * Convert NodeTypesEnum to PrismaNodeType
 * Since NodeTypesEnum is the source of truth, we cast it as PrismaNodeType
 */
export const convertToPrismaNodeType = (
  type: NodeTypes | PrismaNodeType | undefined,
): PrismaNodeType => {
  if (!type) return 'default';
  return type as PrismaNodeType;
};

/**
 * Type guard to check if a value is a valid PrismaEdgeType
 */
export const isPrismaEdgeType = (type: unknown): type is PrismaEdgeType => {
  return (
    typeof type === 'string' &&
    Object.values(PrismaEdgeType).includes(type as PrismaEdgeType)
  );
};

/**
 * Convert to PrismaEdgeType with validation
 */
export const convertToPrismaEdgeType = (
  type: string | undefined,
): PrismaEdgeType => {
  if (!type || !isPrismaEdgeType(type)) return 'default';
  return type;
};

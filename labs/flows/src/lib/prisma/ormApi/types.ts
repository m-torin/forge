import {
  Node,
  Edge,
  FlowMethod,
  Prisma,
  Tag,
  Secret,
} from '@prisma/client';

/**
 * Represents a Flow along with its related entities.
 */
export type FlowWithRelations = {
  id: string;
  instanceId: string;
  name: string;
  method: FlowMethod;
  isEnabled: boolean;
  viewport?: Prisma.JsonValue;
  metadata?: Prisma.JsonValue;
  nodes?: Node[];
  edges?: Edge[];
  tags?: Tag[];
  secrets?: Secret[];
};
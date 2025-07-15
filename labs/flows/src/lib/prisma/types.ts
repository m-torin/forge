import {
  Edge,
  Flow,
  FlowMethod,
  Instance,
  Tag,
  TestCase,
  User,
} from '@prisma/client';
import { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react';

export interface FlowValues {
  instanceId: string;
  flowName: string;
  flowMethod: FlowMethod;
  authorId: string;
}

export type FlowData = {
  flowId: string;
  instanceId: string;
  name: string;
  method: FlowMethod;
  flowData?: any;
  authorId: string;
  tagsIds?: string[];
  nodesData?: FlowNode[];
  edgesData?: FlowEdge[];
};

export type PrismaFlow = Omit<
  Flow,
  'edges' | 'nodes' | 'tags' | 'author' | 'instance' | 'testCases'
> & {
  edges: Edge[];
  nodes: Node[];
  tags: Tag[];
  author: User;
  instance: Instance;
  testCases: TestCase[];
};

// types.ts
import {
  Edge,
  Flow,
  Node,
  Secret,
  Tag,
  FlowMethod,
  SecretCategory,
} from '#/lib/prisma';
import { UseFormReturnType } from '@mantine/form';
import { ReactNode, MutableRefObject } from 'react';
import { Viewport } from '@xyflow/react';
import { Prisma } from '@prisma/client';

// Type for form-specific secret structure
export type FormSecret = {
  name: string;
  category: SecretCategory;
  secret: string;
};

// Raw flow data type matching Prisma schema
export type FlowData = {
  flow: Flow | null;
  flowData: {
    nodes: Node[];
    edges: Edge[];
    viewport: Prisma.JsonValue | null;
  };
  tags: Tag[];
  secrets: Secret[];
};

// Flow with relations using Prisma's exact types
export type FlowWithRelations = Prisma.FlowGetPayload<{
  select: {
    id: true;
    name: true;
    method: true;
    instanceId: true;
    isEnabled: true;
    metadata: true;
    nodes: true;
    edges: true;
    tags: true;
    secrets: true;
    createdAt: true;
    updatedAt: true;
  };
}> & {
  viewport: Prisma.JsonValue | null;
};

/**
 * Represents the complete database data structure using Prisma types
 */
export interface DbData {
  flow: FlowWithRelations;
  tags: Tag[];
  secrets: Secret[];
}

/**
 * Form values interface using Prisma's generated types
 */
export interface FlowProviderFormValues {
  name: Flow['name'];
  method: FlowMethod;
  tags: Tag['id'][];
  secrets: FormSecret[];
}

/**
 * AppContext props with Prisma types
 */
export interface AppContextProps {
  cuid: Flow['id'];
  instanceId: Flow['instanceId'];
  prismaData: DbData | null;
  error: string | null;
  dndType: string | null;
  setDnDType: React.Dispatch<React.SetStateAction<string | null>>;
}

/**
 * FlowProvider props using Prisma types
 */
export interface FlowProviderProps {
  children: ReactNode;
  formInitial?: FlowProviderFormValues;
  formOptions?: Prisma.JsonObject;
  nextParams: {
    cuid: Flow['id'];
  };
  instanceId: Flow['instanceId'];
  setFormRef?: MutableRefObject<UseFormReturnType<FlowProviderFormValues> | null>;
  prismaData: DbData | null;
  error: string | null;
}

/**
 * Flow layout props using Prisma types
 */
export interface FlowLayoutProps {
  children: ReactNode;
  params: {
    domain: string;
    cuid: Flow['id'];
  };
}

/**
 * Flow update type using Prisma's generated types
 */
export type FlowUpdate = Prisma.FlowUpdateInput & {
  viewport?: Viewport;
};

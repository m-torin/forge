// index.tsx

import { MantineColor } from '@mantine/core';
import {
  IconVariable,
  IconCloud,
  IconAi,
  IconBrandAws,
  IconSquare,
  IconBracketsContainEnd,
  IconBracketsContainStart,
} from '@tabler/icons-react';
import React, { FC } from 'react';
import type { ComponentType } from 'react';
import { logWarn } from '@repo/observability';
import { FbNodeProps, MetaType, FbNodeTypes } from '../types';

// ==================================================================================
// Node Imports
// ==================================================================================

// General Nodes
import {
  WebhookNode,
  metaWebhookSourceNode,
  metaWebhookEnrichmentNode,
  metaWebhookDestinationNode,
} from './general/webhook';
import { CronNode, metaCronNode } from './general/cron';

// Logic Nodes
import {
  JavaScriptEditorNode,
  metaJavaScriptEditorNode,
} from './logic/editorJs';
import { PythonEditorNode, metaPythonEditorNode } from './logic/editorPython';
import { IfElseThenNode, metaIfElseThenNode } from './logic/ifThenElse';

// AWS Nodes
import {
  AwsEventBridgeEventNode,
  metaAwsEventBridgeEventSourceNode,
  metaAwsEventBridgeEventDestinationNode,
  metaAwsEventBridgeEventEnrichmentNode,
  AwsLambdaNode,
  metaAwsLambdaNode,
  AwsS3Node,
  metaAwsS3Node,
  AwsSnsNode,
  metaAwsSnsNode,
  AwsSqsNode,
  metaAwsSqsNode,
} from './aws';

// Provider Nodes
import {
  GithubEventReceiverNode,
  metaGithubEventReceiverSourceNode,
} from './providers/github/eventReceiver';

// GPT Nodes
import { AnthropicGptNode, metaAnthropicGptNode } from './gpt/anthropic';
import { OpenaiGptNode, metaOpenaiGptNode } from './gpt/openai';

// ==================================================================================
// Types
// ==================================================================================

/**
 * Represents the data structure for a group of nodes.
 */
export type GroupData = {
  icon: React.ReactNode;
  label: string;
  color: MantineColor;
  items: ItemData[];
};

/**
 * Represents the data structure for an individual node item.
 */
export type ItemData = {
  icon?: React.ReactNode;
  href?: string;
  label: string;
  onDragStartType?: string;
};

// ==================================================================================
// Group Configuration
// ==================================================================================

// Define the desired order of groups
const GROUP_ORDER: string[] = [
  'source',
  'destination',
  'logic',
  'general',
  'gpt',
  'aws',
];

// Configuration for each group
const GROUP_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    color: MantineColor;
    label: string;
  }
> = {
  source: {
    icon: <IconBracketsContainStart />,
    color: 'green',
    label: 'Incoming',
  },
  destination: {
    icon: <IconBracketsContainEnd />,
    color: 'red',
    label: 'Outgoing',
  },
  logic: {
    icon: <IconCloud />,
    color: 'yellow',
    label: 'Logic',
  },
  general: {
    icon: <IconVariable />,
    color: 'blue',
    label: 'General',
  },
  gpt: {
    icon: <IconAi />,
    color: 'indigo',
    label: 'LLM / GPT',
  },
  aws: {
    icon: <IconBrandAws />,
    color: 'orange',
    label: 'AWS',
  },
};

// Default configuration for unspecified groups
const DEFAULT_GROUP_CONFIG = {
  icon: <IconSquare />,
  color: 'gray' as MantineColor,
  label: 'Other',
};

// ==================================================================================
// Node Registry Definition
// ==================================================================================

// Define the structure of NODE_MODULES with all available nodes categorized
const NODE_MODULES = {
  general: {
    CronNode: {
      component: CronNode,
      meta: metaCronNode,
    },
    WebhookEnrichmentNode: {
      component: WebhookNode,
      meta: metaWebhookEnrichmentNode,
    },
    WebhookSourceNode: {
      component: WebhookNode,
      meta: metaWebhookSourceNode,
    },
    WebhookDestinationNode: {
      component: WebhookNode,
      meta: metaWebhookDestinationNode,
    },
  },
  logic: {
    JavaScriptEditorNode: {
      component: JavaScriptEditorNode,
      meta: metaJavaScriptEditorNode,
    },
    PythonEditorNode: {
      component: PythonEditorNode,
      meta: metaPythonEditorNode,
    },
    IfElseThenNode: {
      component: IfElseThenNode,
      meta: metaIfElseThenNode,
    },
  },
  providers: {
    GithubEventReceiverSourceNode: {
      component: GithubEventReceiverNode,
      meta: metaGithubEventReceiverSourceNode,
    },
  },
  aws: {
    AwsEventBridgeEventSourceNode: {
      component: AwsEventBridgeEventNode,
      meta: metaAwsEventBridgeEventSourceNode,
    },
    AwsEventBridgeEventDestinationNode: {
      component: AwsEventBridgeEventNode,
      meta: metaAwsEventBridgeEventDestinationNode,
    },
    AwsEventBridgeEventEnrichmentNode: {
      component: AwsEventBridgeEventNode,
      meta: metaAwsEventBridgeEventEnrichmentNode,
    },
    LambdaNode: {
      component: AwsLambdaNode,
      meta: metaAwsLambdaNode,
    },
    S3Node: {
      component: AwsS3Node,
      meta: metaAwsS3Node,
    },
    SnsNode: {
      component: AwsSnsNode,
      meta: metaAwsSnsNode,
    },
    SqsNode: {
      component: AwsSqsNode,
      meta: metaAwsSqsNode,
    },
  },
  gpt: {
    AnthropicGptNode: {
      component: AnthropicGptNode,
      meta: metaAnthropicGptNode,
    },
    OpenaiGptNode: {
      component: OpenaiGptNode,
      meta: metaOpenaiGptNode,
    },
  },
} as const;

// ==================================================================================
// Default Node
// ==================================================================================

/**
 * Represents a default node component used when a specific node type is not found.
 */
const DefaultNode: FC<FbNodeProps> = () => {
  return <div>Default Node</div>;
};

/**
 * Metadata for the default node.
 */
const defaultNodeMeta: MetaType = {
  displayName: 'Default Node',
  group: 'Default',
  icon: 'IconSquare',
  color: 'gray',
  type: 'default',
};

// ==================================================================================
// Registry Types and Initialization
// ==================================================================================

/**
 * Extended metadata type for nodes.
 */
type NodeMeta = MetaType & {
  type: string;
  displayName: string;
};

/**
 * Defines the structure of the node registry.
 */
type NodeRegistry = Record<
  string,
  {
    component: ComponentType<FbNodeProps>;
    meta: NodeMeta;
  }
>;

// ==================================================================================
// Initialize the Registry
// ==================================================================================

/**
 * Builds the node registry by aggregating all nodes from NODE_MODULES and appending the default node.
 * @returns The complete node registry.
 */
const buildRegistry = (): NodeRegistry => {
  const registry: NodeRegistry = {};

  // Register nodes from NODE_MODULES
  for (const category of Object.values(NODE_MODULES)) {
    for (const [name, { component, meta }] of Object.entries(category)) {
      if (!meta?.type) {
        logWarn('Missing meta type for node', { nodeName: name });
        continue;
      }

      registry[meta.type] = {
        component,
        meta,
      };
    }
  }

  // Append the Default Node to the registry
  registry[defaultNodeMeta.type] = {
    component: DefaultNode,
    meta: defaultNodeMeta,
  };

  return registry;
};

// Export the constructed node registry
export const nodeRegistry = buildRegistry();

// ==================================================================================
// Groups Generation
// ==================================================================================

/**
 * Builds the groups for the nodes based on the registry and group configurations.
 * @returns An array of grouped node data.
 */
const buildGroups = (): GroupData[] => {
  // Aggregate nodes by their group
  const nodesByGroup = Object.entries(nodeRegistry).reduce(
    (acc, [type, { meta }]) => {
      const category = meta.group.toLowerCase();
      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({
        label: meta.displayName,
        onDragStartType: type,
      });

      return acc;
    },
    {} as Record<string, ItemData[]>,
  );

  const orderedGroups: GroupData[] = [];

  // Add groups based on GROUP_ORDER
  for (const groupKey of GROUP_ORDER) {
    if (nodesByGroup[groupKey]) {
      const config = GROUP_CONFIG[groupKey];
      orderedGroups.push({
        icon: config.icon,
        label: config.label,
        color: config.color,
        items: nodesByGroup[groupKey].sort((a, b) =>
          a.label.localeCompare(b.label),
        ),
      });
      delete nodesByGroup[groupKey];
    }
  }

  // Handle any remaining groups not specified in GROUP_ORDER
  Object.entries(nodesByGroup).forEach(([category, items]) => {
    const config = GROUP_CONFIG[category] || {
      ...DEFAULT_GROUP_CONFIG,
      label: category.charAt(0).toUpperCase() + category.slice(1),
    };

    orderedGroups.push({
      icon: config.icon,
      label: config.label,
      color: config.color,
      items: items.sort((a, b) => a.label.localeCompare(b.label)),
    });
  });

  return orderedGroups;
};

// Export the generated groups
export const groups = buildGroups();

// ==================================================================================
// Exports and Utilities
// ==================================================================================

// Define an enumeration of node types
export const NodeTypesEnum = Object.fromEntries(
  Object.entries(nodeRegistry).map(([type]) => [type, type]),
) as Record<string, string>;

// Define the type for node types based on the enumeration
export type NodeTypes = keyof typeof NodeTypesEnum;

// ==================================================================================
// React Flow Node Types Mapping
// ==================================================================================

/**
 * Maps node types to their corresponding React components for React Flow.
 */
export const rfNodeTypes: FbNodeTypes = Object.fromEntries(
  Object.entries(nodeRegistry).map(([type, { component }]) => [
    type,
    component,
  ]),
) as FbNodeTypes;

// ==================================================================================
// Node Metadata Mapping
// ==================================================================================

/**
 * Maps node types to their corresponding metadata.
 */
export const nodeMetaMap: Record<string, NodeMeta> = Object.fromEntries(
  Object.entries(nodeRegistry).map(([type, { meta }]) => [type, meta]),
);

// ==================================================================================
// Utility Functions
// ==================================================================================

/**
 * Checks if a given type string is a valid node type.
 * @param type - The type string to validate.
 * @returns A boolean indicating whether the type is valid.
 */
export const isValidNodeType = (type: string): type is NodeTypes => {
  return type in nodeRegistry;
};

/**
 * Retrieves the metadata for a given node type.
 * @param type - The node type.
 * @returns The metadata associated with the node type.
 * @throws Will throw an error if the node type is not found.
 */
export const getNodeMeta = (type: NodeTypes): NodeMeta => {
  const node = nodeRegistry[type];
  if (!node) throw new Error(`Node type not found: ${type}`);
  return node.meta;
};

/**
 * Retrieves the color associated with the group of a given node type.
 * @param type - The node type.
 * @returns The MantineColor associated with the node's group.
 */
export const getNodeGroupColor = (type: NodeTypes): MantineColor => {
  const meta = nodeRegistry[type]?.meta;
  if (!meta) return DEFAULT_GROUP_CONFIG.color;

  const groupConfig = GROUP_CONFIG[meta.group.toLowerCase()];
  return groupConfig?.color || DEFAULT_GROUP_CONFIG.color;
};

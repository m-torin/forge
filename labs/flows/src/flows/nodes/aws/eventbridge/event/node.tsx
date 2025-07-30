'use client';

import React, { FC, memo, useCallback, useMemo } from 'react';
import { logWarn, logError } from '@repo/observability';
import { FbNodeProps } from '#/flows/types';
import { useFbNode , NodeWrapper } from '#/flows/nodes/internal';
import { formSchema, FormValues } from './formSchema';
import { getInitialValues } from './initialValues';
import { NodeForm, NodeOptions } from './ui';
import { handleSubmit } from './handleSubmit';
import { computeWrapper } from './computeEvent';
import {
  metaAwsEventBridgeEventSourceNode,
  metaAwsEventBridgeEventDestinationNode,
  metaAwsEventBridgeEventEnrichmentNode,
} from './metadata';

/**
 * AWS EventBridge Node Component
 * A functional component that handles the rendering and logic for AWS EventBridge nodes.
 *
 * Features:
 * - Supports source, destination, and enrichment modes
 * - Form handling with validation
 * - Computation wrapper for AWS EventBridge event processing
 * - Integration with node framework
 *
 * @component
 * @param {FbNodeProps} props - Component properties following the FbNodeProps interface
 */
export const AwsEventBridgeEventNode: FC<FbNodeProps> = memo(
  (props: FbNodeProps) => {
    const { data, id } = props;

    /**
     * Memoized initial values for the form
     * Recalculates only when node data changes
     */
    const initialValues = useMemo(() => getInitialValues(data), [data]);

    /**
     * Determines node type and returns appropriate metadata
     * Defaults to source if type is unknown
     */
    const nodeMeta = useMemo(() => {
      // Default to source if type is undefined or unknown
      if (!data?.type) {
        logWarn('Node type not specified, defaulting to source', { nodeId: id });
        return metaAwsEventBridgeEventSourceNode;
      }

      switch (data.type) {
        case 'awsEventBridgeSource':
          return metaAwsEventBridgeEventSourceNode;
        case 'awsEventBridgeDestination':
          return metaAwsEventBridgeEventDestinationNode;
        case 'awsEventBridgeEnrichment':
          return metaAwsEventBridgeEventEnrichmentNode;
        default:
          logWarn('Unknown node type, defaulting to source', { nodeType: data.type, nodeId: id });
          return metaAwsEventBridgeEventSourceNode;
      }
    }, [data?.type, id]);

    /**
     * Form submission handler
     * Validates form data and processes the submission based on node type
     *
     * @param {FormValues} values - The form values to be submitted
     */
    const onSubmit = useCallback(
      async (values: FormValues) => {
        try {
          // Validate form values against schema
          const validation = formSchema.safeParse(values);
          if (!validation.success) {
            logError('Form validation failed', { error: validation.error });
            return;
          }

          // Add AWS-specific metadata
          const enrichedValues = {
            ...values,
            metadata: {
              ...values.metadata,
              provider: 'aws',
              service: 'eventbridge',
              mode:
                data?.type?.replace('awsEventBridge', '').toLowerCase() ||
                'source',
            },
          };

          // Process form submission
          const result = await handleSubmit(enrichedValues);
          if (!result.success && result.error) {
            throw result.error;
          }
        } catch (error) {
          logError('Form submission failed', { error });
          throw error;
        }
      },
      [data?.type],
    );

    /**
     * Memoized node properties configuration
     * Combines form handling, compute functionality, and UI components
     */
    const fbNodeProps = useMemo(
      () => ({
        node: {
          nodeProps: props,
          nodeMeta, // Now always returns a valid MetaType
        },
        form: {
          formSchema,
          initialValues,
          handleSubmit: onSubmit,
        },
        compute: computeWrapper,
        modalTabs: {
          configuration: NodeForm,
          nodeOptions: NodeOptions,
        },
      }),
      [props, nodeMeta, initialValues, onSubmit],
    );

    // Initialize node with form values type
    const { CombinedProviderComponent } = useFbNode<FormValues>(fbNodeProps);

    // Guard clause for missing data
    if (!data) {
      logError('Node data is missing', { nodeId: id });
      return null;
    }

    return (
      <CombinedProviderComponent>
        <NodeWrapper />
      </CombinedProviderComponent>
    );
  },
);

// Set display name for debugging purposes
AwsEventBridgeEventNode.displayName = 'AwsEventBridgeEventNode';

// Export the component
export default AwsEventBridgeEventNode;

'use client';

import React, { FC, memo, useCallback, useMemo } from 'react';
import { FbNodeProps } from '#/flows/types';
import { useFbNode , NodeWrapper } from '#/flows/nodes/internal';
import { formSchema, FormValues } from './formSchema';
import { getInitialValues } from './initialValues';
import { NodeForm, NodeOptions } from './ui';
import { handleSubmit } from './handleSubmit';
import { computeWrapper } from './computeEvent';
import {
  metaWebhookSourceNode,
  metaWebhookDestinationNode,
  metaWebhookEnrichmentNode,
} from './metadata';
import { logError } from '@repo/observability';

/**
 * WebhookNode Component
 * A functional component that handles the rendering and logic for webhook nodes.
 *
 * Features:
 * - Supports both source and destination webhook types
 * - Form handling with validation
 * - Webhook computation wrapper
 * - Integration with node framework
 *
 * @component
 * @param {FbNodeProps} props - Component properties following the FbNodeProps interface
 */
export const WebhookNode: FC<FbNodeProps> = memo((props: FbNodeProps) => {
  const { data } = props;

  /**
   * Memoized initial values for the webhook configuration
   * Recalculates only when node data changes
   */
  const initialValues = useMemo(() => getInitialValues(data), [data]);

  /**
   * Determines webhook type and returns appropriate metadata
   */
  const nodeMeta = useMemo(() => {
    switch (data?.type) {
      case 'webhookSource':
        return metaWebhookSourceNode;
      case 'webhookDestination':
        return metaWebhookDestinationNode;
      default:
        return metaWebhookEnrichmentNode;
    }
  }, [data?.type]);

  /**
   * Form submission handler
   * Validates webhook configuration and processes the submission
   *
   * @param {FormValues} values - The form values to be submitted
   */
  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      const validation = formSchema.safeParse(values);
      if (!validation.success) {
        logError('Form validation failed', { error: validation.error });
        return;
      }

      const result = await handleSubmit(values);
      if (!result.success && result.error) {
        throw result.error;
      }
    } catch (error) {
      logError('Form submission failed', { error });
      throw error;
    }
  }, []);

  /**
   * Memoized node properties configuration
   * Combines form handling, compute functionality, and UI components
   */
  const fbNodeProps = useMemo(
    () => ({
      node: {
        nodeProps: props,
        nodeMeta,
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

  const { CombinedProviderComponent } = useFbNode<FormValues>(fbNodeProps);

  if (!data) {
    logError('Node data is missing', { data });
    return null;
  }

  return (
    <CombinedProviderComponent>
      <NodeWrapper />
    </CombinedProviderComponent>
  );
});

WebhookNode.displayName = 'WebhookNode';

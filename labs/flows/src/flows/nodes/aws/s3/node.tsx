'use client';

import React, { FC, memo, useCallback, useMemo } from 'react';
import { logError } from '@repo/observability';
import { FbNodeProps } from '#/flows/types';
import { useFbNode , NodeWrapper } from '#/flows/nodes/internal';
import { formSchema, FormValues } from './formSchema';
import { getInitialValues } from './initialValues';
import { NodeForm, NodeOptions } from './ui';
import { metaAwsS3Node } from './metadata';
import { handleSubmit } from './handleSubmit';
import { computeWrapper } from './computeEvent';

/**
 * AwsS3Node Component
 * A functional component that handles the rendering and logic for a source node.
 *
 * Features:
 * - Form handling with validation
 * - Computation wrapper for processing data
 * - Integration with node framework
 *
 * @component
 * @param {FbNodeProps} props - Component properties following the FbNodeProps interface
 */
export const AwsS3Node: FC<FbNodeProps> = memo((props: FbNodeProps) => {
  const { data, id } = props;

  /**
   * Memoized initial values for the form
   * Recalculates only when node data changes
   */
  const initialValues = useMemo(() => getInitialValues(data), [data]);

  /**
   * Form submission handler
   * Validates form data and processes the submission
   *
   * @param {FormValues} values - The form values to be submitted
   */
  const onSubmit = useCallback(async (values: FormValues) => {
    try {
      // Validate form values against schema
      const validation = formSchema.safeParse(values);
      if (!validation.success) {
        logError('Form validation failed', { error: validation.error });
        return;
      }

      // Process form submission
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
        nodeMeta: metaAwsS3Node,
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
    [props, initialValues, onSubmit],
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
});

// Set display name for debugging purposes
AwsS3Node.displayName = 'AwsS3Node';

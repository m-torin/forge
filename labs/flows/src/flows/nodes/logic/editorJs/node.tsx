// JavaScriptEditorNode/node.tsx
import React, { FC, memo, useCallback, useMemo } from 'react';
import { FbNodeProps } from '#/flows/types';
import { useFbNode, NodeWrapper } from '#/flows/nodes/internal';
import { formSchema, FormValues } from './formSchema';
import { getInitialValues } from './initialValues';
import { NodeForm, NodeOptions } from './ui';
import { metaJavaScriptEditorNode } from './metadata';
import { handleSubmit } from './handleSubmit';
import { computeWrapper } from './computeEvent';
import { logError } from '@repo/observability';

export const JavaScriptEditorNode: FC<FbNodeProps> = memo(
  (props: FbNodeProps) => {
    const { data } = props;

    const initialValues = useMemo(() => getInitialValues(data), [data]);

    const onSubmit = useCallback(async (values: FormValues) => {
      try {
        const validation = formSchema.safeParse(values);
        if (!validation.success) {
          logError('Form validation failed', { error: validation.error });
          return;
        }
        await handleSubmit(values);
      } catch (error) {
        logError('Form submission failed', { error });
        throw error;
      }
    }, []);

    const fbNodeProps = useMemo(
      () => ({
        node: {
          nodeProps: props,
          nodeMeta: metaJavaScriptEditorNode,
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
  },
);

JavaScriptEditorNode.displayName = 'JavaScriptEditorNode';

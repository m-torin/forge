'use client';

import React, {
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useRef,
} from 'react';
import { useDisclosure } from '@mantine/hooks';
import { createFormContext, UseFormReturnType, useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { FbNode, FbNodeData } from '#/flows/types';
import { useReactFlow, Node } from '@xyflow/react';
import { useAppContext } from '#/app/flow/[cuid]/FlowProvider';
import {
  CombinedContextType,
  UseFbNodeProps,
  ComputeFunction,
} from './internalTypes';
import { logError } from '@repo/observability';

/**
 * Type guard to check if a node is an FbNode
 */
const isFbNode = (node: Node): node is FbNode =>
  node.data && 'uxMeta' in node.data;

// Create CombinedContext outside of the hook
const CombinedContext = createContext<CombinedContextType<any> | null>(null);

/**
 * CombinedProvider component
 */
export const CombinedProvider = <T extends Record<string, any>>({
  value,
  children,
}: {
  value: CombinedContextType<T>;
  children: ReactNode;
}): React.JSX.Element => {
  const [FormProvider] = useMemo(() => createFormContext<T>(), []);

  return (
    <FormProvider form={value.form}>
      <CombinedContext.Provider value={value}>
        {children}
      </CombinedContext.Provider>
    </FormProvider>
  );
};

/**
 * Hook to access the combined context
 */
export const useCombinedContext = <
  T extends Record<string, any>,
>(): CombinedContextType<T> => {
  const context = useContext(CombinedContext);
  if (!context) {
    throw new Error(
      'useCombinedContext must be used within a CombinedProvider',
    );
  }
  return context as CombinedContextType<T>;
};

/**
 * Main hook for managing node state, form interactions, and compute functionality
 */
export const useFbNode = <T extends Record<string, any>>({
  node: { initialNodeData, nodeProps, nodeMeta },
  form: { formSchema, handleSubmit, ...formProps },
  modalTabs,
  compute, // Add compute function to props
}: UseFbNodeProps<T>): {
  nodeData?: FbNode;
  form: UseFormReturnType<T>;
  CombinedProviderComponent: React.FC<{ children: ReactNode }>;
  updateNode: (newData: Partial<FbNode>) => void;
} => {
  const { cuid } = useAppContext();
  const { setNodes } = useReactFlow();
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);

  // Initialize the form
  const form = useForm<T>({
    name: `form-${nodeProps.id.replaceAll('_', '-')}`,
    validate: zodResolver(formSchema),
    mode: 'uncontrolled',
    validateInputOnChange: true,
    ...formProps,
  });

  // Submission flag
  const isSubmitting = useRef(false);

  /**
   * Update node data
   */
  const updateNode = useCallback(
    (newData: Partial<FbNode>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeProps.id
            ? {
                ...node,
                ...newData,
                data: {
                  ...node.data,
                  ...newData.data,
                  uxMeta: {
                    ...(isFbNode(node) ? node.data.uxMeta : {}),
                    ...(newData.data?.uxMeta || {}),
                  },
                  formFields:
                    newData.data?.formFields || node.data.formFields || {},
                  name: newData.data?.name ?? node.data.name,
                  isEnabled: newData.data?.isEnabled ?? node.data.isEnabled,
                  metadata: newData.data?.metadata ?? node.data.metadata,
                  type: node.data.type,
                  nodeMeta: node.data.nodeMeta,
                } as FbNodeData,
              }
            : node,
        ),
      );
      if (newData.data?.formFields) {
        form.setValues(newData.data.formFields as T);
      }
    },
    [setNodes, nodeProps.id, form],
  );

  /**
   * Handle form submission with submission flag
   */
  const handleFormSubmit = useCallback(
    async (values: T) => {
      if (isSubmitting.current) return;
      isSubmitting.current = true;
      try {
        await handleSubmit(values);
        updateNode({
          data: {
            ...nodeProps.data,
            name: values.name,
            isEnabled: values.isEnabled,
            metadata: values.metadata,
            uxMeta: values.uxMeta,
            formFields: values,
          },
        });
        closeModal();
      } catch (error) {
        logError('Form submission failed', { error });
      } finally {
        isSubmitting.current = false;
      }
    },
    [handleSubmit, updateNode, closeModal, nodeProps.data],
  );

  /**
   * Submit form and update node data
   */
  const submitForm = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      await form.onSubmit(handleFormSubmit)(e);
    },
    [form, handleFormSubmit],
  );

  /**
   * Wrap compute function with error handling and type safety
   */
  const wrappedCompute = useCallback<ComputeFunction<T>>(
    async (input: Record<string, any>, data: T) => {
      try {
        if (!compute) {
          throw new Error('Compute function not provided');
        }
        return await compute(input, data);
      } catch (error) {
        logError('Compute error', { error });
        throw error;
      }
    },
    [compute],
  );

  // Memoize contexts
  const nodeContext = useMemo(
    () => ({
      ...(initialNodeData && { initialNodeData }),
      nodeProps,
      nodeMeta,
      modalOpened,
      openModal,
      closeModal,
      flowId: cuid,
      nodeId: nodeProps.id,
    }),
    [
      initialNodeData,
      nodeProps,
      nodeMeta,
      modalOpened,
      openModal,
      closeModal,
      cuid,
    ],
  );

  const formContext = useMemo(
    () => ({
      ...form,
      formSchema,
      handleSubmit,
      submitForm,
    }),
    [form, formSchema, handleSubmit, submitForm],
  ) as CombinedContextType<T>['form'];

  // Combine all context values
  const contextValue = useMemo(
    () => ({
      node: nodeContext,
      form: formContext,
      modalTabs,
      updateNode,
      compute: wrappedCompute, // Add wrapped compute function to context
    }),
    [nodeContext, formContext, modalTabs, updateNode, wrappedCompute],
  );

  // Create combined provider component
  const CombinedProviderComponent: React.FC<{ children: ReactNode }> = useMemo(
    () =>
      ({ children }) => (
        <CombinedProvider<T> value={contextValue}>{children}</CombinedProvider>
      ),
    [contextValue],
  );

  return {
    ...(initialNodeData && { nodeData: initialNodeData }),
    form,
    CombinedProviderComponent,
    updateNode,
  };
};

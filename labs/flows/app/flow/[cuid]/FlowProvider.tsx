'use client';

import React, { createContext, useContext, FC, useMemo, useState, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { initializeDemoModeIfNeeded } from '#/lib/demoMode';
import {
  createFormActions,
  createFormContext,
  UseFormReturnType,
} from '@mantine/form';
import {
  FlowProviderFormValues,
  AppContextProps,
  FlowProviderProps,
  FormSecret,
} from './types';
import { Flow, FlowMethod } from '#/lib/prisma';

// Create Mantine's Form Context
const [FormProvider, useFormContextHook, useFormHook] =
  createFormContext<FlowProviderFormValues>();

// Create AppContext with proper typing
const AppContext = createContext<AppContextProps | undefined>(undefined);

const DEFAULT_FORM_VALUES: FlowProviderFormValues = {
  name: '',
  method: FlowMethod.observable,
  tags: [],
  secrets: [] as FormSecret[],
};

export const FlowProvider: FC<FlowProviderProps> = ({
  children,
  formInitial,
  formOptions,
  nextParams,
  instanceId,
  setFormRef,
  prismaData,
  error,
}) => {
  const form = useFormHook({
    initialValues: formInitial ?? DEFAULT_FORM_VALUES,
    ...formOptions,
  });

  if (setFormRef) setFormRef.current = form;

  // DnD state for managing type of DnD operation
  const [dndType, setDnDType] = useState<string | null>(null);

  // Initialize demo data if needed
  useEffect(() => {
    initializeDemoModeIfNeeded();
  }, []);

  const appContextValue = useMemo<AppContextProps>(
    () => ({
      cuid: nextParams.cuid,
      instanceId,
      prismaData,
      error,
      dndType,
      setDnDType,
    }),
    [
      nextParams.cuid,
      instanceId,
      prismaData,
      error,
      dndType,
    ],
  );

  return (
    <ReactFlowProvider>
      <AppContext.Provider value={appContextValue}>
        <FormProvider form={form}>{children}</FormProvider>
      </AppContext.Provider>
    </ReactFlowProvider>
  );
};

/**
 * Custom hook to access the AppContext within the application.
 */
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context)
    throw new Error('useAppContext must be used within a FlowProvider');
  return context;
};

/**
 * Custom hook to access the form context within FlowProvider.
 */
export const useFlowFormContext =
  (): UseFormReturnType<FlowProviderFormValues> => {
    const form = useFormContextHook();
    if (!form)
      throw new Error('useFlowFormContext must be used within a FlowProvider');
    return form;
  };

export const formActions = (cuid: Flow['id']): ReturnType<typeof createFormActions<FlowProviderFormValues>> =>
  createFormActions<FlowProviderFormValues>(`flow-${cuid}`);

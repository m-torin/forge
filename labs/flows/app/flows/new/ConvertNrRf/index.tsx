'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { UseFormReturnType } from '@mantine/form';
import {
  Stack,
  Paper,
  LoadingOverlay,
  Text,
  SimpleGrid,
  ScrollArea,
  Button,
  Group,
  Box,
  rem,
  Radio,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  useDebouncedValue,
  useQueue,
  useHotkeys,
  useShallowEffect,
  useWindowEvent,
} from '@mantine/hooks';
import { defaultNodeRedFlow, advancedNodeRedFlow } from './defaultNodeRedFlow';
import { CodeHighlight } from '@mantine/code-highlight';
import { CodeEditor } from '#/ui/formFields';
import { logError, logWarn } from '@repo/observability';

import {
  FlowState,
  LoadingState,
  ConversionError,
  createFlowConverter,
} from './logic';

interface NodeRedFlowConverterProps {
  form: UseFormReturnType<any>;
  onFlowDataChange?: (flowData: FlowState) => void;
}

// Define the type for queue operations
type QueueOperation = () => Promise<void>;

/**
 * NodeRedFlowConverter Component
 *
 * Converts Node-RED flows to ReactFlow format with optimized performance and memory management
 * using Mantine hooks for state management, debouncing, and event handling.
 */
export const NodeRedFlowConverter: React.FC<NodeRedFlowConverterProps> = ({
  form,
  onFlowDataChange,
}) => {
  // State management
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isInitializing: true,
    isConverting: false,
  });

  const [flowData, setFlowData] = useState<FlowState>({ nodes: [], edges: [] });
  const [debouncedFlowData] = useDebouncedValue(flowData, 200);
  const [flowType, setFlowType] = useState<'basic' | 'advanced' | 'blank'>(
    'basic',
  );

  // Initialize queue for managing async operations with proper typing
  const {
    add: addToQueue,
    update: _updateQueue,
    cleanQueue,
  } = useQueue<QueueOperation>({
    initialValues: [],
    limit: 1,
  });

  // Create flow converter with memoization
  const convertFlow = useMemo(
    () => createFlowConverter(notifications),
    [],
  );

  // Template validation utility
  const validateAndSetTemplate = useCallback((template: string) => {
    try {
      JSON.parse(template);
      return template;
    } catch (e) {
      logError('Invalid template JSON provided', { error: e, template });
      return '[]';
    }
  }, []);

  // Handle form value changes based on flow type
  useShallowEffect(() => {
    let newValue = '';
    switch (flowType) {
      case 'basic':
        newValue = defaultNodeRedFlow;
        break;
      case 'advanced':
        newValue = JSON.stringify(advancedNodeRedFlow, null, 2);
        break;
      case 'blank':
        newValue = '[]';
        break;
    }
    form.setFieldValue('nodeRedJson', validateAndSetTemplate(newValue));
  }, [flowType, form]);

  // Convert Node-RED flow to ReactFlow format
  useShallowEffect(() => {
    const nodeRedJson = form.values.nodeRedJson;
    if (!nodeRedJson) return;

    addToQueue(async () => {
      try {
        const result = convertFlow(nodeRedJson);
        setFlowData(result);
        onFlowDataChange?.(result);
      } catch (error) {
        logError('Error converting Node-RED template', { error, nodeRedJson });
      }
    });
  }, [form.values.nodeRedJson, convertFlow, onFlowDataChange]);

  // Handle editor changes with debouncing
  const handleEditorChange = useCallback(
    (value: string) => {
      form.setFieldValue('nodeRedJson', value);
    },
    [form],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: { nodeRedJson: string }) => {
      addToQueue(async () => {
        setLoadingState((prev) => ({ ...prev, isConverting: true }));
        try {
          const result = convertFlow(values.nodeRedJson);
          setFlowData(result);
          notifications.show({
            title: 'Success',
            message: `Converted ${result.nodes.length} nodes and ${result.edges.length} edges`,
            color: 'green',
          });
          onFlowDataChange?.(result);
        } catch (err) {
          const error = err as ConversionError;
          notifications.show({
            title: 'Conversion Error',
            message: error.message || 'Invalid Node-RED flow',
            color: 'red',
          });
          logError('Conversion error occurred', { 
            error: error.message, 
            details: error.details,
            nodeRedJson: values.nodeRedJson
          });
        } finally {
          setLoadingState((prev) => ({ ...prev, isConverting: false }));
        }
      });
    },
    [convertFlow, onFlowDataChange, addToQueue],
  );

  // Handle form reset
  const handleReset = useCallback(() => {
    addToQueue(async () => {
      form.reset();
      form.setValues({});
      form.setErrors({});
      setFlowData({ nodes: [], edges: [] });
      const result = convertFlow(defaultNodeRedFlow);
      setFlowData(result);
      setFlowType('basic');
      onFlowDataChange?.(result);
    });
  }, [form, convertFlow, onFlowDataChange, addToQueue]);

  // Initialize component
  useShallowEffect(() => {
    if (!loadingState.isInitializing) return;

    addToQueue(async () => {
      try {
        const result = convertFlow(defaultNodeRedFlow);
        setFlowData(result);
        onFlowDataChange?.(result);
      } catch (_err) {
        notifications.show({
          title: 'Initialization Error',
          message: 'Failed to load initial flow',
          color: 'red',
        });
      } finally {
        setLoadingState((prev) => ({ ...prev, isInitializing: false }));
      }
    });
  }, []);

  // Add keyboard shortcuts
  useHotkeys([
    ['mod+S', () => handleSubmit(form.values)],
    ['mod+R', handleReset],
  ]);

  // Handle cleanup on unmount
  useWindowEvent('beforeunload', () => {
    cleanQueue();
  });

  // Memoize ReactFlow code string
  const reactFlowCode = useMemo(() => {
    return JSON.stringify(debouncedFlowData, null, 2);
  }, [debouncedFlowData]);

  // Custom onChange handler for flow type
  const handleFlowTypeChange = useCallback((value: string) => {
    if (value === 'basic' || value === 'advanced' || value === 'blank') {
      setFlowType(value as 'basic' | 'advanced' | 'blank');
    } else {
      logWarn('Unsupported flow type provided', { flowType: value });
    }
  }, []);

  const isProcessing = loadingState.isInitializing || loadingState.isConverting;

  return (
    <Paper shadow="sm" p="md" className="w-full max-w-6xl mx-auto relative">
      <LoadingOverlay visible={isProcessing} />
      <Box>
        <Radio.Group
          value={flowType}
          onChange={handleFlowTypeChange}
          name="flowType"
          label="Select Node-RED flow type"
          description="Choose a pre-defined flow or start from scratch"
          withAsterisk
          mb="md"
        >
          <Group mt="sm">
            <Radio value="basic" label="Basic" />
            <Radio value="advanced" label="Advanced" />
            <Radio value="blank" label="Blank" />
          </Group>
        </Radio.Group>

        <SimpleGrid cols={2}>
          <Stack gap="md">
            <Text fw={500}>Node-RED Flow JSON</Text>
            <Box className="min-h-[300px]">
              <CodeEditor
                defaultValue={form.values.nodeRedJson}
                onChange={handleEditorChange}
                language="json"
                height={rem(700)}
                readOnly={isProcessing}
                theme="dracula"
                data-autofocus
              />
            </Box>
            {form.errors.nodeRedJson && (
              <Text c="red" size="sm">
                {form.errors.nodeRedJson}
              </Text>
            )}
            <Group>
              <Button
                onClick={() => handleSubmit(form.values)}
                disabled={!!form.errors.nodeRedJson || isProcessing}
              >
                Convert Flow
              </Button>
              <Button
                variant="light"
                onClick={handleReset}
                disabled={isProcessing}
              >
                Reset
              </Button>
            </Group>
          </Stack>

          <Stack gap="md">
            <Text fw={500}>ReactFlow Nodes and Edges JSON</Text>
            <ScrollArea h={700}>
              <CodeHighlight
                code={reactFlowCode}
                language="json"
                withCopyButton
                className="min-h-[500px] overflow-auto"
              />
            </ScrollArea>
          </Stack>
        </SimpleGrid>
      </Box>
    </Paper>
  );
};

export default NodeRedFlowConverter;

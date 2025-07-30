'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Loader,
  Modal,
  rem,
  Switch,
  Tabs,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconCircleOff,
  IconForms,
  IconHeading,
  IconLock,
  IconPower,
} from '@tabler/icons-react';
import { useCombinedContext } from '#/flows/nodes/internal';
import classes from './internal.module.scss';
import { readNodeAction } from '#/lib/prisma/serverActions';
import { SecretManager } from '#/ui/shared';

/**
 * Icon for the enabled state of the node
 */
const onIcon = (
  <IconPower style={{ height: rem(16), width: rem(16) }} stroke={2.5} />
);

/**
 * Icon for the disabled state of the node
 */
const offIcon = (
  <IconCircleOff
    color="var(--mantine-color-red-6)"
    stroke={2.5}
    style={{ height: rem(16), marginLeft: '-4px' }}
  />
);

/**
 * Props for the FlowModal component
 */
interface FlowModalProps {
  /** Child components to be rendered inside the modal */
  children?: React.ReactNode;
  /** ID of the node */
  nodeId: string;
  /** Data for UI options to be passed to the FlowModal */
  uiOptionsData?: React.ReactNode;
  /** Data for variables to be passed to the FlowModal */
  variablesData?: React.ReactNode;
}

/**
 * FlowModal component for editing node properties
 * @param {FlowModalProps} props - The props for the FlowModal component
 * @returns {JSX.Element} The rendered FlowModal component
 */
export const FlowModal: React.FC<FlowModalProps> = ({ children, nodeId }) => {
  // State to store the flow ID associated with the node
  const [flowId, setFlowId] = useState<string | null>(null);

  // Destructure values from the combined context
  const {
    node: {
      nodeProps,
      nodeMeta: { color: colorBase, type: nodeType, displayName: nodeTypeName },
      modalOpened,
      closeModal,
    },
    form,
    modalTabs,
    updateNode,
  } = useCombinedContext();

  // Fetch the flow ID when the component mounts or nodeId changes
  useEffect(() => {
    const fetchFlowId = async () => {
      const node = await readNodeAction(nodeId);
      if (node) {
        setFlowId(node.flowId);
      }
    };

    fetchFlowId();
  }, [nodeId]);

  /**
   * Handle the change of the enabled/disabled switch
   */
  const handleSwitchChange = () => {
    form.setFieldValue('isEnabled', !form.values.isEnabled);
  };

  // Destructure form props for the isEnabled field
  const { onChange: _onChange, ...switchProps } = form.getInputProps('isEnabled', {
    type: 'checkbox',
  });
  const isEnabledChecked = switchProps.checked as boolean;

  const [activeTab, setActiveTab] = useState<string | null>('configuration');

  /**
   * Memoized icon style
   */
  const iconStyle = useMemo(
    () => ({ color: 'gray', height: rem(18), width: rem(18) }),
    [],
  );

  return (
    <Modal.Root
      onClose={() => {
        const formValues = form.getTransformedValues();
        updateNode({
          data: {
            ...nodeProps.data,
            name: formValues.name,
            isEnabled: formValues.isEnabled,
            metadata: formValues.metadata,
            uxMeta: formValues.uxMeta,
            formFields: formValues,
          },
        });
        closeModal();
      }}
      opened={modalOpened}
      size="xl"
      trapFocus={false}
    >
      <Modal.Overlay blur={3} opacity={0.75} />
      <Modal.Content
        radius={rem(8)}
        style={{ border: `4px solid var(--mantine-color-${colorBase}-5)` }}
      >
        <Modal.Header
          bg="gray.1"
          style={{
            borderBottom: `2px solid var(--mantine-color-${colorBase}-5)`,
          }}
        >
          <Flex
            align="flex-start"
            direction="row"
            gap="md"
            justify="flex-start"
            wrap="wrap"
            w="100%"
          >
            <TextInput
              data-autofocus
              label={`Flowbuilder calls this ${nodeType} ${nodeTypeName.replace(
                'New ',
                '',
              )}...`}
              {...form.getInputProps('name')}
              flex={1}
            />
            <Box>
              <Text className={classes.label} c="dark.7" fw={500}>
                {isEnabledChecked ? 'Disabled' : 'Enabled'}
              </Text>
              <Tooltip
                arrowOffset={10}
                arrowSize={4}
                label={`${
                  isEnabledChecked ? 'Deactivate' : 'Activate'
                } this node`}
                position="bottom"
                refProp="rootRef"
                withArrow
              >
                <Switch
                  {...switchProps}
                  onChange={handleSwitchChange}
                  classNames={{ label: classes.label }}
                  color="teal.3"
                  onLabel={onIcon}
                  offLabel={offIcon}
                  size="lg"
                />
              </Tooltip>
            </Box>
          </Flex>
        </Modal.Header>

        <Modal.Body p={0}>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            color={colorBase}
            keepMounted={false}
            variant="outline"
            defaultValue="configuration"
            pt="sm"
          >
            <Tabs.List px="sm">
              <Tabs.Tab
                p="md"
                leftSection={<IconForms style={iconStyle} />}
                value="configuration"
              >
                Configuration
              </Tabs.Tab>
              <Tabs.Tab
                value="secrets"
                leftSection={<IconLock style={iconStyle} />}
              >
                Secrets & Vars
              </Tabs.Tab>

              <Tabs.Tab
                ml="auto"
                leftSection={<IconHeading style={iconStyle} />}
                value="nodeOptions"
              >
                Canvas UI
              </Tabs.Tab>
            </Tabs.List>

            <Container>
              <Tabs.Panel value="configuration" pt={rem(10)}>
                {children}
                {modalTabs.configuration && <modalTabs.configuration />}
              </Tabs.Panel>

              <Tabs.Panel value="nodeOptions" pt={rem(10)}>
                {modalTabs.nodeOptions && <modalTabs.nodeOptions />}
              </Tabs.Panel>

              <Tabs.Panel value="secrets" pt={rem(10)}>
                {flowId && (
                  <Suspense fallback={<Loader />}>
                    <SecretManager flowId={flowId} nodeId={nodeId} />
                  </Suspense>
                )}
              </Tabs.Panel>
            </Container>
          </Tabs>

          {activeTab !== 'secrets' && (
            <Container mt={rem(25)} mb={rem(15)}>
              <Group gap="lg">
                <Button
                  color="cyan"
                  onClick={(e) => form.submitForm(e as any)}
                  variant="light"
                >
                  Submit
                </Button>
                <Button color="red" onClick={closeModal} variant="light">
                  Discard & close
                </Button>
              </Group>
            </Container>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

FlowModal.displayName = 'FlowModal';

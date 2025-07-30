import React, { FC } from 'react';
import {
  Stack,
  TextInput,
  Group,
  Title,
  Paper,
  Collapse,
  Textarea,
  Tooltip,
  Accordion,
  Switch,
  Tabs,
  MultiSelect,
  Text,
} from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import {
  IconBrandAws,
  IconInfoCircle,
  IconArrowUpRight,
  IconArrowDownLeft,
} from '@tabler/icons-react';
import { FormValues } from '../../formSchema';

interface EventBridgeConfigProps {
  form: UseFormReturnType<FormValues>;
}

export const EventBridgeConfig: FC<EventBridgeConfigProps> = ({ form }) => {
  // Get the current enabled state for the key prop
  const isEnabled =
    form.getValues().metadata?.source?.eventBridge?.enabled ?? false;

  return (
    <Paper withBorder p="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Group>
            <IconBrandAws size={20} />
            <Title order={4}>EventBridge Integration</Title>
          </Group>
          <Switch
            key={form.key('metadata.source.eventBridge.enabled')}
            {...form.getInputProps('metadata.source.eventBridge.enabled', {
              type: 'checkbox',
            })}
            label="Enable"
          />
        </Group>

        <Collapse in={isEnabled}>
          <Stack gap="md" key={`eventbridge-content-${isEnabled}`}>
            <Tabs defaultValue="source">
              <Tabs.List>
                <Tabs.Tab
                  value="source"
                  leftSection={<IconArrowUpRight size={16} />}
                >
                  Event Source
                </Tabs.Tab>
                <Tabs.Tab
                  value="destination"
                  leftSection={<IconArrowDownLeft size={16} />}
                >
                  Event Destination
                </Tabs.Tab>
              </Tabs.List>

              {/* Source Configuration */}
              <Tabs.Panel value="source">
                <Stack gap="md" mt="md">
                  <TextInput
                    label="Event Bus Name"
                    key={form.key('metadata.source.eventBridge.eventBusName')}
                    {...form.getInputProps(
                      'metadata.source.eventBridge.eventBusName',
                    )}
                    placeholder="default"
                    description="Name of the EventBridge bus to use"
                  />

                  <TextInput
                    label="Event Source"
                    key={form.key('metadata.source.eventBridge.eventSource')}
                    {...form.getInputProps(
                      'metadata.source.eventBridge.eventSource',
                    )}
                    placeholder="com.myapp.webhook"
                    description="Source identifier for the events"
                  />

                  <TextInput
                    label="Detail Type"
                    key={form.key('metadata.source.eventBridge.detailType')}
                    {...form.getInputProps(
                      'metadata.source.eventBridge.detailType',
                    )}
                    placeholder="webhook.trigger"
                    description="Type identifier for the events"
                  />

                  <Accordion variant="contained">
                    <Accordion.Item value="transform">
                      <Accordion.Control>
                        <Group>
                          <Text>Transform Template</Text>
                          <Tooltip label="Template for transforming webhook payload to EventBridge format">
                            <IconInfoCircle size={16} />
                          </Tooltip>
                        </Group>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <Textarea
                          key={form.key(
                            'metadata.source.eventBridge.transformTemplate',
                          )}
                          {...form.getInputProps(
                            'metadata.source.eventBridge.transformTemplate',
                          )}
                          placeholder="Transform template JSON"
                          minRows={6}
                          autosize
                          styles={{ input: { fontFamily: 'monospace' } }}
                        />
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </Stack>
              </Tabs.Panel>

              {/* Destination Configuration */}
              <Tabs.Panel value="destination">
                <Stack gap="md" mt="md">
                  <Switch
                    label="Register as EventBridge Destination"
                    description="Create a rule to receive events from EventBridge"
                    key={form.key(
                      'metadata.source.eventBridge.registerAsDestination',
                    )}
                    {...form.getInputProps(
                      'metadata.source.eventBridge.registerAsDestination',
                      {
                        type: 'checkbox',
                      },
                    )}
                  />

                  <Collapse
                    in={
                      form.getValues().metadata?.source?.eventBridge
                        ?.registerAsDestination ?? false
                    }
                  >
                    <Stack
                      gap="md"
                      key={`destination-config-${form.getValues().metadata?.source?.eventBridge?.registerAsDestination ?? 'undefined'}`}
                    >
                      <TextInput
                        label="Target Bus Name"
                        key={form.key(
                          'metadata.source.eventBridge.destinationConfig.targetBusName',
                        )}
                        {...form.getInputProps(
                          'metadata.source.eventBridge.destinationConfig.targetBusName',
                        )}
                        placeholder="default"
                        description="EventBridge bus to listen for events"
                      />

                      <TextInput
                        label="Rule Name"
                        key={form.key(
                          'metadata.source.eventBridge.destinationConfig.ruleName',
                        )}
                        {...form.getInputProps(
                          'metadata.source.eventBridge.destinationConfig.ruleName',
                        )}
                        placeholder="webhook-destination-rule"
                        description="Name for the EventBridge rule"
                      />

                      <Accordion variant="contained">
                        <Accordion.Item value="pattern">
                          <Accordion.Control>Event Pattern</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="md">
                              <MultiSelect
                                label="Source Filter"
                                placeholder="Enter event sources"
                                description="Events from these sources will trigger the webhook"
                                key={form.key(
                                  'metadata.source.eventBridge.destinationConfig.pattern.source',
                                )}
                                {...form.getInputProps(
                                  'metadata.source.eventBridge.destinationConfig.pattern.source',
                                )}
                                data={[]} // Could be populated from API
                                searchable
                              />

                              <MultiSelect
                                label="Detail Type Filter"
                                placeholder="Enter detail types"
                                description="Events with these detail types will trigger the webhook"
                                key={form.key(
                                  'metadata.source.eventBridge.destinationConfig.pattern.detailType',
                                )}
                                {...form.getInputProps(
                                  'metadata.source.eventBridge.destinationConfig.pattern.detailType',
                                )}
                                data={[]} // Could be populated from API
                                searchable
                              />

                              <Accordion variant="contained">
                                <Accordion.Item value="customPattern">
                                  <Accordion.Control>
                                    Custom Pattern
                                  </Accordion.Control>
                                  <Accordion.Panel>
                                    <Textarea
                                      key={form.key(
                                        'metadata.source.eventBridge.destinationConfig.pattern.customPattern',
                                      )}
                                      {...form.getInputProps(
                                        'metadata.source.eventBridge.destinationConfig.pattern.customPattern',
                                      )}
                                      placeholder="Enter custom event pattern JSON"
                                      minRows={6}
                                      autosize
                                      styles={{
                                        input: { fontFamily: 'monospace' },
                                      }}
                                    />
                                  </Accordion.Panel>
                                </Accordion.Item>
                              </Accordion>
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>

                        <Accordion.Item value="inputTransform">
                          <Accordion.Control>Input Transform</Accordion.Control>
                          <Accordion.Panel>
                            <Stack gap="md">
                              <Switch
                                label="Use Full Event"
                                key={form.key(
                                  'metadata.source.eventBridge.destinationConfig.inputTransform.useFullEvent',
                                )}
                                {...form.getInputProps(
                                  'metadata.source.eventBridge.destinationConfig.inputTransform.useFullEvent',
                                  {
                                    type: 'checkbox',
                                  },
                                )}
                              />

                              {!form.getValues().metadata?.source?.eventBridge
                                .destinationConfig?.inputTransform
                                ?.useFullEvent && (
                                <MultiSelect
                                  label="Selected Fields"
                                  description="Choose specific event fields to pass to webhook"
                                  placeholder="Select fields to include"
                                  key={form.key(
                                    'metadata.source.eventBridge.destinationConfig.inputTransform.selectedFields',
                                  )}
                                  {...form.getInputProps(
                                    'metadata.source.eventBridge.destinationConfig.inputTransform.selectedFields',
                                  )}
                                  data={[
                                    { value: 'detail', label: 'Event Detail' },
                                    { value: 'source', label: 'Event Source' },
                                    {
                                      value: 'detail-type',
                                      label: 'Detail Type',
                                    },
                                    { value: 'time', label: 'Event Time' },
                                  ]}
                                />
                              )}
                            </Stack>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    </Stack>
                  </Collapse>
                </Stack>
              </Tabs.Panel>
            </Tabs>
          </Stack>
        </Collapse>
      </Stack>
    </Paper>
  );
};

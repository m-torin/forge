'use client';

import React, { useState, useEffect, FC, memo, useCallback } from 'react';
import {
  Box,
  Stack,
  Skeleton,
  Text,
  Group,
  Badge,
  Accordion,
  Grid,
  Button,
  TextInput,
  ActionIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { logError } from '@repo/observability';
import {
  DescribeEventBusCommand,
  ListRulesCommand,
  ListTagsForResourceCommand,
  TagResourceCommand,
  UntagResourceCommand,
} from '#/integrations/aws/eventbridge';
import type {
  EventBus,
  Tag as AwsTag,
  Target,
} from '@aws-sdk/client-eventbridge';

// Types imported from eventbridge-rules.ts and eventbridge-bus.ts
interface RuleDetailsFromFile {
  Name: string;
  Description?: string | undefined;
  State?: string | undefined;
  ScheduleExpression?: string | undefined;
  EventPattern?: string | undefined;
  Targets?: Target[] | undefined; // Made optional since ListRulesCommand doesn't provide Targets
}

// Base bus details from AWS SDK extended with rules
interface BusDetails {
  Arn: string;
  Name: string;
  Rules: RuleDetailsFromFile[];
  CreationTime?: Date | undefined;
  Policy?: string | undefined;
}

// UI-specific extension for display purposes
interface ExtendedEventBus extends BusDetails {
  stateLabel: string;
}

interface ExpandedBusContentProps {
  record: EventBus;
  onCollapse: () => void;
}

interface FormTag {
  Key: string;
  Value: string;
}

// Reusable Component for Tag Input
const TagInput: FC<{
  tag: FormTag;
  index: number;
  onRemove: (index: number) => void;
  getInputProps: (path: string) => any;
}> = ({ tag: _tag, index, onRemove, getInputProps }) => (
  <Group key={index} mb="xs" align="flex-end">
    <TextInput
      label="Key"
      placeholder="Tag Key"
      {...getInputProps(`tags.${index}.Key`)}
      required
      sx={{ flex: 1 }}
    />
    <TextInput
      label="Value"
      placeholder="Tag Value"
      {...getInputProps(`tags.${index}.Value`)}
      required
      sx={{ flex: 1 }}
    />
    <ActionIcon
      c="red"
      variant="filled"
      onClick={() => onRemove(index)}
      aria-label={`Remove tag ${index + 1}`}
    >
      <IconTrash size={16} />
    </ActionIcon>
  </Group>
);

// Reusable Component for Displaying JSON Code Blocks
const JsonCodeBlock: FC<{ jsonString: string }> = ({ jsonString }) => {
  let parsedJson = {};
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (error) {
    logError('Invalid JSON', { error });
  }

  return (
    <Box
      p="xs"
      bg="gray.1"
      style={{ borderRadius: '4px', whiteSpace: 'pre-wrap' }}
    >
      <Text size="xs" ff="monospace">
        {JSON.stringify(parsedJson, null, 2)}
      </Text>
    </Box>
  );
};

// Reusable Component for Displaying Targets
const TargetDisplay: FC<{ target: Target }> = ({ target }) => (
  <Group align="flex-start" key={target.Id}>
    <Text size="sm">•</Text>
    <Box>
      <Text size="sm" fw={500}>
        {target.Id}
      </Text>
      <Text size="xs" c="dimmed">
        ARN: {target.Arn}
      </Text>
      {target.RoleArn && (
        <Text size="xs" c="dimmed">
          Role: {target.RoleArn}
        </Text>
      )}
      {target.Input && <JsonCodeBlock jsonString={target.Input} />}
      {target.InputPath && (
        <Text size="xs" c="dimmed">
          Input Path: {target.InputPath}
        </Text>
      )}
      {target.InputTransformer && (
        <Box mt="xs">
          <Text size="xs" fw={500}>
            Input Transformer:
          </Text>
          <Stack gap="xs">
            <Box>
              <Text size="xs" fw={500}>
                Paths Map:
              </Text>
              <JsonCodeBlock
                jsonString={JSON.stringify(
                  target.InputTransformer.InputPathsMap,
                )}
              />
            </Box>
            <Box>
              <Text size="xs" fw={500}>
                Template:
              </Text>
              <JsonCodeBlock
                jsonString={target.InputTransformer.InputTemplate || ''}
              />
            </Box>
          </Stack>
        </Box>
      )}
    </Box>
  </Group>
);

// Reusable Component for Displaying Rules
const RuleDisplay: FC<{ rule: RuleDetailsFromFile }> = ({ rule }) => (
  <Box p="xs" bg="gray.0" style={{ borderRadius: '4px' }} key={rule.Name}>
    <Group align="center" mb="xs">
      <Text fw={500}>{rule.Name}</Text>
      <Badge c={rule.State === 'ENABLED' ? 'green' : 'red'}>
        {rule.State || 'UNKNOWN'}
      </Badge>
    </Group>
    {rule.Description && (
      <Text size="sm" c="dimmed" mb="xs">
        {rule.Description}
      </Text>
    )}
    {rule.ScheduleExpression && (
      <Text size="sm" mb="xs">
        Schedule: {rule.ScheduleExpression}
      </Text>
    )}
    {rule.EventPattern && <JsonCodeBlock jsonString={rule.EventPattern} />}
    {rule.Targets && rule.Targets.length > 0 && (
      <Box mt="xs">
        <Text size="sm" fw={500} mb="xs">
          Targets:
        </Text>
        <Stack gap="xs" ml="md">
          {rule.Targets.map((target) => (
            <TargetDisplay key={target.Id} target={target} />
          ))}
        </Stack>
      </Box>
    )}
  </Box>
);

export const ExpandedBusContent: FC<ExpandedBusContentProps> = memo(
  ({ record, onCollapse: _onCollapse }) => {
    const [busDetails, setBusDetails] = useState<ExtendedEventBus | null>(null);
    const [tags, setTags] = useState<AwsTag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [tagLoading, setTagLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<{ tags: FormTag[] }>({
      initialValues: {
        tags: [],
      },
      validate: {
        tags: (tags) =>
          tags.some((tag) => !tag.Key.trim() || !tag.Value.trim())
            ? 'All tags must have a key and a value.'
            : null,
      },
    });

    const loadDetailsAndTags = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        if (!record.Name) {
          throw new Error('Bus name is undefined.');
        }

        // Describe Event Bus
        const describeResponse = await DescribeEventBusCommand({
          Name: record.Name,
        });

        if (!describeResponse.Arn || !describeResponse.Name) {
          throw new Error('Described bus lacks necessary properties.');
        }

        // List Rules for the Event Bus
        const listRulesResponse = await ListRulesCommand({
          EventBusName: record.Name,
        });

        // List Tags for the Event Bus
        const listTagsResponse = await ListTagsForResourceCommand({
          ResourceARN: describeResponse.Arn, // Corrected property name
        });

        // Transform details into ExtendedEventBus
        const extendedDetails: ExtendedEventBus = {
          Arn: describeResponse.Arn,
          Name: describeResponse.Name,
          Rules:
            listRulesResponse.Rules?.map((rule) => ({
              Name: rule.Name || 'Unnamed Rule', // Ensure Name is string
              Description: rule.Description,
              State: rule.State,
              ScheduleExpression: rule.ScheduleExpression,
              EventPattern: rule.EventPattern,
              Targets: [], // Targets not provided by ListRulesCommand
            })) || [],
          CreationTime: describeResponse.CreationTime,
          Policy: describeResponse.Policy,
          stateLabel: 'Active', // Since EventBridge buses are typically active when created
        };

        setBusDetails(extendedDetails);

        const fetchedTags = listTagsResponse.Tags || [];
        setTags(fetchedTags);
        const formTags: FormTag[] = fetchedTags.map(
          (tag: { Key: any; Value: any }) => ({
            Key: tag.Key ?? '',
            Value: tag.Value ?? '',
          }),
        );
        form.setValues({ tags: formTags });
      } catch (err) {
        logError('Failed to load bus details', { err });
        setError('Failed to load bus details.');
      } finally {
        setLoading(false);
      }
    }, [record.Name, form]);

    useEffect(() => {
      if (record.Name) {
        loadDetailsAndTags();
      }
    }, [record.Name, loadDetailsAndTags]);

    const handleTagAdd = useCallback(() => {
      form.insertListItem('tags', { Key: '', Value: '' });
    }, [form]);

    const handleTagRemove = useCallback(
      (index: number) => {
        form.removeListItem('tags', index);
      },
      [form],
    );

    const handleSubmit = useCallback(
      async (values: { tags: FormTag[] }) => {
        setTagLoading(true);
        setError(null);
        try {
          if (!record.Name || !busDetails?.Arn) {
            throw new Error('Bus name or ARN is undefined.');
          }

          const existingTags = tags;
          const newTags = values.tags;

          const tagsToAdd: AwsTag[] = newTags.map((tag) => ({
            Key: tag.Key,
            Value: tag.Value,
          }));

          const tagsToRemove: string[] = existingTags
            .filter(
              (existingTag) =>
                !newTags.some(
                  (tag) =>
                    tag.Key === existingTag.Key &&
                    tag.Value === existingTag.Value,
                ),
            )
            .map((tag) => tag.Key)
            .filter((key): key is string => key !== undefined);

          // Tag new tags
          if (tagsToAdd.length > 0) {
            await TagResourceCommand({
              ResourceARN: busDetails.Arn, // Corrected property name
              Tags: tagsToAdd,
            });
          }

          // Untag removed tags
          if (tagsToRemove.length > 0) {
            await UntagResourceCommand({
              ResourceARN: busDetails.Arn, // Corrected property name
              TagKeys: tagsToRemove,
            });
          }

          // Refresh tags
          const refreshedTagsResponse = await ListTagsForResourceCommand({
            ResourceARN: busDetails.Arn, // Corrected property name
          });
          const updatedTags = refreshedTagsResponse.Tags || [];
          setTags(updatedTags);
          const updatedFormTags: FormTag[] = updatedTags.map(
            (tag: { Key: any; Value: any }) => ({
              Key: tag.Key ?? '',
              Value: tag.Value ?? '',
            }),
          );
          form.setValues({ tags: updatedFormTags });
        } catch (err) {
          logError('Failed to update tags', { err });
          setError('Failed to update tags.');
        } finally {
          setTagLoading(false);
        }
      },
      [tags, record.Name, form, busDetails],
    );

    return (
      <Box p="md">
        {loading ? (
          <Stack>
            <Skeleton height={50} />
            <Skeleton height={100} />
          </Stack>
        ) : busDetails ? (
          <Stack gap="md">
            <Grid>
              <Grid.Col span={12}>
                <Group>
                  <Badge c="blue">{busDetails.Name}</Badge>
                  <Text size="sm" c="dimmed">
                    ARN: {busDetails.Arn}
                  </Text>
                  {busDetails.CreationTime && (
                    <Text size="sm" c="dimmed">
                      Created:{' '}
                      {new Date(busDetails.CreationTime).toLocaleString()}
                    </Text>
                  )}
                  <Badge c="green">{busDetails.stateLabel}</Badge>
                </Group>
              </Grid.Col>
            </Grid>

            <Box>
              <Text fw={500} mb="xs">
                Tags:
              </Text>
              {error && (
                <Text c="red" size="sm" mb="xs">
                  {error}
                </Text>
              )}
              <form onSubmit={form.onSubmit(handleSubmit)}>
                {form.values.tags.map((tag, index) => (
                  <TagInput
                    key={`tag-${tag.Key || tag.Value || `idx-${index}`}`}
                    tag={tag}
                    index={index}
                    onRemove={handleTagRemove}
                    getInputProps={form.getInputProps}
                  />
                ))}
                <Group mt="xs">
                  <Button
                    leftSection={<IconPlus size={16} />}
                    variant="light"
                    onClick={handleTagAdd}
                    size="xs"
                    type="button"
                  >
                    Add Tag
                  </Button>
                  <Button loading={tagLoading} type="submit" size="xs">
                    Save Tags
                  </Button>
                </Group>
              </form>
            </Box>

            <Accordion variant="filled">
              <Accordion.Item value="rules">
                <Accordion.Control>
                  <Group gap="xs">
                    <Text>Rules</Text>
                    <Badge size="sm">{busDetails.Rules.length}</Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap="xs">
                    {busDetails.Rules.length === 0 ? (
                      <Text c="dimmed" ta="center" py="md">
                        No rules configured for this bus
                      </Text>
                    ) : (
                      busDetails.Rules.map((rule) => (
                        <RuleDisplay key={rule.Name} rule={rule} />
                      ))
                    )}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>

              {busDetails.Policy && (
                <Accordion.Item value="policy">
                  <Accordion.Control>Resource Policy</Accordion.Control>
                  <Accordion.Panel>
                    <JsonCodeBlock jsonString={busDetails.Policy} />
                  </Accordion.Panel>
                </Accordion.Item>
              )}
            </Accordion>
          </Stack>
        ) : (
          <Text c="red">Failed to load bus details.</Text>
        )}
      </Box>
    );
  },
);

ExpandedBusContent.displayName = 'ExpandedBusContent';

export default ExpandedBusContent;

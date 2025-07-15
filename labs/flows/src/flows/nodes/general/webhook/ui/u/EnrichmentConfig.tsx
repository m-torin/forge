import { FC } from 'react';
import {
  Stack,
  TextInput,
  Select,
  Group,
  Switch,
  NumberInput,
  Divider,
  Button,
  Text,
  Accordion,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useCombinedContext } from '#/flows/nodes/internal';
import { FormValues } from '../../formSchema';

export const EnrichmentConfig: FC = () => {
  const { form } = useCombinedContext<FormValues>();

  const hasValidation = form.values.metadata?.enrichment?.validatePayload;
  const hasCache = form.values.metadata?.enrichment?.enableCache;

  const addTransformationRule = () =>
    form.insertListItem('metadata.enrichment.transformationRules', {
      field: '',
      operation: 'map',
      target: '',
    });

  const removeTransformationRule = (index: number) =>
    form.removeListItem('metadata.enrichment.transformationRules', index);

  const addValidationRule = () =>
    form.insertListItem('metadata.enrichment.validationRules', {
      field: '',
      rule: '',
      message: '',
    });

  const removeValidationRule = (index: number) =>
    form.removeListItem('metadata.enrichment.validationRules', index);

  return (
    <>
      <Divider
        label="Enrichment Configuration"
        labelPosition="center"
        mt="xs"
      />

      <TextInput
        label="Webhook URL"
        description="External service URL for enrichment (optional)"
        {...form.getInputProps('metadata.enrichment.webhookUrl')}
      />

      <Select
        label="Enrichment Type"
        {...form.getInputProps('metadata.enrichment.enrichmentType')}
        data={[
          { value: 'transform', label: 'Transform Data' },
          { value: 'validate', label: 'Validate Data' },
          { value: 'filter', label: 'Filter Data' },
          { value: 'enrich', label: 'Enrich Data' },
        ]}
      />

      <Accordion variant="contained">
        <Accordion.Item value="transformation">
          <Accordion.Control>Transformation Rules</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Rules
                </Text>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<IconPlus size={14} />}
                  onClick={addTransformationRule}
                >
                  Add Rule
                </Button>
              </Group>

              {form.values.metadata?.enrichment?.transformationRules?.map(
                (rule, index) => (
                  <Group key={`rule-${rule?.field || `idx-${index}`}`} grow>
                    <TextInput
                      placeholder="Field"
                      size="xs"
                      {...form.getInputProps(
                        `metadata.enrichment.transformationRules.${index}.field`,
                      )}
                    />
                    <Select
                      placeholder="Operation"
                      size="xs"
                      {...form.getInputProps(
                        `metadata.enrichment.transformationRules.${index}.operation`,
                      )}
                      data={[
                        { value: 'map', label: 'Map' },
                        { value: 'merge', label: 'Merge' },
                        { value: 'filter', label: 'Filter' },
                        { value: 'validate', label: 'Validate' },
                      ]}
                    />
                    <TextInput
                      placeholder="Target"
                      size="xs"
                      {...form.getInputProps(
                        `metadata.enrichment.transformationRules.${index}.target`,
                      )}
                      rightSection={
                        <IconTrash
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeTransformationRule(index)}
                        />
                      }
                    />
                  </Group>
                ),
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="validation">
          <Accordion.Control>Validation Settings</Accordion.Control>
          <Accordion.Panel>
            <Stack gap="xs">
              <Switch
                label="Enable Payload Validation"
                {...form.getInputProps('metadata.enrichment.validatePayload', {
                  type: 'checkbox',
                })}
              />

              {hasValidation && (
                <>
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>
                      Validation Rules
                    </Text>
                    <Button
                      variant="light"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={addValidationRule}
                    >
                      Add Rule
                    </Button>
                  </Group>

                  {form.values.metadata?.enrichment?.validationRules?.map(
                    (validationRule, index) => (
                      <Group key={`validation-${validationRule?.field || `idx-${index}`}`} grow>
                        <TextInput
                          placeholder="Field"
                          size="xs"
                          {...form.getInputProps(
                            `metadata.enrichment.validationRules.${index}.field`,
                          )}
                        />
                        <TextInput
                          placeholder="Rule"
                          size="xs"
                          {...form.getInputProps(
                            `metadata.enrichment.validationRules.${index}.rule`,
                          )}
                        />
                        <TextInput
                          placeholder="Message"
                          size="xs"
                          {...form.getInputProps(
                            `metadata.enrichment.validationRules.${index}.message`,
                          )}
                          rightSection={
                            <IconTrash
                              size={14}
                              style={{ cursor: 'pointer' }}
                              onClick={() => removeValidationRule(index)}
                            />
                          }
                        />
                      </Group>
                    ),
                  )}
                </>
              )}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>

      <Stack gap="xs">
        <Switch
          label="Enable Response Caching"
          description="Cache responses for identical requests"
          {...form.getInputProps('metadata.enrichment.enableCache', {
            type: 'checkbox',
          })}
        />

        {hasCache && (
          <NumberInput
            label="Cache Duration"
            description="Time in seconds"
            min={60}
            max={86400}
            {...form.getInputProps('metadata.enrichment.cacheDuration')}
          />
        )}
      </Stack>

      <Group grow>
        <Select
          label="Max Request Size"
          description="Maximum allowed request size"
          {...form.getInputProps('metadata.enrichment.maxRequestSize')}
          data={[
            { value: '1mb', label: '1 MB' },
            { value: '5mb', label: '5 MB' },
            { value: '10mb', label: '10 MB' },
            { value: '50mb', label: '50 MB' },
            { value: 'unlimited', label: 'Unlimited' },
          ]}
        />
        <NumberInput
          label="Request Timeout"
          description="Timeout in seconds"
          min={1}
          max={300}
          {...form.getInputProps('metadata.enrichment.timeout')}
        />
      </Group>
    </>
  );
};

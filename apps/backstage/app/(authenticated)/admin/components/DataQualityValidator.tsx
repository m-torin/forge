'use client';

import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Paper,
  Progress,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconChartBar,
  IconCheck,
  IconEye,
  IconFileText,
  IconRefresh,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import type { ModelConfig } from '../lib/model-config';

interface ValidationRule {
  category: 'required' | 'format' | 'business' | 'consistency' | 'security';
  condition: (record: any) => boolean;
  description: string;
  field?: string;
  id: string;
  message: (record: any) => string;
  name: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  category: string;
  field?: string;
  message: string;
  ruleId: string;
  ruleName: string;
  severity: 'error' | 'warning' | 'info';
}

interface RecordValidation {
  errors: ValidationResult[];
  infos: ValidationResult[];
  isValid: boolean;
  record: any;
  recordId: string;
  score: number; // 0-100 quality score
  warnings: ValidationResult[];
}

interface DataQualityValidatorProps {
  modelConfig: ModelConfig;
  modelName: string;
  onValidationComplete?: (results: RecordValidation[]) => void;
  records: any[];
  showDetails?: boolean;
}

const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  // Required field rules
  {
    id: 'required-name',
    name: 'Name Required',
    category: 'required',
    condition: (record) => !record.name || record.name.trim() === '',
    description: 'Name field must not be empty',
    field: 'name',
    message: () => 'Name is required',
    severity: 'error',
  },
  {
    id: 'required-email',
    name: 'Email Required',
    category: 'required',
    condition: (record) =>
      record.email !== undefined && (!record.email || record.email.trim() === ''),
    description: 'Email field must not be empty',
    field: 'email',
    message: () => 'Email is required',
    severity: 'error',
  },

  // Format validation rules
  {
    id: 'email-format',
    name: 'Valid Email Format',
    category: 'format',
    condition: (record) => {
      if (!record.email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(record.email);
    },
    description: 'Email must be in valid format',
    field: 'email',
    message: () => 'Email format is invalid',
    severity: 'error',
  },
  {
    id: 'phone-format',
    name: 'Valid Phone Format',
    category: 'format',
    condition: (record) => {
      if (!record.phone && !record.phoneNumber) return false;
      const phone = record.phone || record.phoneNumber;
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phone && !phoneRegex.test(phone.replace(/\s/g, ''));
    },
    description: 'Phone number should be in valid format',
    field: 'phone',
    message: () => 'Phone number format may be invalid',
    severity: 'warning',
  },

  // Business logic rules
  {
    id: 'future-date',
    name: 'No Future Dates',
    category: 'business',
    condition: (record) => {
      if (!record.createdAt) return false;
      return new Date(record.createdAt) > new Date();
    },
    description: 'Created date should not be in the future',
    field: 'createdAt',
    message: () => 'Created date is in the future',
    severity: 'warning',
  },
  {
    id: 'negative-price',
    name: 'Positive Price',
    category: 'business',
    condition: (record) => {
      if (record.price === undefined || record.price === null) return false;
      return Number(record.price) < 0;
    },
    description: 'Price should be positive',
    field: 'price',
    message: () => 'Price cannot be negative',
    severity: 'error',
  },

  // Consistency rules
  {
    id: 'updated-after-created',
    name: 'Updated After Created',
    category: 'consistency',
    condition: (record) => {
      if (!record.createdAt || !record.updatedAt) return false;
      return new Date(record.updatedAt) < new Date(record.createdAt);
    },
    description: 'Updated date should be after created date',
    message: () => 'Updated date is before created date',
    severity: 'warning',
  },

  // Security rules
  {
    id: 'sensitive-data-exposure',
    name: 'Sensitive Data Check',
    category: 'security',
    condition: (record) => {
      const sensitivePatterns = [
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN
        /sk_[a-zA-Z0-9]{24,}/, // API key
      ];

      const recordString = JSON.stringify(record).toLowerCase();
      return sensitivePatterns.some((pattern) => pattern.test(recordString));
    },
    description: 'Check for exposed sensitive data',
    message: () => 'Potential sensitive data detected',
    severity: 'error',
  },
];

export function DataQualityValidator({
  onValidationComplete,
  modelConfig,
  modelName,
  records,
  showDetails = true,
}: DataQualityValidatorProps) {
  const [validationResults, setValidationResults] = useState<RecordValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordValidation | null>(null);
  const [detailsOpened, { close: closeDetails, open: openDetails }] = useDisclosure(false);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);

  // Initialize validation rules based on model
  useEffect(() => {
    const modelSpecificRules = DEFAULT_VALIDATION_RULES.filter((rule) => {
      if (rule.field) {
        return modelConfig.fields.some((field) => field.name === rule.field);
      }
      return true;
    });

    // Add model-specific custom rules
    const customRules = generateModelSpecificRules(modelConfig);
    setValidationRules([...modelSpecificRules, ...customRules]);
  }, [modelConfig]);

  // Run validation when records change
  useEffect(() => {
    if (records.length > 0 && validationRules.length > 0) {
      runValidation();
    }
  }, [records, validationRules]);

  const generateModelSpecificRules = (config: ModelConfig): ValidationRule[] => {
    const rules: ValidationRule[] = [];

    // Generate required field rules for model
    config.fields.forEach((field) => {
      if (field.required) {
        rules.push({
          id: `required-${field.name}`,
          name: `${field.label} Required`,
          category: 'required',
          condition: (record) => {
            const value = record[field.name];
            return (
              value === null ||
              value === undefined ||
              (typeof value === 'string' && value.trim() === '')
            );
          },
          description: `${field.label} field is required`,
          field: field.name,
          message: () => `${field.label} is required`,
          severity: 'error',
        });
      }

      // Add type-specific validations
      if (field.type === 'email') {
        rules.push({
          id: `email-format-${field.name}`,
          name: `Valid ${field.label} Format`,
          category: 'format',
          condition: (record) => {
            const email = record[field.name];
            if (!email) return false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !emailRegex.test(email);
          },
          description: `${field.label} must be a valid email`,
          field: field.name,
          message: () => `${field.label} format is invalid`,
          severity: 'error',
        });
      }
    });

    return rules;
  };

  const runValidation = async () => {
    setIsValidating(true);

    try {
      const results: RecordValidation[] = records.map((record) => {
        const errors: ValidationResult[] = [];
        const warnings: ValidationResult[] = [];
        const infos: ValidationResult[] = [];

        validationRules.forEach((rule) => {
          try {
            if (rule.condition(record)) {
              const result: ValidationResult = {
                category: rule.category,
                field: rule.field,
                message: rule.message(record),
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
              };

              switch (rule.severity) {
                case 'error':
                  errors.push(result);
                  break;
                case 'warning':
                  warnings.push(result);
                  break;
                case 'info':
                  infos.push(result);
                  break;
              }
            }
          } catch (error) {
            console.error(`Validation rule ${rule.id} failed:`, error);
          }
        });

        // Calculate quality score (0-100)
        const totalIssues = errors.length + warnings.length * 0.5 + infos.length * 0.1;
        const maxPossibleIssues = validationRules.length;
        const score = Math.max(0, Math.round((1 - totalIssues / maxPossibleIssues) * 100));

        return {
          isValid: errors.length === 0,
          errors,
          infos,
          record,
          recordId: record.id || `record-${Math.random()}`,
          score,
          warnings,
        };
      });

      setValidationResults(results);
      onValidationComplete?.(results);
    } catch (error) {
      notifications.show({
        color: 'red',
        message: 'Failed to run data quality validation',
        title: 'Validation Error',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getOverallStats = () => {
    const total = validationResults.length;
    const valid = validationResults.filter((r) => r.isValid).length;
    const hasWarnings = validationResults.filter((r) => r.warnings.length > 0).length;
    const hasErrors = validationResults.filter((r) => r.errors.length > 0).length;

    const avgScore =
      total > 0 ? Math.round(validationResults.reduce((sum, r) => sum + r.score, 0) / total) : 0;

    return { valid, avgScore, hasErrors, hasWarnings, total };
  };

  const stats = getOverallStats();

  const viewRecordDetails = (validation: RecordValidation) => {
    setSelectedRecord(validation);
    openDetails();
  };

  if (records.length === 0) {
    return (
      <Alert color="blue" icon={<IconFileText size={16} />}>
        No records to validate. Load some data first.
      </Alert>
    );
  }

  return (
    <>
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <ThemeIcon color="blue" size="sm" variant="light">
                <IconChartBar size={16} />
              </ThemeIcon>
              <Text fw={600}>Data Quality Report</Text>
              <Badge size="sm" variant="light">
                {stats.total} records
              </Badge>
            </Group>

            <Button
              leftSection={<IconRefresh size={14} />}
              loading={isValidating}
              onClick={runValidation}
              size="xs"
              variant="light"
            >
              Re-validate
            </Button>
          </Group>

          {/* Overall Statistics */}
          <Paper withBorder p="sm">
            <Group justify="space-between">
              <Stack gap="xs">
                <Text fw={500} size="sm">
                  Quality Score
                </Text>
                <Group gap="xs">
                  <Text
                    c={stats.avgScore >= 80 ? 'green' : stats.avgScore >= 60 ? 'orange' : 'red'}
                    fw={700}
                    size="xl"
                  >
                    {stats.avgScore}%
                  </Text>
                  <Progress
                    color={stats.avgScore >= 80 ? 'green' : stats.avgScore >= 60 ? 'orange' : 'red'}
                    style={{ minWidth: 100, flex: 1 }}
                    size="sm"
                    value={stats.avgScore}
                  />
                </Group>
              </Stack>

              <Group gap="xl">
                <Stack align="center" gap="xs">
                  <Text c="dimmed" size="xs">
                    Valid
                  </Text>
                  <Group gap="xs">
                    <ThemeIcon color="green" size="sm" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text fw={600}>{stats.valid}</Text>
                  </Group>
                </Stack>

                <Stack align="center" gap="xs">
                  <Text c="dimmed" size="xs">
                    Warnings
                  </Text>
                  <Group gap="xs">
                    <ThemeIcon color="orange" size="sm" variant="light">
                      <IconAlertTriangle size={12} />
                    </ThemeIcon>
                    <Text fw={600}>{stats.hasWarnings}</Text>
                  </Group>
                </Stack>

                <Stack align="center" gap="xs">
                  <Text c="dimmed" size="xs">
                    Errors
                  </Text>
                  <Group gap="xs">
                    <ThemeIcon color="red" size="sm" variant="light">
                      <IconX size={12} />
                    </ThemeIcon>
                    <Text fw={600}>{stats.hasErrors}</Text>
                  </Group>
                </Stack>
              </Group>
            </Group>
          </Paper>

          {/* Validation Results */}
          {showDetails && validationResults.length > 0 && (
            <Stack gap="sm">
              <Divider label="Validation Details" />

              <ScrollArea h={400}>
                <Stack gap="xs">
                  {validationResults.slice(0, 50).map((validation, index) => (
                    <Paper key={validation.recordId} withBorder p="sm">
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Badge
                            color={validation.isValid ? 'green' : 'red'}
                            size="sm"
                            variant="light"
                          >
                            Record #{index + 1}
                          </Badge>

                          <Group gap="xs">
                            {validation.errors.length > 0 && (
                              <Badge color="red" size="xs" variant="filled">
                                {validation.errors.length} errors
                              </Badge>
                            )}
                            {validation.warnings.length > 0 && (
                              <Badge color="orange" size="xs" variant="filled">
                                {validation.warnings.length} warnings
                              </Badge>
                            )}
                          </Group>

                          <Text c="dimmed" size="xs">
                            Score: {validation.score}%
                          </Text>
                        </Group>

                        <ActionIcon
                          onClick={() => viewRecordDetails(validation)}
                          size="sm"
                          variant="subtle"
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Group>

                      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                        <Stack gap="xs" mt="xs">
                          {validation.errors.slice(0, 2).map((error, i) => (
                            <Alert key={i} color="red" icon={<IconX size={12} />} size="xs">
                              <Text size="xs">{error.message}</Text>
                            </Alert>
                          ))}
                          {validation.warnings.slice(0, 1).map((warning, i) => (
                            <Alert
                              key={i}
                              color="orange"
                              icon={<IconAlertTriangle size={12} />}
                              size="xs"
                            >
                              <Text size="xs">{warning.message}</Text>
                            </Alert>
                          ))}
                          {(validation.errors.length > 2 || validation.warnings.length > 1) && (
                            <Text c="dimmed" size="xs">
                              ... and{' '}
                              {validation.errors.length - 2 + (validation.warnings.length - 1)} more
                              issues
                            </Text>
                          )}
                        </Stack>
                      )}
                    </Paper>
                  ))}

                  {validationResults.length > 50 && (
                    <Text c="dimmed" size="sm" ta="center">
                      Showing first 50 records. {validationResults.length - 50} more records
                      available.
                    </Text>
                  )}
                </Stack>
              </ScrollArea>
            </Stack>
          )}
        </Stack>
      </Card>

      {/* Record Details Modal */}
      <Modal
        onClose={closeDetails}
        opened={detailsOpened}
        scrollAreaComponent={ScrollArea.Autosize}
        size="lg"
        title="Record Validation Details"
      >
        {selectedRecord && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Record Quality Score: {selectedRecord.score}%</Text>
              <Badge color={selectedRecord.isValid ? 'green' : 'red'} variant="light">
                {selectedRecord.isValid ? 'Valid' : 'Has Issues'}
              </Badge>
            </Group>

            {selectedRecord.errors.length > 0 && (
              <Stack gap="xs">
                <Text c="red" fw={500}>
                  Errors ({selectedRecord.errors.length})
                </Text>
                {selectedRecord.errors.map((error, index) => (
                  <Alert key={index} color="red" icon={<IconX size={16} />}>
                    <Text fw={500}>{error.ruleName}</Text>
                    <Text size="sm">{error.message}</Text>
                    {error.field && (
                      <Text c="dimmed" size="xs">
                        Field: {error.field}
                      </Text>
                    )}
                  </Alert>
                ))}
              </Stack>
            )}

            {selectedRecord.warnings.length > 0 && (
              <Stack gap="xs">
                <Text c="orange" fw={500}>
                  Warnings ({selectedRecord.warnings.length})
                </Text>
                {selectedRecord.warnings.map((warning, index) => (
                  <Alert key={index} color="orange" icon={<IconAlertTriangle size={16} />}>
                    <Text fw={500}>{warning.ruleName}</Text>
                    <Text size="sm">{warning.message}</Text>
                    {warning.field && (
                      <Text c="dimmed" size="xs">
                        Field: {warning.field}
                      </Text>
                    )}
                  </Alert>
                ))}
              </Stack>
            )}

            {selectedRecord.infos.length > 0 && (
              <Stack gap="xs">
                <Text c="blue" fw={500}>
                  Information ({selectedRecord.infos.length})
                </Text>
                {selectedRecord.infos.map((info, index) => (
                  <Alert key={index} color="blue" icon={<IconFileText size={16} />}>
                    <Text fw={500}>{info.ruleName}</Text>
                    <Text size="sm">{info.message}</Text>
                    {info.field && (
                      <Text c="dimmed" size="xs">
                        Field: {info.field}
                      </Text>
                    )}
                  </Alert>
                ))}
              </Stack>
            )}

            {selectedRecord.isValid && (
              <Alert color="green" icon={<IconCheck size={16} />}>
                This record passed all validation checks.
              </Alert>
            )}
          </Stack>
        )}
      </Modal>
    </>
  );
}

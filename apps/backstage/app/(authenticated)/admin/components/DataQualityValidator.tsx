'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Stack,
  Group,
  Text,
  Alert,
  Button,
  Badge,
  Progress,
  Accordion,
  List,
  ThemeIcon,
  ActionIcon,
  Modal,
  Textarea,
  Box,
  Paper,
  Divider,
  Tooltip,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconEye,
  IconShield,
  IconClock,
  IconUser,
  IconFileText,
  IconRefresh,
  IconBulk,
  IconChartBar,
} from '@tabler/icons-react';
import type { ModelConfig } from '../lib/model-config';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: 'required' | 'format' | 'business' | 'consistency' | 'security';
  field?: string;
  condition: (record: any) => boolean;
  message: (record: any) => string;
}

interface ValidationResult {
  ruleId: string;
  ruleName: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
  category: string;
}

interface RecordValidation {
  recordId: string;
  record: any;
  isValid: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
  infos: ValidationResult[];
  score: number; // 0-100 quality score
}

interface DataQualityValidatorProps {
  modelName: string;
  modelConfig: ModelConfig;
  records: any[];
  onValidationComplete?: (results: RecordValidation[]) => void;
  showDetails?: boolean;
}

const DEFAULT_VALIDATION_RULES: ValidationRule[] = [
  // Required field rules
  {
    id: 'required-name',
    name: 'Name Required',
    description: 'Name field must not be empty',
    severity: 'error',
    category: 'required',
    field: 'name',
    condition: (record) => !record.name || record.name.trim() === '',
    message: () => 'Name is required',
  },
  {
    id: 'required-email',
    name: 'Email Required',
    description: 'Email field must not be empty',
    severity: 'error',
    category: 'required',
    field: 'email',
    condition: (record) => record.email !== undefined && (!record.email || record.email.trim() === ''),
    message: () => 'Email is required',
  },

  // Format validation rules
  {
    id: 'email-format',
    name: 'Valid Email Format',
    description: 'Email must be in valid format',
    severity: 'error',
    category: 'format',
    field: 'email',
    condition: (record) => {
      if (!record.email) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return !emailRegex.test(record.email);
    },
    message: () => 'Email format is invalid',
  },
  {
    id: 'phone-format',
    name: 'Valid Phone Format',
    description: 'Phone number should be in valid format',
    severity: 'warning',
    category: 'format',
    field: 'phone',
    condition: (record) => {
      if (!record.phone && !record.phoneNumber) return false;
      const phone = record.phone || record.phoneNumber;
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      return phone && !phoneRegex.test(phone.replace(/\s/g, ''));
    },
    message: () => 'Phone number format may be invalid',
  },

  // Business logic rules
  {
    id: 'future-date',
    name: 'No Future Dates',
    description: 'Created date should not be in the future',
    severity: 'warning',
    category: 'business',
    field: 'createdAt',
    condition: (record) => {
      if (!record.createdAt) return false;
      return new Date(record.createdAt) > new Date();
    },
    message: () => 'Created date is in the future',
  },
  {
    id: 'negative-price',
    name: 'Positive Price',
    description: 'Price should be positive',
    severity: 'error',
    category: 'business',
    field: 'price',
    condition: (record) => {
      if (record.price === undefined || record.price === null) return false;
      return Number(record.price) < 0;
    },
    message: () => 'Price cannot be negative',
  },

  // Consistency rules
  {
    id: 'updated-after-created',
    name: 'Updated After Created',
    description: 'Updated date should be after created date',
    severity: 'warning',
    category: 'consistency',
    condition: (record) => {
      if (!record.createdAt || !record.updatedAt) return false;
      return new Date(record.updatedAt) < new Date(record.createdAt);
    },
    message: () => 'Updated date is before created date',
  },

  // Security rules
  {
    id: 'sensitive-data-exposure',
    name: 'Sensitive Data Check',
    description: 'Check for exposed sensitive data',
    severity: 'error',
    category: 'security',
    condition: (record) => {
      const sensitivePatterns = [
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
        /\b\d{3}-\d{2}-\d{4}\b/, // SSN
        /sk_[a-zA-Z0-9]{24,}/, // API key
      ];
      
      const recordString = JSON.stringify(record).toLowerCase();
      return sensitivePatterns.some(pattern => pattern.test(recordString));
    },
    message: () => 'Potential sensitive data detected',
  },
];

export function DataQualityValidator({
  modelName,
  modelConfig,
  records,
  onValidationComplete,
  showDetails = true,
}: DataQualityValidatorProps) {
  const [validationResults, setValidationResults] = useState<RecordValidation[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<RecordValidation | null>(null);
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false);
  const [validationRules, setValidationRules] = useState<ValidationRule[]>([]);

  // Initialize validation rules based on model
  useEffect(() => {
    const modelSpecificRules = DEFAULT_VALIDATION_RULES.filter(rule => {
      if (rule.field) {
        return modelConfig.fields.some(field => field.name === rule.field);
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
    config.fields.forEach(field => {
      if (field.required) {
        rules.push({
          id: `required-${field.name}`,
          name: `${field.label} Required`,
          description: `${field.label} field is required`,
          severity: 'error',
          category: 'required',
          field: field.name,
          condition: (record) => {
            const value = record[field.name];
            return value === null || value === undefined || 
                   (typeof value === 'string' && value.trim() === '');
          },
          message: () => `${field.label} is required`,
        });
      }

      // Add type-specific validations
      if (field.type === 'email') {
        rules.push({
          id: `email-format-${field.name}`,
          name: `Valid ${field.label} Format`,
          description: `${field.label} must be a valid email`,
          severity: 'error',
          category: 'format',
          field: field.name,
          condition: (record) => {
            const email = record[field.name];
            if (!email) return false;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return !emailRegex.test(email);
          },
          message: () => `${field.label} format is invalid`,
        });
      }
    });

    return rules;
  };

  const runValidation = async () => {
    setIsValidating(true);
    
    try {
      const results: RecordValidation[] = records.map(record => {
        const errors: ValidationResult[] = [];
        const warnings: ValidationResult[] = [];
        const infos: ValidationResult[] = [];

        validationRules.forEach(rule => {
          try {
            if (rule.condition(record)) {
              const result: ValidationResult = {
                ruleId: rule.id,
                ruleName: rule.name,
                severity: rule.severity,
                message: rule.message(record),
                field: rule.field,
                category: rule.category,
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
          recordId: record.id || `record-${Math.random()}`,
          record,
          isValid: errors.length === 0,
          errors,
          warnings,
          infos,
          score,
        };
      });

      setValidationResults(results);
      onValidationComplete?.(results);
    } catch (error) {
      notifications.show({
        title: 'Validation Error',
        message: 'Failed to run data quality validation',
        color: 'red',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const getOverallStats = () => {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.isValid).length;
    const hasWarnings = validationResults.filter(r => r.warnings.length > 0).length;
    const hasErrors = validationResults.filter(r => r.errors.length > 0).length;
    
    const avgScore = total > 0 
      ? Math.round(validationResults.reduce((sum, r) => sum + r.score, 0) / total)
      : 0;

    return { total, valid, hasWarnings, hasErrors, avgScore };
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
              <ThemeIcon size="sm" variant="light" color="blue">
                <IconChartBar size={16} />
              </ThemeIcon>
              <Text fw={600}>Data Quality Report</Text>
              <Badge size="sm" variant="light">
                {stats.total} records
              </Badge>
            </Group>
            
            <Button
              variant="light"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={runValidation}
              loading={isValidating}
            >
              Re-validate
            </Button>
          </Group>

          {/* Overall Statistics */}
          <Paper p="sm" withBorder>
            <Group justify="space-between">
              <Stack gap="xs">
                <Text size="sm" fw={500}>Quality Score</Text>
                <Group gap="xs">
                  <Text size="xl" fw={700} c={stats.avgScore >= 80 ? 'green' : stats.avgScore >= 60 ? 'orange' : 'red'}>
                    {stats.avgScore}%
                  </Text>
                  <Progress 
                    value={stats.avgScore} 
                    size="sm" 
                    color={stats.avgScore >= 80 ? 'green' : stats.avgScore >= 60 ? 'orange' : 'red'}
                    style={{ flex: 1, minWidth: 100 }}
                  />
                </Group>
              </Stack>

              <Group gap="xl">
                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed">Valid</Text>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="green" variant="light">
                      <IconCheck size={12} />
                    </ThemeIcon>
                    <Text fw={600}>{stats.valid}</Text>
                  </Group>
                </Stack>

                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed">Warnings</Text>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="orange" variant="light">
                      <IconAlertTriangle size={12} />
                    </ThemeIcon>
                    <Text fw={600}>{stats.hasWarnings}</Text>
                  </Group>
                </Stack>

                <Stack gap="xs" align="center">
                  <Text size="xs" c="dimmed">Errors</Text>
                  <Group gap="xs">
                    <ThemeIcon size="sm" color="red" variant="light">
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
                    <Paper key={validation.recordId} p="sm" withBorder>
                      <Group justify="space-between">
                        <Group gap="sm">
                          <Badge 
                            size="sm" 
                            color={validation.isValid ? 'green' : 'red'}
                            variant="light"
                          >
                            Record #{index + 1}
                          </Badge>
                          
                          <Group gap="xs">
                            {validation.errors.length > 0 && (
                              <Badge size="xs" color="red" variant="filled">
                                {validation.errors.length} errors
                              </Badge>
                            )}
                            {validation.warnings.length > 0 && (
                              <Badge size="xs" color="orange" variant="filled">
                                {validation.warnings.length} warnings
                              </Badge>
                            )}
                          </Group>

                          <Text size="xs" c="dimmed">
                            Score: {validation.score}%
                          </Text>
                        </Group>

                        <ActionIcon
                          variant="subtle"
                          size="sm"
                          onClick={() => viewRecordDetails(validation)}
                        >
                          <IconEye size={14} />
                        </ActionIcon>
                      </Group>

                      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                        <Stack gap="xs" mt="xs">
                          {validation.errors.slice(0, 2).map((error, i) => (
                            <Alert key={i} color="red" size="xs" icon={<IconX size={12} />}>
                              <Text size="xs">{error.message}</Text>
                            </Alert>
                          ))}
                          {validation.warnings.slice(0, 1).map((warning, i) => (
                            <Alert key={i} color="orange" size="xs" icon={<IconAlertTriangle size={12} />}>
                              <Text size="xs">{warning.message}</Text>
                            </Alert>
                          ))}
                          {(validation.errors.length > 2 || validation.warnings.length > 1) && (
                            <Text size="xs" c="dimmed">
                              ... and {(validation.errors.length - 2) + (validation.warnings.length - 1)} more issues
                            </Text>
                          )}
                        </Stack>
                      )}
                    </Paper>
                  ))}

                  {validationResults.length > 50 && (
                    <Text size="sm" c="dimmed" ta="center">
                      Showing first 50 records. {validationResults.length - 50} more records available.
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
        opened={detailsOpened}
        onClose={closeDetails}
        title="Record Validation Details"
        size="lg"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        {selectedRecord && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={600}>Record Quality Score: {selectedRecord.score}%</Text>
              <Badge 
                color={selectedRecord.isValid ? 'green' : 'red'}
                variant="light"
              >
                {selectedRecord.isValid ? 'Valid' : 'Has Issues'}
              </Badge>
            </Group>

            {selectedRecord.errors.length > 0 && (
              <Stack gap="xs">
                <Text fw={500} c="red">Errors ({selectedRecord.errors.length})</Text>
                {selectedRecord.errors.map((error, index) => (
                  <Alert key={index} color="red" icon={<IconX size={16} />}>
                    <Text fw={500}>{error.ruleName}</Text>
                    <Text size="sm">{error.message}</Text>
                    {error.field && (
                      <Text size="xs" c="dimmed">Field: {error.field}</Text>
                    )}
                  </Alert>
                ))}
              </Stack>
            )}

            {selectedRecord.warnings.length > 0 && (
              <Stack gap="xs">
                <Text fw={500} c="orange">Warnings ({selectedRecord.warnings.length})</Text>
                {selectedRecord.warnings.map((warning, index) => (
                  <Alert key={index} color="orange" icon={<IconAlertTriangle size={16} />}>
                    <Text fw={500}>{warning.ruleName}</Text>
                    <Text size="sm">{warning.message}</Text>
                    {warning.field && (
                      <Text size="xs" c="dimmed">Field: {warning.field}</Text>
                    )}
                  </Alert>
                ))}
              </Stack>
            )}

            {selectedRecord.infos.length > 0 && (
              <Stack gap="xs">
                <Text fw={500} c="blue">Information ({selectedRecord.infos.length})</Text>
                {selectedRecord.infos.map((info, index) => (
                  <Alert key={index} color="blue" icon={<IconFileText size={16} />}>
                    <Text fw={500}>{info.ruleName}</Text>
                    <Text size="sm">{info.message}</Text>
                    {info.field && (
                      <Text size="xs" c="dimmed">Field: {info.field}</Text>
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
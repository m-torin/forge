'use client';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  DateInput,
  Group,
  JsonInput,
  MultiSelect,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  TimeInput,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconEye, IconEyeOff, IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';

import { getRelationshipConfig } from '../lib/relationship-editor-config';
import { isFieldSensitive, matchesSensitivePattern } from '../lib/security-config';

import { RelationshipEditor } from './RelationshipEditor';

import type { ModelConfig } from '../lib/model-config';

interface FormFieldProps {
  availableRelatedData?: Record<string, any[]>;
  entityId?: string;
  error?: string;
  field: any;
  modelConfig?: ModelConfig;
  onChange: (value: any) => void;
  onRelationshipChange?: (relationshipName: string, data: any[]) => void;
  value: any;
}

export function EnhancedFormField({
  availableRelatedData,
  entityId,
  error,
  field,
  modelConfig,
  onChange,
  onRelationshipChange,
  value,
}: FormFieldProps) {
  const [showSensitive, setShowSensitive] = useState(false);
  const [jsonError, setJsonError] = useState<string>('');

  // Handle JSON validation
  const handleJsonChange = (jsonValue: string) => {
    try {
      // Validate JSON
      if (jsonValue.trim()) {
        JSON.parse(jsonValue);
      }
      setJsonError('');
      onChange(jsonValue);
    } catch (err) {
      setJsonError('Invalid JSON format');
      onChange(jsonValue);
    }
  };

  // Check if field is sensitive using security configuration
  const isSensitiveField = (fieldName: string, modelName?: string): boolean => {
    // First check the security configuration if model is provided
    if (modelName) {
      const configSensitive = isFieldSensitive(modelName, fieldName);
      if (configSensitive) return true;
    }

    // Fallback to pattern matching
    return matchesSensitivePattern(fieldName);
  };

  // Handle relationship fields
  if (field.type === 'relation' && modelConfig && entityId) {
    const relationshipConfig = getRelationshipConfig(
      modelConfig.name.toLowerCase().replace(/\s+/g, ''),
      field.name,
    );

    if (relationshipConfig && availableRelatedData) {
      const relatedEntities = availableRelatedData[field.relationModel] || [];
      const currentRelationships = Array.isArray(value) ? value : [];

      return (
        <Box mb="md">
          <RelationshipEditor
            config={relationshipConfig}
            currentRelationships={currentRelationships}
            onRelationshipChange={(relationships) => {
              onChange(relationships);
              if (onRelationshipChange) {
                onRelationshipChange(field.name, relationships);
              }
            }}
            availableEntities={relatedEntities}
            primaryEntityId={entityId}
          />
          {error && (
            <Text c="red" mt="xs" size="sm">
              {error}
            </Text>
          )}
        </Box>
      );
    }

    // Fallback to simple select for relations without config
    return (
      <Select
        description={field.description}
        error={error}
        onChange={onChange}
        placeholder={`Select ${field.label}`}
        clearable
        data={
          availableRelatedData?.[field.relationModel]?.map((item: any) => ({
            label: item.name || item.title || item.email || item.id,
            value: item.id,
          })) || []
        }
        label={field.label}
        required={field.required}
        searchable
        value={value || ''}
      />
    );
  }

  // Handle sensitive fields with special UI
  if (isSensitiveField(field.name, modelConfig?.name)) {
    return (
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={500} size="sm">
            {field.label}
            {field.required && (
              <Text component="span" c="red">
                {' '}
                *
              </Text>
            )}
          </Text>
          <Button
            leftSection={showSensitive ? <IconEyeOff size={14} /> : <IconEye size={14} />}
            onClick={() => setShowSensitive(!showSensitive)}
            size="xs"
            variant="subtle"
          >
            {showSensitive ? 'Hide' : 'Show'}
          </Button>
        </Group>

        <Alert color="yellow" icon={<IconInfoCircle size={16} />} variant="light">
          Sensitive data - handle with care
        </Alert>

        {showSensitive ? (
          <TextInput
            description={field.description}
            error={error}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            value={value || ''}
          />
        ) : (
          <TextInput
            description="Click 'Show' to view/edit sensitive data"
            placeholder="Hidden for security"
            readOnly
            value={value ? '••••••••••••••••' : ''}
          />
        )}
      </Stack>
    );
  }

  // Regular field rendering based on type
  switch (field.type) {
    case 'text':
      return (
        <TextInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          label={field.label}
          maxLength={field.maxLength}
          required={field.required}
          value={value || ''}
        />
      );

    case 'email':
      return (
        <TextInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'user@example.com'}
          label={field.label}
          required={field.required}
          type="email"
          value={value || ''}
        />
      );

    case 'password':
      return (
        <PasswordInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          label={field.label}
          required={field.required}
          value={value || ''}
        />
      );

    case 'textarea':
      return (
        <Textarea
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows || 3}
          label={field.label}
          maxLength={field.maxLength}
          required={field.required}
          value={value || ''}
        />
      );

    case 'number':
      return (
        <NumberInput
          description={field.description}
          error={error}
          onChange={onChange}
          placeholder={field.placeholder}
          precision={field.precision}
          label={field.label}
          max={field.max}
          min={field.min}
          required={field.required}
          step={field.step}
          value={value || 0}
        />
      );

    case 'select':
      return (
        <Select
          description={field.description}
          error={error}
          onChange={onChange}
          placeholder={field.placeholder || `Select ${field.label}`}
          clearable={field.clearable}
          data={field.options || []}
          label={field.label}
          required={field.required}
          searchable={field.searchable}
          value={value || ''}
        />
      );

    case 'multiselect':
      return (
        <MultiSelect
          description={field.description}
          error={error}
          onChange={onChange}
          placeholder={field.placeholder || `Select ${field.label}`}
          clearable={field.clearable}
          data={field.options || []}
          label={field.label}
          maxValues={field.maxValues}
          required={field.required}
          searchable={field.searchable}
          value={value || []}
        />
      );

    case 'tags':
      return (
        <TagsInput
          description={field.description}
          error={error}
          onChange={onChange}
          placeholder={field.placeholder || 'Enter tags'}
          label={field.label}
          maxTags={field.maxTags}
          required={field.required}
          value={value || []}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.checked)}
          checked={Boolean(value)}
          label={field.label}
        />
      );

    case 'switch':
      return (
        <Switch
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.checked)}
          checked={Boolean(value)}
          label={field.label}
        />
      );

    case 'date':
      return (
        <DateInput
          description={field.description}
          error={error}
          onChange={(date) => onChange(date?.toISOString().split('T')[0])}
          placeholder={field.placeholder || 'Pick date'}
          label={field.label}
          maxDate={field.maxDate ? new Date(field.maxDate) : undefined}
          minDate={field.minDate ? new Date(field.minDate) : undefined}
          required={field.required}
          value={value ? new Date(value) : null}
        />
      );

    case 'datetime':
      return (
        <DateTimePicker
          description={field.description}
          error={error}
          onChange={(date) => onChange(date?.toISOString())}
          placeholder={field.placeholder || 'Pick date and time'}
          label={field.label}
          maxDate={field.maxDate ? new Date(field.maxDate) : undefined}
          minDate={field.minDate ? new Date(field.minDate) : undefined}
          required={field.required}
          value={value ? new Date(value) : null}
        />
      );

    case 'time':
      return (
        <TimeInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
          required={field.required}
          value={value || ''}
        />
      );

    case 'json':
      return (
        <Stack gap="xs">
          <JsonInput
            validationError="Invalid JSON"
            autosize
            description={field.description}
            error={error || jsonError}
            formatOnBlur
            maxRows={field.maxRows || 10}
            minRows={field.minRows || 3}
            onChange={handleJsonChange}
            placeholder={field.placeholder || '{}'}
            rows={field.rows || 4}
            label={field.label}
            required={field.required}
            value={value || ''}
          />
          {jsonError && (
            <Text c="red" size="sm">
              {jsonError}
            </Text>
          )}
        </Stack>
      );

    case 'url':
      return (
        <TextInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://example.com'}
          label={field.label}
          required={field.required}
          type="url"
          value={value || ''}
        />
      );

    case 'color':
      return (
        <TextInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          label={field.label}
          required={field.required}
          type="color"
          value={value || '#000000'}
        />
      );

    case 'range':
      return (
        <NumberInput
          description={field.description}
          error={error}
          onChange={onChange}
          label={field.label}
          max={field.max}
          min={field.min}
          required={field.required}
          step={field.step || 1}
          value={value || field.min || 0}
        />
      );

    case 'file':
      return (
        <Stack gap="xs">
          <Text fw={500} size="sm">
            {field.label}
            {field.required && (
              <Text component="span" c="red">
                {' '}
                *
              </Text>
            )}
          </Text>
          <input
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              onChange(field.multiple ? files : files[0]);
            }}
            accept={field.accept}
            multiple={field.multiple}
            type="file"
          />
          {field.description && (
            <Text c="dimmed" size="xs">
              {field.description}
            </Text>
          )}
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
        </Stack>
      );

    default:
      // Fallback to text input
      return (
        <TextInput
          description={field.description}
          error={error}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          label={field.label}
          required={field.required}
          value={value || ''}
        />
      );
  }
}

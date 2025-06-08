'use client';

import { useState, useEffect } from 'react';
import {
  TextInput,
  Textarea,
  NumberInput,
  Select,
  MultiSelect,
  Checkbox,
  Switch,
  DateInput,
  TimeInput,
  PasswordInput,
  JsonInput,
  TagsInput,
  Stack,
  Text,
  Group,
  Alert,
  Button,
  Box,
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { IconInfoCircle, IconEye, IconEyeOff } from '@tabler/icons-react';
import { RelationshipEditor } from './RelationshipEditor';
import { getRelationshipConfig } from '../lib/relationship-editor-config';
import { isFieldSensitive, matchesSensitivePattern } from '../lib/security-config';
import type { ModelConfig } from '../lib/model-config';

interface FormFieldProps {
  field: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  modelConfig?: ModelConfig;
  entityId?: string;
  availableRelatedData?: Record<string, any[]>;
  onRelationshipChange?: (relationshipName: string, data: any[]) => void;
}

export function EnhancedFormField({
  field,
  value,
  onChange,
  error,
  modelConfig,
  entityId,
  availableRelatedData,
  onRelationshipChange,
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
      field.name
    );

    if (relationshipConfig && availableRelatedData) {
      const relatedEntities = availableRelatedData[field.relationModel] || [];
      const currentRelationships = Array.isArray(value) ? value : [];

      return (
        <Box mb="md">
          <RelationshipEditor
            config={relationshipConfig}
            primaryEntityId={entityId}
            currentRelationships={currentRelationships}
            availableEntities={relatedEntities}
            onRelationshipChange={(relationships) => {
              onChange(relationships);
              if (onRelationshipChange) {
                onRelationshipChange(field.name, relationships);
              }
            }}
          />
          {error && (
            <Text size="sm" c="red" mt="xs">
              {error}
            </Text>
          )}
        </Box>
      );
    }

    // Fallback to simple select for relations without config
    return (
      <Select
        label={field.label}
        placeholder={`Select ${field.label}`}
        value={value || ''}
        onChange={onChange}
        data={availableRelatedData?.[field.relationModel]?.map((item: any) => ({
          value: item.id,
          label: item.name || item.title || item.email || item.id,
        })) || []}
        searchable
        clearable
        error={error}
        required={field.required}
        description={field.description}
      />
    );
  }

  // Handle sensitive fields with special UI
  if (isSensitiveField(field.name, modelConfig?.name)) {
    return (
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            {field.label}
            {field.required && <Text component="span" c="red"> *</Text>}
          </Text>
          <Button
            variant="subtle"
            size="xs"
            leftSection={showSensitive ? <IconEyeOff size={14} /> : <IconEye size={14} />}
            onClick={() => setShowSensitive(!showSensitive)}
          >
            {showSensitive ? 'Hide' : 'Show'}
          </Button>
        </Group>
        
        <Alert icon={<IconInfoCircle size={16} />} color="yellow" variant="light">
          Sensitive data - handle with care
        </Alert>

        {showSensitive ? (
          <TextInput
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            error={error}
            required={field.required}
            description={field.description}
          />
        ) : (
          <TextInput
            value={value ? '••••••••••••••••' : ''}
            readOnly
            placeholder="Hidden for security"
            description="Click 'Show' to view/edit sensitive data"
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
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          error={error}
          required={field.required}
          description={field.description}
          maxLength={field.maxLength}
        />
      );

    case 'email':
      return (
        <TextInput
          type="email"
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'user@example.com'}
          error={error}
          required={field.required}
          description={field.description}
        />
      );

    case 'password':
      return (
        <PasswordInput
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          error={error}
          required={field.required}
          description={field.description}
        />
      );

    case 'textarea':
      return (
        <Textarea
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          error={error}
          required={field.required}
          description={field.description}
          rows={field.rows || 3}
          maxLength={field.maxLength}
        />
      );

    case 'number':
      return (
        <NumberInput
          label={field.label}
          value={value || 0}
          onChange={onChange}
          placeholder={field.placeholder}
          error={error}
          required={field.required}
          description={field.description}
          min={field.min}
          max={field.max}
          step={field.step}
          precision={field.precision}
        />
      );

    case 'select':
      return (
        <Select
          label={field.label}
          value={value || ''}
          onChange={onChange}
          data={field.options || []}
          placeholder={field.placeholder || `Select ${field.label}`}
          error={error}
          required={field.required}
          description={field.description}
          searchable={field.searchable}
          clearable={field.clearable}
        />
      );

    case 'multiselect':
      return (
        <MultiSelect
          label={field.label}
          value={value || []}
          onChange={onChange}
          data={field.options || []}
          placeholder={field.placeholder || `Select ${field.label}`}
          error={error}
          required={field.required}
          description={field.description}
          searchable={field.searchable}
          clearable={field.clearable}
          maxValues={field.maxValues}
        />
      );

    case 'tags':
      return (
        <TagsInput
          label={field.label}
          value={value || []}
          onChange={onChange}
          placeholder={field.placeholder || 'Enter tags'}
          error={error}
          required={field.required}
          description={field.description}
          maxTags={field.maxTags}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          label={field.label}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          error={error}
          description={field.description}
        />
      );

    case 'switch':
      return (
        <Switch
          label={field.label}
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          error={error}
          description={field.description}
        />
      );

    case 'date':
      return (
        <DateInput
          label={field.label}
          value={value ? new Date(value) : null}
          onChange={(date) => onChange(date?.toISOString().split('T')[0])}
          placeholder={field.placeholder || 'Pick date'}
          error={error}
          required={field.required}
          description={field.description}
          minDate={field.minDate ? new Date(field.minDate) : undefined}
          maxDate={field.maxDate ? new Date(field.maxDate) : undefined}
        />
      );

    case 'datetime':
      return (
        <DateTimePicker
          label={field.label}
          value={value ? new Date(value) : null}
          onChange={(date) => onChange(date?.toISOString())}
          placeholder={field.placeholder || 'Pick date and time'}
          error={error}
          required={field.required}
          description={field.description}
          minDate={field.minDate ? new Date(field.minDate) : undefined}
          maxDate={field.maxDate ? new Date(field.maxDate) : undefined}
        />
      );

    case 'time':
      return (
        <TimeInput
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required={field.required}
          description={field.description}
        />
      );

    case 'json':
      return (
        <Stack gap="xs">
          <JsonInput
            label={field.label}
            value={value || ''}
            onChange={handleJsonChange}
            placeholder={field.placeholder || '{}'}
            error={error || jsonError}
            required={field.required}
            description={field.description}
            rows={field.rows || 4}
            validationError="Invalid JSON"
            formatOnBlur
            autosize
            minRows={field.minRows || 3}
            maxRows={field.maxRows || 10}
          />
          {jsonError && (
            <Text size="sm" c="red">
              {jsonError}
            </Text>
          )}
        </Stack>
      );

    case 'url':
      return (
        <TextInput
          type="url"
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder || 'https://example.com'}
          error={error}
          required={field.required}
          description={field.description}
        />
      );

    case 'color':
      return (
        <TextInput
          type="color"
          label={field.label}
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          required={field.required}
          description={field.description}
        />
      );

    case 'range':
      return (
        <NumberInput
          label={field.label}
          value={value || field.min || 0}
          onChange={onChange}
          min={field.min}
          max={field.max}
          step={field.step || 1}
          error={error}
          required={field.required}
          description={field.description}
        />
      );

    case 'file':
      return (
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            {field.label}
            {field.required && <Text component="span" c="red"> *</Text>}
          </Text>
          <input
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              onChange(field.multiple ? files : files[0]);
            }}
          />
          {field.description && (
            <Text size="xs" c="dimmed">
              {field.description}
            </Text>
          )}
          {error && (
            <Text size="sm" c="red">
              {error}
            </Text>
          )}
        </Stack>
      );

    default:
      // Fallback to text input
      return (
        <TextInput
          label={field.label}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          error={error}
          required={field.required}
          description={field.description}
        />
      );
  }
}
'use client';

import React from 'react';
import { Button, Group, Text } from '@mantine/core';
import {
  useFormWithRegistry,
  FormProvider,
  TextField,
  SelectField,
  CheckboxField,
  FormSection,
  FormRow,
  FormErrorSummary
} from '..';

/**
 * This example demonstrates the core extension pattern for Mantine Form.
 * It shows how to use the enhanced form with registry without the complexity
 * of multi-step forms or async validation.
 */

// Define the form data type
interface UserFormData {
  name: string;
  email: string;
  role: string;
  department: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Define the field registry
const fieldRegistry = {
  'name': {
    name: 'name',
    label: 'Full Name',
    required: true,
    placeholder: 'Enter your full name',
    group: 'personal'
  },
  'email': {
    name: 'email',
    label: 'Email Address',
    required: true,
    placeholder: 'your.email@example.com',
    type: 'email',
    group: 'personal'
  },
  'role': {
    name: 'role',
    label: 'Role',
    required: true,
    type: 'select',
    placeholder: 'Select your role',
    group: 'work'
  },
  'department': {
    name: 'department',
    label: 'Department',
    required: true,
    type: 'select',
    placeholder: 'Select your department',
    group: 'work',
    relationships: [
      {
        dependsOn: 'role',
        type: 'visibility',
        condition: (values) => !!values.role
      }
    ]
  },
  'notifications.email': {
    name: 'notifications.email',
    label: 'Email Notifications',
    type: 'checkbox',
    group: 'preferences'
  },
  'notifications.sms': {
    name: 'notifications.sms',
    label: 'SMS Notifications',
    type: 'checkbox',
    group: 'preferences'
  },
  'notifications.push': {
    name: 'notifications.push',
    label: 'Push Notifications',
    type: 'checkbox',
    group: 'preferences'
  }
};

// Role options
const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'analyst', label: 'Analyst' }
];

// Department options
const departmentOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'product', label: 'Product' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' }
];

/**
 * Core Extension Example Component
 */
export function CoreExtensionExample() {
  // Create form with registry
  const form = useFormWithRegistry<UserFormData>({
    registry: fieldRegistry,
    initialValues: {
      name: '',
      email: '',
      role: '',
      department: '',
      notifications: {
        email: true,
        sms: false,
        push: true
      }
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format'),
      role: (value) => (!value ? 'Please select a role' : null),
      department: (value, values) => (values.role && !value ? 'Please select a department' : null)
    }
  });

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
    alert('Form submitted successfully!');
  });

  // Get visible fields based on current values
  const visibleFields = form.getVisibleFields();

  // Get fields by group
  const personalFields = form.getFieldsByGroup('personal');
  const workFields = form.getFieldsByGroup('work');
  const preferenceFields = form.getFieldsByGroup('preferences');

  return (
    <FormProvider form={form}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Text size="xl" weight={700} mb="md">Core Extension Example</Text>

        <FormErrorSummary useMantine={true} />

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <FormSection title="Personal Information">
            <TextField name="name" />
            <TextField name="email" />
          </FormSection>

          {/* Work Information */}
          <FormSection title="Work Information">
            <SelectField
              name="role"
              data={roleOptions}
              searchable
            />

            {/* Conditional field - only visible if role is selected */}
            {visibleFields.includes('department') && (
              <SelectField
                name="department"
                data={departmentOptions}
                searchable
              />
            )}
          </FormSection>

          {/* Notification Preferences */}
          <FormSection title="Notification Preferences">
            <FormRow>
              <CheckboxField name="notifications.email" />
              <CheckboxField name="notifications.sms" />
              <CheckboxField name="notifications.push" />
            </FormRow>
          </FormSection>

          {/* Form Actions */}
          <Group position="right" mt="xl">
            <Button type="button" variant="outline" onClick={form.reset}>
              Reset
            </Button>
            <Button type="submit">
              Submit
            </Button>
          </Group>
        </form>

        {/* Debug Information */}
        <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #eee', borderRadius: '4px' }}>
          <Text size="sm" weight={700} mb="xs">Debug Information</Text>
          <Text size="xs">Visible Fields: {visibleFields.join(', ')}</Text>
          <Text size="xs">Personal Fields: {personalFields.map(f => f.name).join(', ')}</Text>
          <Text size="xs">Work Fields: {workFields.map(f => f.name).join(', ')}</Text>
          <Text size="xs">Preference Fields: {preferenceFields.map(f => f.name).join(', ')}</Text>
          <Text size="xs" mt="xs">Form Values:</Text>
          <pre style={{ fontSize: '10px', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px' }}>
            {JSON.stringify(form.values, null, 2)}
          </pre>
        </div>
      </div>
    </FormProvider>
  );
}

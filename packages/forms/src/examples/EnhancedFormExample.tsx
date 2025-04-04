'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { Button, Group, Stepper, Text, TextInput, Checkbox, Select, Radio, Stack, Alert } from '@mantine/core';
import {
  useFormWithRegistry,
  FormProvider,
  TextField,
  SelectField,
  CheckboxField,
  RadioField,
  FormSection,
  FormRow,
  FormColumn,
  FormErrorSummary,
  FormValidationSummary,
  ArrayField,
  NestedFormSection,
  useFormStepper,
  useAsyncValidation,
  useFieldValidation
} from '..';

/**
 * This example demonstrates the enhanced Mantine Form with registry,
 * including multi-step forms, async validation, and conditional fields.
 */

// Define the form schema with Zod
const schema = z.object({
  // Personal information (step 1)
  personal: z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    accountType: z.enum(['personal', 'business']),
  }),

  // Business information (conditional on accountType)
  business: z.object({
    companyName: z.string().min(2, 'Company name must be at least 2 characters').optional(),
    vatNumber: z.string().optional(),
    industry: z.string().optional(),
  }).optional(),

  // Address information (step 2)
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
  }),

  // Contact preferences (step 3)
  preferences: z.object({
    contactMethod: z.enum(['email', 'phone', 'mail']),
    newsletter: z.boolean(),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions'
    })
  }),

  // Additional contacts (step 4)
  contacts: z.array(
    z.object({
      name: z.string().min(2, 'Contact name must be at least 2 characters'),
      relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
      email: z.string().email('Invalid email address').optional().or(z.literal('')),
      isPrimary: z.boolean().optional()
    })
  ).optional()
});

// Define the form data type
type FormData = z.infer<typeof schema>;

// Define the field registry
const fieldRegistry = {
  // Personal information fields
  'personal.firstName': {
    name: 'personal.firstName',
    label: 'First Name',
    required: true,
    placeholder: 'Enter your first name',
    group: 'personal',
    tab: 'personal'
  },
  'personal.lastName': {
    name: 'personal.lastName',
    label: 'Last Name',
    required: true,
    placeholder: 'Enter your last name',
    group: 'personal',
    tab: 'personal'
  },
  'personal.email': {
    name: 'personal.email',
    label: 'Email Address',
    required: true,
    placeholder: 'your.email@example.com',
    type: 'email',
    group: 'personal',
    tab: 'personal',
    asyncValidation: true // Mark for async validation
  },
  'personal.accountType': {
    name: 'personal.accountType',
    label: 'Account Type',
    required: true,
    type: 'radio',
    group: 'personal',
    tab: 'personal'
  },

  // Business information fields (conditional)
  'business.companyName': {
    name: 'business.companyName',
    label: 'Company Name',
    required: true,
    placeholder: 'Enter your company name',
    group: 'business',
    tab: 'personal',
    relationships: [
      {
        dependsOn: 'personal.accountType',
        type: 'visibility',
        condition: (values) => values.personal?.accountType === 'business'
      }
    ]
  },
  'business.vatNumber': {
    name: 'business.vatNumber',
    label: 'VAT Number',
    placeholder: 'Enter your VAT number',
    group: 'business',
    tab: 'personal',
    relationships: [
      {
        dependsOn: 'personal.accountType',
        type: 'visibility',
        condition: (values) => values.personal?.accountType === 'business'
      }
    ]
  },
  'business.industry': {
    name: 'business.industry',
    label: 'Industry',
    type: 'select',
    placeholder: 'Select your industry',
    group: 'business',
    tab: 'personal',
    relationships: [
      {
        dependsOn: 'personal.accountType',
        type: 'visibility',
        condition: (values) => values.personal?.accountType === 'business'
      }
    ]
  },

  // Address fields
  'address.street': {
    name: 'address.street',
    label: 'Street Address',
    required: true,
    placeholder: 'Enter your street address',
    group: 'address',
    tab: 'address'
  },
  'address.city': {
    name: 'address.city',
    label: 'City',
    required: true,
    placeholder: 'Enter your city',
    group: 'address',
    tab: 'address'
  },
  'address.state': {
    name: 'address.state',
    label: 'State',
    required: true,
    placeholder: 'Enter your state',
    group: 'address',
    tab: 'address'
  },
  'address.zip': {
    name: 'address.zip',
    label: 'ZIP Code',
    required: true,
    placeholder: '12345',
    group: 'address',
    tab: 'address'
  },
  'address.country': {
    name: 'address.country',
    label: 'Country',
    required: true,
    type: 'select',
    placeholder: 'Select your country',
    group: 'address',
    tab: 'address'
  },

  // Preferences fields
  'preferences.contactMethod': {
    name: 'preferences.contactMethod',
    label: 'Preferred Contact Method',
    required: true,
    type: 'radio',
    group: 'preferences',
    tab: 'preferences'
  },
  'preferences.newsletter': {
    name: 'preferences.newsletter',
    label: 'Subscribe to newsletter',
    type: 'checkbox',
    group: 'preferences',
    tab: 'preferences'
  },
  'preferences.agreeToTerms': {
    name: 'preferences.agreeToTerms',
    label: 'I agree to the terms and conditions',
    required: true,
    type: 'checkbox',
    group: 'preferences',
    tab: 'preferences'
  },

  // Contacts fields
  'contacts': {
    name: 'contacts',
    label: 'Additional Contacts',
    isArray: true,
    arrayItemDefaults: {
      name: '',
      relationship: '',
      email: '',
      isPrimary: false
    },
    group: 'contacts',
    tab: 'contacts'
  }
};

// Define the form steps
const formSteps = [
  {
    id: 'personal',
    label: 'Personal Information',
    fields: ['personal.firstName', 'personal.lastName', 'personal.email', 'personal.accountType',
             'business.companyName', 'business.vatNumber', 'business.industry']
  },
  {
    id: 'address',
    label: 'Address',
    fields: ['address.street', 'address.city', 'address.state', 'address.zip', 'address.country']
  },
  {
    id: 'preferences',
    label: 'Preferences',
    fields: ['preferences.contactMethod', 'preferences.newsletter', 'preferences.agreeToTerms']
  },
  {
    id: 'contacts',
    label: 'Contacts',
    fields: ['contacts']
  }
];

// Mock async validation function
const checkEmailAvailability = async (email: string): Promise<boolean> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  // For demo purposes, emails containing "taken" are considered unavailable
  return !email.includes('taken');
};

// Industry options
const industryOptions = [
  { value: 'tech', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'retail', label: 'Retail' },
  { value: 'other', label: 'Other' }
];

// Country options
const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' }
];

/**
 * Enhanced Form Example Component
 */
export function EnhancedFormExample() {
  // Create form with registry
  const form = useFormWithRegistry<FormData>({
    registry: fieldRegistry,
    initialValues: {
      personal: {
        firstName: '',
        lastName: '',
        email: '',
        accountType: 'personal'
      },
      business: {
        companyName: '',
        vatNumber: '',
        industry: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: ''
      },
      preferences: {
        contactMethod: 'email',
        newsletter: false,
        agreeToTerms: false
      },
      contacts: []
    },
    validate: zodResolver(schema)
  });

  // Set up form stepper
  const {
    activeStep,
    activeStepId,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    getCompletionPercentage
  } = useFormStepper(form, {
    steps: formSteps,
    validateOnStepChange: true
  });

  // Set up async validation
  const { isValidating, isFieldValidating } = useAsyncValidation(form, {
    onValidate: async (field, value, form) => {
      if (field === 'personal.email' && value) {
        const isAvailable = await checkEmailAvailability(value as string);
        return isAvailable ? null : 'This email is already taken';
      }
      return null;
    },
    debounce: 500,
    validateAll: false
  });

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
    alert('Form submitted successfully!');
  });

  // Get visible fields based on current values
  const visibleFields = form.getVisibleFields();

  return (
    <FormProvider form={form}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Text size="xl" weight={700} mb="md">Enhanced Form Example</Text>

        {/* Progress indicator */}
        <Stepper active={formSteps.findIndex(step => step.id === activeStepId)} mb="xl">
          {formSteps.map((step) => (
            <Stepper.Step key={step.id} label={step.label} />
          ))}
        </Stepper>

        {/* Completion percentage */}
        <Text size="sm" mb="xs">Completion: {getCompletionPercentage()}%</Text>

        {/* Form errors */}
        <FormErrorSummary useMantine={true} />

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {activeStepId === 'personal' && (
            <FormSection title="Personal Information">
              <FormRow>
                <TextField name="personal.firstName" />
                <TextField name="personal.lastName" />
              </FormRow>

              <TextField
                name="personal.email"
                rightSection={isFieldValidating('personal.email') ?
                  <Text size="xs">Checking...</Text> : null
                }
              />

              <RadioField
                name="personal.accountType"
                data={[
                  { value: 'personal', label: 'Personal Account' },
                  { value: 'business', label: 'Business Account' }
                ]}
                orientation="horizontal"
              />

              {/* Conditional business fields */}
              {visibleFields.includes('business.companyName') && (
                <FormSection title="Business Information">
                  <TextField name="business.companyName" />
                  <TextField name="business.vatNumber" />
                  <SelectField
                    name="business.industry"
                    data={industryOptions}
                    searchable
                  />
                </FormSection>
              )}
            </FormSection>
          )}

          {/* Step 2: Address */}
          {activeStepId === 'address' && (
            <NestedFormSection
              name="address"
              title="Address Information"
              description="Please provide your complete address"
            >
              <TextField name="street" />
              <FormRow>
                <TextField name="city" />
                <TextField name="state" />
              </FormRow>
              <TextField name="zip" />
              <SelectField
                name="country"
                data={countryOptions}
                searchable
              />
            </NestedFormSection>
          )}

          {/* Step 3: Preferences */}
          {activeStepId === 'preferences' && (
            <NestedFormSection
              name="preferences"
              title="Contact Preferences"
              description="How would you like us to contact you?"
            >
              <RadioField
                name="contactMethod"
                data={[
                  { value: 'email', label: 'Email' },
                  { value: 'phone', label: 'Phone' },
                  { value: 'mail', label: 'Mail' }
                ]}
                orientation="horizontal"
              />
              <CheckboxField name="newsletter" label="Subscribe to our newsletter" />
              <CheckboxField name="agreeToTerms" />
            </NestedFormSection>
          )}

          {/* Step 4: Additional Contacts */}
          {activeStepId === 'contacts' && (
            <FormSection title="Additional Contacts" description="Optional: Add additional contacts">
              <ArrayField
                name="contacts"
                renderItem={(index, remove, path) => (
                  <FormSection title={`Contact #${index + 1}`}>
                    <TextField name={`${path}.name`} label="Contact Name" />
                    <TextField name={`${path}.relationship`} label="Relationship" />
                    <TextField name={`${path}.email`} label="Contact Email (Optional)" />
                    <CheckboxField name={`${path}.isPrimary`} label="Primary Contact" />
                    <Button color="red" variant="outline" onClick={remove} mt="sm">
                      Remove Contact
                    </Button>
                  </FormSection>
                )}
                defaultItemValues={{
                  name: '',
                  relationship: '',
                  email: '',
                  isPrimary: false
                }}
                addButtonLabel="Add Contact"
                useMantine={true}
                buttonProps={{ color: 'blue' }}
                maxItems={5}
              />
            </FormSection>
          )}

          {/* Navigation buttons */}
          <Group position="apart" mt="xl">
            {!isFirstStep && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}

            {!isLastStep ? (
              <Button onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit" color="green">
                Submit
              </Button>
            )}
          </Group>

          <FormValidationSummary useMantine={true} showSuccess={true} />
        </form>
      </div>
    </FormProvider>
  );
}

// Helper function for Zod resolver
function zodResolver<T>(schema: z.ZodSchema<T>) {
  return (values: T) => {
    try {
      schema.parse(values);
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.reduce((acc, curr) => {
          const path = curr.path.join('.');
          acc[path] = curr.message;
          return acc;
        }, {} as Record<string, string>);
      }
      return null;
    }
  };
}

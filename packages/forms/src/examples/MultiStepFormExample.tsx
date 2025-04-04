'use client';

import React from 'react';
import { z } from 'zod';
import {
  useFormWithRegistry,
  FormProvider,
  TextField,
  SelectField,
  CheckboxField,
  FormErrorSummary,
  FormValidationSummary,
  ArrayField,
  NestedFormSection,
  FormSection,
  FormTabs,
  FormTab,
  FormRow,
  FormColumn,
  RadioField,
  FormStepIndicator
} from '..';
import { Button, Group } from '@mantine/core';

// Define the form schema with Zod
const schema = z.object({
  // Personal information (step 1)
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),

  // Address information (step 2)
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format')
  }),

  // Contact preferences (step 3)
  contactPreferences: z.object({
    preferredMethod: z.enum(['email', 'phone', 'mail'], {
      errorMap: () => ({ message: 'Please select a contact method' })
    }),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the terms and conditions'
    })
  }),

  // Additional contacts (step 4)
  additionalContacts: z.array(
    z.object({
      name: z.string().min(2, 'Contact name must be at least 2 characters'),
      relationship: z.string().min(2, 'Relationship must be at least 2 characters'),
      email: z.string().email('Invalid email address').optional().or(z.literal(''))
    })
  ).optional()
});

// Define the form data type
type FormData = z.infer<typeof schema>;

// Define the field registry
const fieldRegistry = {
  // Personal information fields
  firstName: {
    name: 'firstName',
    label: 'First Name',
    required: true,
    placeholder: 'Enter your first name'
  },
  lastName: {
    name: 'lastName',
    label: 'Last Name',
    required: true,
    placeholder: 'Enter your last name'
  },
  email: {
    name: 'email',
    label: 'Email Address',
    required: true,
    placeholder: 'your.email@example.com',
    type: 'email'
  },

  // Address fields (nested)
  address: {
    name: 'address',
    label: 'Address',
    nestedFields: {
      street: {
        name: 'street',
        label: 'Street Address',
        required: true,
        placeholder: 'Enter your street address'
      },
      city: {
        name: 'city',
        label: 'City',
        required: true,
        placeholder: 'Enter your city'
      },
      state: {
        name: 'state',
        label: 'State',
        required: true,
        placeholder: 'Enter your state'
      },
      zip: {
        name: 'zip',
        label: 'ZIP Code',
        required: true,
        placeholder: '12345'
      }
    }
  },

  // Contact preferences fields (nested)
  contactPreferences: {
    name: 'contactPreferences',
    label: 'Contact Preferences',
    nestedFields: {
      preferredMethod: {
        name: 'preferredMethod',
        label: 'Preferred Contact Method',
        required: true,
        type: 'radio'
      },
      agreeToTerms: {
        name: 'agreeToTerms',
        label: 'I agree to the terms and conditions',
        required: true,
        type: 'checkbox'
      }
    }
  },

  // Additional contacts (array)
  additionalContacts: {
    name: 'additionalContacts',
    label: 'Additional Contacts',
    isArray: true,
    arrayItemDefaults: {
      name: '',
      relationship: '',
      email: ''
    }
  }
};

/**
 * Example of a multi-step form with nested fields and arrays
 * This example showcases:
 * - FormTabs for multi-step navigation
 * - NestedFormSection for nested fields
 * - ArrayField with Mantine styling
 * - FormStepIndicator for progress tracking
 */
export function MultiStepFormExample() {
  // Create form with registry
  const form = useFormWithRegistry<FormData>({
    registry: fieldRegistry,
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: ''
      },
      contactPreferences: {
        preferredMethod: 'email',
        agreeToTerms: false
      },
      additionalContacts: []
    },
    validate: zodResolver(schema)
  });

  // Define form tabs
  const formTabs: FormTab[] = [
    {
      id: 'personal',
      label: 'Personal Information',
      fields: ['firstName', 'lastName', 'email']
    },
    {
      id: 'address',
      label: 'Address',
      fields: ['address.street', 'address.city', 'address.state', 'address.zip']
    },
    {
      id: 'preferences',
      label: 'Contact Preferences',
      fields: ['contactPreferences.preferredMethod', 'contactPreferences.agreeToTerms']
    },
    {
      id: 'contacts',
      label: 'Additional Contacts',
      fields: ['additionalContacts']
    }
  ];

  // Use the useFormTabs hook to manage tab state
  const { activeTab, setActiveTab, activeTabFields } = useFormTabs(formTabs);

  // Calculate current step index for the progress indicator
  const currentStepIndex = formTabs.findIndex(tab => tab.id === activeTab);

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
    alert('Form submitted successfully!');
  });

  // Navigation handlers
  const nextStep = () => {
    const currentIndex = formTabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < formTabs.length - 1) {
      setActiveTab(formTabs[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = formTabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(formTabs[currentIndex - 1].id);
    }
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === formTabs.length - 1;

  return (
    <FormProvider form={form}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Form progress indicator */}
        <FormSection title={formTabs.find(tab => tab.id === activeTab)?.label || ''}>
          <FormStepIndicator
            currentStep={currentStepIndex}
            totalSteps={formTabs.length}
            stepLabels={formTabs.map(tab => tab.label)}
            showLabels={true}
            showNumbers={true}
          />

          {/* Form errors */}
          <FormErrorSummary useMantine={true} />
        </FormSection>

        <form onSubmit={handleSubmit}>
          <FormTabs tabs={formTabs} defaultActiveTab="personal">
            {/* Step 1: Personal Information */}
            {activeTab === 'personal' && (
              <FormSection>
                <FormRow>
                  <TextField name="firstName" />
                  <TextField name="lastName" />
                </FormRow>
                <TextField name="email" />
              </FormSection>
            )}

            {/* Step 2: Address */}
            {activeTab === 'address' && (
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
              </NestedFormSection>
            )}

            {/* Step 3: Contact Preferences */}
            {activeTab === 'preferences' && (
              <NestedFormSection
                name="contactPreferences"
                title="Contact Preferences"
                description="How would you like us to contact you?"
              >
                <RadioField
                  name="preferredMethod"
                  data={[
                    { value: 'email', label: 'Email' },
                    { value: 'phone', label: 'Phone' },
                    { value: 'mail', label: 'Mail' }
                  ]}
                />
                <CheckboxField name="agreeToTerms" />
              </NestedFormSection>
            )}

            {/* Step 4: Additional Contacts */}
            {activeTab === 'contacts' && (
              <FormSection title="Additional Contacts" description="Optional: Add additional contacts">
                <ArrayField
                  name="additionalContacts"
                  renderItem={(index, remove, path) => (
                    <FormSection title={`Contact #${index + 1}`}>
                      <TextField name={`${path}.name`} label="Contact Name" />
                      <TextField name={`${path}.relationship`} label="Relationship" />
                      <TextField name={`${path}.email`} label="Contact Email (Optional)" />
                    </FormSection>
                  )}
                  defaultItemValues={{
                    name: '',
                    relationship: '',
                    email: ''
                  }}
                  addButtonLabel="Add Contact"
                  useMantine={true}
                  buttonProps={{ color: 'blue' }}
                  maxItems={5}
                />
              </FormSection>
            )}
          </FormTabs>

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

// Helper function for Zod resolver (normally imported from mantine-form-zod-resolver)
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

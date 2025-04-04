'use client';

import { z } from 'zod';
import {
  useFormWithRegistry,
  FormProvider,
  TextField,
  SelectField,
  CheckboxField,
  FormSection,
  FormRow,
  FormColumn,
  FormErrorSummary,
  FormValidationSummary,
  RadioField
} from '..';
import { Button } from '@mantine/core';

// Define a schema for validation
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
  contactMethod: z.enum(['email', 'phone', 'mail'], {
    errorMap: () => ({ message: 'Please select a contact method' })
  }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms'
  })
});

// Define the form data type
type FormData = z.infer<typeof schema>;

// Define the field registry
const fieldRegistry = {
  name: {
    name: 'name',
    label: 'Full Name',
    required: true,
    placeholder: 'Enter your full name',
    description: 'Your first and last name'
  },
  email: {
    name: 'email',
    label: 'Email Address',
    required: true,
    placeholder: 'your.email@example.com',
    description: 'We will never share your email'
  },
  role: {
    name: 'role',
    label: 'Role',
    required: true,
    type: 'select',
    placeholder: 'Select your role',
    // Example of a relationship - role field is only visible when name is filled
    relationships: [
      {
        dependsOn: 'name',
        type: 'visibility',
        condition: (values) => Boolean(values.name && values.name.length >= 2)
      }
    ]
  },
  contactMethod: {
    name: 'contactMethod',
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
};

/**
 * Simple form example using the consolidated forms implementation
 * This example showcases:
 * - FormSection for grouping fields
 * - FormRow and FormColumn for layout
 * - Mantine UI styling options
 * - Validation components
 */
export function SimpleFormExample() {
  // Create form with registry
  const form = useFormWithRegistry<FormData>({
    registry: fieldRegistry,
    initialValues: {
      name: '',
      email: '',
      role: '',
      contactMethod: 'email',
      agreeToTerms: false
    },
    validate: zodResolver(schema)
  });

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
    // In a real app, you would submit the form data to your API here
    alert('Form submitted successfully!');
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit}>
        {/* Error summary at the top of the form */}
        <FormErrorSummary useMantine={true} />

        <FormSection title="Personal Information" description="Please provide your basic information">
          <FormRow>
            <TextField name="name" />
            <TextField name="email" type="email" />
          </FormRow>

          <FormColumn>
            <SelectField
              name="role"
              data={[
                { value: 'admin', label: 'Administrator' },
                { value: 'user', label: 'Regular User' },
                { value: 'guest', label: 'Guest' }
              ]}
              searchable
              clearable
            />

            <RadioField
              name="contactMethod"
              data={[
                { value: 'email', label: 'Email' },
                { value: 'phone', label: 'Phone' },
                { value: 'mail', label: 'Mail' }
              ]}
              orientation="horizontal"
            />

            <CheckboxField
              name="agreeToTerms"
              type="checkbox"
            />
          </FormColumn>
        </FormSection>

        <FormValidationSummary useMantine={true} showSuccess={true} />

        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" color="blue">
            Submit
          </Button>
        </div>
      </form>
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

import React from 'react';
import { render, screen, fireEvent } from '@repo/testing/vitest';
import { useFormWithRegistry, FormProvider, TextField, useFormStepper } from '..';

// Define a multi-step form data type
interface MultiStepFormData {
  personal: {
    firstName: string;
    lastName: string;
  };
  contact: {
    email: string;
    phone: string;
  };
}

// Define the field registry
const fieldRegistry = {
  'personal.firstName': {
    name: 'personal.firstName',
    label: 'First Name',
    required: true,
    placeholder: 'Enter your first name',
    group: 'personal'
  },
  'personal.lastName': {
    name: 'personal.lastName',
    label: 'Last Name',
    required: true,
    placeholder: 'Enter your last name',
    group: 'personal'
  },
  'contact.email': {
    name: 'contact.email',
    label: 'Email Address',
    required: true,
    placeholder: 'your.email@example.com',
    type: 'email',
    group: 'contact'
  },
  'contact.phone': {
    name: 'contact.phone',
    label: 'Phone Number',
    required: true,
    placeholder: '(123) 456-7890',
    group: 'contact'
  }
};

// Define form steps
const formSteps = [
  {
    id: 'personal',
    label: 'Personal Information',
    fields: ['personal.firstName', 'personal.lastName']
  },
  {
    id: 'contact',
    label: 'Contact Information',
    fields: ['contact.email', 'contact.phone']
  }
];

// Test component
function MultiStepForm() {
  const form = useFormWithRegistry<MultiStepFormData>({
    registry: fieldRegistry,
    initialValues: {
      personal: {
        firstName: '',
        lastName: ''
      },
      contact: {
        email: '',
        phone: ''
      }
    },
    validate: {
      'personal.firstName': (value) => (value.length < 2 ? 'First name must be at least 2 characters' : null),
      'personal.lastName': (value) => (value.length < 2 ? 'Last name must be at least 2 characters' : null),
      'contact.email': (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format'),
      'contact.phone': (value) => (/^\(\d{3}\) \d{3}-\d{4}$/.test(value) ? null : 'Invalid phone format')
    }
  });

  const {
    activeStepId,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep
  } = useFormStepper(form, {
    steps: formSteps,
    validateOnStepChange: true
  });

  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit} data-testid="multi-step-form">
        {/* Step indicator */}
        <div>
          <h2>Step: {activeStepId}</h2>
        </div>

        {/* Step 1: Personal Information */}
        {activeStepId === 'personal' && (
          <div data-testid="personal-step">
            <TextField name="personal.firstName" />
            <TextField name="personal.lastName" />
          </div>
        )}

        {/* Step 2: Contact Information */}
        {activeStepId === 'contact' && (
          <div data-testid="contact-step">
            <TextField name="contact.email" />
            <TextField name="contact.phone" />
          </div>
        )}

        {/* Navigation buttons */}
        <div>
          {!isFirstStep && (
            <button type="button" onClick={prevStep} data-testid="prev-button">
              Previous
            </button>
          )}
          {!isLastStep ? (
            <button type="button" onClick={nextStep} data-testid="next-button">
              Next
            </button>
          ) : (
            <button type="submit" data-testid="submit-button">
              Submit
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

describe('useFormStepper', () => {
  it('renders the first step initially', () => {
    render(<MultiStepForm />);

    expect(screen.getByTestId('personal-step')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-step')).not.toBeInTheDocument();
    expect(screen.getByText('Step: personal')).toBeInTheDocument();
  });

  it('validates the current step before proceeding to the next step', () => {
    render(<MultiStepForm />);

    // Try to go to the next step without filling in required fields
    fireEvent.click(screen.getByTestId('next-button'));

    // Should still be on the first step
    expect(screen.getByTestId('personal-step')).toBeInTheDocument();
    expect(screen.queryByTestId('contact-step')).not.toBeInTheDocument();

    // Should show validation errors
    expect(screen.getByText('First name must be at least 2 characters')).toBeInTheDocument();
    expect(screen.getByText('Last name must be at least 2 characters')).toBeInTheDocument();

    // Fill in the required fields
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

    // Try to go to the next step again
    fireEvent.click(screen.getByTestId('next-button'));

    // Should now be on the second step
    expect(screen.queryByTestId('personal-step')).not.toBeInTheDocument();
    expect(screen.getByTestId('contact-step')).toBeInTheDocument();
    expect(screen.getByText('Step: contact')).toBeInTheDocument();
  });

  it('allows navigation between steps', () => {
    render(<MultiStepForm />);

    // Fill in the first step
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

    // Go to the next step
    fireEvent.click(screen.getByTestId('next-button'));

    // Should be on the second step
    expect(screen.getByTestId('contact-step')).toBeInTheDocument();

    // Go back to the first step
    fireEvent.click(screen.getByTestId('prev-button'));

    // Should be back on the first step
    expect(screen.getByTestId('personal-step')).toBeInTheDocument();

    // Values should be preserved
    expect(screen.getByLabelText(/First Name/i)).toHaveValue('John');
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe');
  });

  it('shows the submit button on the last step', () => {
    render(<MultiStepForm />);

    // Fill in the first step
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

    // Go to the next step
    fireEvent.click(screen.getByTestId('next-button'));

    // Should show the submit button on the last step
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.queryByTestId('next-button')).not.toBeInTheDocument();
  });

  it('validates all steps before submission', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<MultiStepForm />);

    // Fill in the first step
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });

    // Go to the next step
    fireEvent.click(screen.getByTestId('next-button'));

    // Try to submit without filling in the second step
    fireEvent.click(screen.getByTestId('submit-button'));

    // Should show validation errors
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('Invalid phone format')).toBeInTheDocument();

    // Fill in the second step
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '(123) 456-7890' } });

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check that the form was submitted with the correct values
    expect(consoleSpy).toHaveBeenCalledWith('Form submitted with values:', {
      personal: {
        firstName: 'John',
        lastName: 'Doe'
      },
      contact: {
        email: 'john@example.com',
        phone: '(123) 456-7890'
      }
    });
  });
});

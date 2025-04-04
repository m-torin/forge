import React from 'react';
import { render, screen, fireEvent } from '@repo/testing/vitest';
import { useFormWithRegistry, FormProvider, TextField } from '..';

// Define a simple test form
interface TestFormData {
  name: string;
  email: string;
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
  }
};

// Test component
function TestForm() {
  const form = useFormWithRegistry<TestFormData>({
    registry: fieldRegistry,
    initialValues: {
      name: '',
      email: ''
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must be at least 2 characters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email format')
    }
  });

  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit} data-testid="test-form">
        <TextField name="name" />
        <TextField name="email" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}

describe('useFormWithRegistry', () => {
  it('renders form fields correctly', () => {
    render(<TestForm />);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
  });

  it('validates form fields correctly', async () => {
    render(<TestForm />);

    // Submit the form with empty fields
    fireEvent.click(screen.getByText('Submit'));

    // Check for validation errors
    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();

    // Fill in the name field correctly
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });

    // Submit again
    fireEvent.click(screen.getByText('Submit'));

    // Name error should be gone, but email error should remain
    expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();

    // Fill in the email field correctly
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });

    // Submit again
    fireEvent.click(screen.getByText('Submit'));

    // Both errors should be gone
    expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid email format')).not.toBeInTheDocument();
  });

  it('handles form submission correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<TestForm />);

    // Fill in the form fields
    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });

    // Submit the form
    fireEvent.click(screen.getByText('Submit'));

    // Check that the form was submitted with the correct values
    expect(consoleSpy).toHaveBeenCalledWith('Form submitted with values:', {
      name: 'John Doe',
      email: 'john@example.com'
    });
  });
});

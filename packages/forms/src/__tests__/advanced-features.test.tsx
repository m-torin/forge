import { render, screen, renderHook, act } from '@repo/testing/vitest';
import { useFormWithRegistry, FormProvider } from '../core';
import { useFormStepper } from '../form-stepper';
import { useAsyncValidation } from '../async-validation';
import { ArrayField, NestedField } from '../components/array-fields';
import { FormErrorSummary } from '../components/error-summary';
import { z } from 'zod';
import { zodResolver } from '../validation';

describe('Advanced Form Features', () => {
  describe('Nested Fields', () => {
    const nestedRegistry = {
      person: {
        name: 'person',
        label: 'Person',
        nestedFields: {
          firstName: {
            name: 'firstName',
            label: 'First Name',
            required: true
          },
          lastName: {
            name: 'lastName',
            label: 'Last Name',
            required: true
          }
        }
      }
    };

    it('should handle nested fields', () => {
      const { result } = renderHook(() => useFormWithRegistry({
        registry: nestedRegistry,
        initialValues: {
          person: {
            firstName: '',
            lastName: ''
          }
        }
      }));

      act(() => {
        result.current.setNestedValue('person.firstName', 'John');
        result.current.setNestedValue('person.lastName', 'Doe');
      });

      expect(result.current.values.person.firstName).toBe('John');
      expect(result.current.values.person.lastName).toBe('Doe');
      expect(result.current.getNestedValue('person.firstName')).toBe('John');
    });

    it('should render nested field component', () => {
      const TestComponent = () => {
        const form = useFormWithRegistry({
          registry: nestedRegistry,
          initialValues: {
            person: {
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        });

        return (
          <FormProvider form={form}>
            <NestedField name="person" data-testid="nested-field">
              <div data-testid="first-name">{form.values.person.firstName}</div>
              <div data-testid="last-name">{form.values.person.lastName}</div>
            </NestedField>
          </FormProvider>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('nested-field')).toBeInTheDocument();
      expect(screen.getByTestId('first-name')).toHaveTextContent('John');
      expect(screen.getByTestId('last-name')).toHaveTextContent('Doe');
    });
  });

  describe('Array Fields', () => {
    const arrayRegistry = {
      contacts: {
        name: 'contacts',
        label: 'Contacts',
        isArray: true,
        arrayItemDefaults: {
          name: '',
          email: ''
        }
      }
    };

    it('should handle array fields', () => {
      const { result } = renderHook(() => useFormWithRegistry({
        registry: arrayRegistry,
        initialValues: {
          contacts: []
        }
      }));

      act(() => {
        result.current.insertListItem('contacts', { name: 'John', email: 'john@example.com' });
        result.current.insertListItem('contacts', { name: 'Jane', email: 'jane@example.com' });
      });

      expect(result.current.values.contacts).toHaveLength(2);
      expect(result.current.values.contacts[0].name).toBe('John');
      expect(result.current.values.contacts[1].name).toBe('Jane');
      expect(result.current.getArrayLength('contacts')).toBe(2);
    });

    it('should render array field component', () => {
      const TestComponent = () => {
        const form = useFormWithRegistry({
          registry: arrayRegistry,
          initialValues: {
            contacts: [
              { name: 'John', email: 'john@example.com' },
              { name: 'Jane', email: 'jane@example.com' }
            ]
          }
        });

        return (
          <FormProvider form={form}>
            <ArrayField
              name="contacts"
              data-testid="array-field"
              renderItem={(index, remove, path) => (
                <div data-testid={`contact-${index}`} key={index}>
                  {form.values.contacts[index].name}
                </div>
              )}
            />
          </FormProvider>
        );
      };

      render(<TestComponent />);
      expect(screen.getByTestId('array-field')).toBeInTheDocument();
      expect(screen.getByTestId('contact-0')).toHaveTextContent('John');
      expect(screen.getByTestId('contact-1')).toHaveTextContent('Jane');
    });
  });

  describe('Form Steps', () => {
    const stepsRegistry = {
      step1: {
        name: 'step1',
        label: 'Step 1',
        required: true
      },
      step2: {
        name: 'step2',
        label: 'Step 2',
        required: true
      },
      step3: {
        name: 'step3',
        label: 'Step 3',
        required: true
      }
    };

    it('should handle form steps', () => {
      const { result } = renderHook(() => {
        const form = useFormWithRegistry({
          registry: stepsRegistry,
          initialValues: {
            step1: '',
            step2: '',
            step3: ''
          }
        });

        const stepper = useFormStepper(form, {
          steps: [
            {
              id: 'first',
              title: 'First Step',
              fields: ['step1']
            },
            {
              id: 'second',
              title: 'Second Step',
              fields: ['step2']
            },
            {
              id: 'third',
              title: 'Third Step',
              fields: ['step3']
            }
          ]
        });

        return { form, stepper };
      });

      // Initially on first step
      expect(result.current.stepper.activeStepId).toBe('first');
      expect(result.current.stepper.isFirstStep).toBe(true);
      expect(result.current.stepper.isLastStep).toBe(false);

      // Move to next step
      act(() => {
        result.current.form.setFieldValue('step1', 'Step 1 Value');
        result.current.stepper.nextStep();
      });

      expect(result.current.stepper.activeStepId).toBe('second');
      expect(result.current.stepper.isFirstStep).toBe(false);
      expect(result.current.stepper.isLastStep).toBe(false);

      // Move to last step
      act(() => {
        result.current.form.setFieldValue('step2', 'Step 2 Value');
        result.current.stepper.nextStep();
      });

      expect(result.current.stepper.activeStepId).toBe('third');
      expect(result.current.stepper.isFirstStep).toBe(false);
      expect(result.current.stepper.isLastStep).toBe(true);

      // Go back to previous step
      act(() => {
        result.current.stepper.prevStep();
      });

      expect(result.current.stepper.activeStepId).toBe('second');
    });
  });

  describe('Async Validation', () => {
    const asyncRegistry = {
      username: {
        name: 'username',
        label: 'Username',
        required: true
      }
    };

    it('should handle async validation', async () => {
      const mockCheckUsername = jest.fn().mockImplementation(async (username) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return username === 'taken' ? false : true;
      });

      const { result, waitForNextUpdate } = renderHook(() => {
        const form = useFormWithRegistry({
          registry: asyncRegistry,
          initialValues: {
            username: ''
          }
        });

        const validation = useAsyncValidation(form, {
          onValidate: async (field, value) => {
            if (field === 'username' && value) {
              const isAvailable = await mockCheckUsername(value);
              return isAvailable ? null : 'Username is already taken';
            }
            return null;
          },
          debounce: 10
        });

        return { form, validation };
      });

      // Set a valid username
      act(() => {
        result.current.form.setFieldValue('username', 'available');
      });

      // Wait for async validation
      await waitForNextUpdate();

      expect(mockCheckUsername).toHaveBeenCalledWith('available');
      expect(result.current.form.errors.username).toBeUndefined();

      // Set a taken username
      act(() => {
        result.current.form.setFieldValue('username', 'taken');
      });

      // Wait for async validation
      await waitForNextUpdate();

      expect(mockCheckUsername).toHaveBeenCalledWith('taken');
      expect(result.current.form.errors.username).toBe('Username is already taken');
    });
  });

  describe('Error Summary', () => {
    const errorRegistry = {
      name: {
        name: 'name',
        label: 'Name',
        required: true
      },
      email: {
        name: 'email',
        label: 'Email',
        required: true
      }
    };

    const schema = z.object({
      name: z.string().min(2, 'Name must be at least 2 characters'),
      email: z.string().email('Invalid email format')
    });

    it('should render error summary', () => {
      const TestComponent = () => {
        const form = useFormWithRegistry({
          registry: errorRegistry,
          initialValues: {
            name: '',
            email: 'invalid'
          },
          validate: zodResolver(schema)
        });

        // Trigger validation
        form.validate();

        return (
          <FormProvider form={form}>
            <FormErrorSummary data-testid="error-summary" />
          </FormProvider>
        );
      };

      render(<TestComponent />);
      const summary = screen.getByTestId('error-summary');
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveTextContent('Name must be at least 2 characters');
      expect(summary).toHaveTextContent('Invalid email format');
    });
  });
});

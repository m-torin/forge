# @repo/forms

A powerful extension of Mantine Form with registry-based field management, multi-step forms, async validation, and conditional fields.

## Features

- **Registry-Based Field Management**: Centralize field definitions with metadata
- **Dependency Tracking**: Define relationships between fields
- **Conditional Visibility**: Show/hide fields based on form values
- **Multi-Step Forms**: Create wizard-style forms with validation per step
- **Async Validation**: Validate fields asynchronously with debouncing
- **Enhanced Validation**: Field-level validation with registry awareness
- **Type Safety**: Full TypeScript support with proper interface extensions

## Installation

```bash
pnpm add @repo/forms
```

## Basic Usage

```tsx
import { useFormWithRegistry, FormProvider, TextField } from '@repo/forms';

// Define the form data type
interface UserFormData {
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

function UserForm() {
  // Create form with registry
  const form = useFormWithRegistry<UserFormData>({
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

  // Handle form submission
  const handleSubmit = form.onSubmit((values) => {
    console.log('Form submitted with values:', values);
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit}>
        <TextField name="name" />
        <TextField name="email" />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

## Advanced Features

### Conditional Fields

```tsx
const fieldRegistry = {
  'accountType': {
    name: 'accountType',
    label: 'Account Type',
    required: true,
    type: 'radio',
    group: 'account'
  },
  'companyName': {
    name: 'companyName',
    label: 'Company Name',
    required: true,
    placeholder: 'Enter your company name',
    group: 'business',
    relationships: [
      {
        dependsOn: 'accountType',
        type: 'visibility',
        condition: (values) => values.accountType === 'business'
      }
    ]
  }
};
```

### Multi-Step Forms

```tsx
import { useFormWithRegistry, useFormStepper } from '@repo/forms';

// Define form steps
const formSteps = [
  {
    id: 'personal',
    label: 'Personal Information',
    fields: ['firstName', 'lastName', 'email']
  },
  {
    id: 'address',
    label: 'Address',
    fields: ['street', 'city', 'state', 'zip']
  }
];

function MultiStepForm() {
  const form = useFormWithRegistry({
    registry: fieldRegistry,
    initialValues: {/* ... */}
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

  return (
    <FormProvider form={form}>
      {/* Render current step fields */}
      {activeStepId === 'personal' && (
        <div>
          <TextField name="firstName" />
          <TextField name="lastName" />
          <TextField name="email" />
        </div>
      )}

      {/* Navigation buttons */}
      <div>
        {!isFirstStep && <button onClick={prevStep}>Previous</button>}
        {!isLastStep ? (
          <button onClick={nextStep}>Next</button>
        ) : (
          <button type="submit">Submit</button>
        )}
      </div>
    </FormProvider>
  );
}
```

### Async Validation

```tsx
import { useFormWithRegistry, useAsyncValidation } from '@repo/forms';

function FormWithAsyncValidation() {
  const form = useFormWithRegistry({
    registry: fieldRegistry,
    initialValues: {/* ... */}
  });

  const { isValidating, isFieldValidating } = useAsyncValidation(form, {
    onValidate: async (field, value, form) => {
      if (field === 'email') {
        const isAvailable = await checkEmailAvailability(value);
        return isAvailable ? null : 'This email is already taken';
      }
      return null;
    },
    debounce: 500
  });

  return (
    <FormProvider form={form}>
      <form>
        <TextField
          name="email"
          rightSection={isFieldValidating('email') ? 'Checking...' : null}
        />
        {/* Other fields */}
      </form>
    </FormProvider>
  );
}
```

## API Reference

### `useFormWithRegistry`

Creates a form with registry integration.

```tsx
const form = useFormWithRegistry<T>({
  registry: FieldRegistry<T>;
  initialValues: T;
  validate?: (values: T) => Record<string, string> | null;
  // All other Mantine useForm options
});
```

### `useFormStepper`

Creates a multi-step form controller.

```tsx
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
  steps: FormStep<T>[];
  initialStep?: string;
  onStepChange?: (from: string, to: string, values: T) => void;
  validateOnStepChange?: boolean;
});
```

### `useAsyncValidation`

Adds async validation to a form.

```tsx
const {
  isValidating,
  isFieldValidating
} = useAsyncValidation(form, {
  onValidate: async (field: string, value: any, form: FormWithRegistry<T>) => Promise<string | null>;
  debounce?: number;
  validateAll?: boolean;
  onValidateStart?: (field: string) => void;
  onValidateEnd?: (field: string, error: string | null) => void;
});
```

### Field Registry

```tsx
const fieldRegistry = {
  'fieldName': {
    name: string;
    label?: string;
    required?: boolean;
    placeholder?: string;
    type?: string;
    group?: string;
    tab?: string;
    order?: number;
    isArray?: boolean;
    arrayItemDefaults?: any;
    nestedFields?: FieldRegistry<any>;
    relationships?: Array<{
      dependsOn: string;
      type: 'visibility' | 'value' | 'validation';
      condition: (values: T) => boolean | any;
    }>;
    validation?: {
      message?: string;
      // Other validation options
    };
    asyncValidation?: boolean;
    // Other field options
  }
};
```

## Examples

See the `examples` directory for complete examples:

- `CoreExtensionExample.tsx`: Basic form with registry and conditional fields
- `EnhancedFormExample.tsx`: Advanced multi-step form with async validation

## License

MIT

import '@repo/testing/shared';
import '@testing-library/jest-dom';

// Mock Mantine hooks
vi.mock('@mantine/hooks', async () => {
  const actual = await vi.importActual('@mantine/hooks');
  return {
    ...actual,
    useUncontrolled: vi.fn(({ value, defaultValue, onChange }) => {
      const [state, setState] = React.useState(value !== undefined ? value : defaultValue);

      React.useEffect(() => {
        if (value !== undefined) {
          setState(value);
        }
      }, [value]);

      const handleChange = React.useCallback((nextValue) => {
        if (value === undefined) {
          setState(nextValue);
        }
        onChange?.(nextValue);
      }, [value, onChange]);

      return [state, handleChange];
    }),
    useDebouncedCallback: vi.fn((fn, delay) => fn)
  };
});

// Mock Mantine form
vi.mock('@mantine/form', async () => {
  const actual = await vi.importActual('@mantine/form');
  return {
    ...actual,
    useForm: vi.fn((options = {}) => {
      const { initialValues = {}, validate } = options;
      const [values, setValues] = React.useState(initialValues);
      const [errors, setErrors] = React.useState({});

      const validateField = (path) => {
        if (!validate) return { hasError: false };

        const fieldErrors = validate(values);
        if (!fieldErrors) return { hasError: false };

        return {
          hasError: !!fieldErrors[path],
          error: fieldErrors[path]
        };
      };

      return {
        values,
        errors,
        setValues,
        setErrors,
        setFieldValue: (path, value) => {
          setValues(prev => {
            const newValues = { ...prev };
            const pathParts = path.split('.');
            let current = newValues;

            for (let i = 0; i < pathParts.length - 1; i++) {
              if (!current[pathParts[i]]) {
                current[pathParts[i]] = {};
              }
              current = current[pathParts[i]];
            }

            current[pathParts[pathParts.length - 1]] = value;
            return newValues;
          });
        },
        getInputProps: (path) => ({
          value: values[path],
          onChange: (e) => {
            const value = e?.target?.value !== undefined ? e.target.value : e;
            setValues({ ...values, [path]: value });
          },
          error: errors[path]
        }),
        onSubmit: (handler) => (e) => {
          e?.preventDefault();
          handler(values);
        },
        validate: () => {
          if (!validate) return true;
          const validationErrors = validate(values);
          if (validationErrors) {
            setErrors(validationErrors);
            return false;
          }
          return true;
        },
        validateField,
        reset: () => {
          setValues(initialValues);
          setErrors({});
        }
      };
    })
  };
});

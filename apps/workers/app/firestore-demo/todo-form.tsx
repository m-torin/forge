'use client';

import { useRef } from 'react';
import { useActionState, useFormStatus } from 'react-dom';
import { addTodo } from './actions';

// Initial state for the form
const initialState = {
  success: false,
  message: '',
  todo: undefined,
};

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
    >
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function TodoForm() {
  const [state, formAction] = useActionState(addTodo, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form
        ref={formRef}
        action={async (formData) => {
          await formAction(formData);
          // Reset the form if successful
          if (formRef.current && state.success) {
            formRef.current.reset();
          }
        }}
        className="flex flex-col space-y-4"
      >
        <input
          type="text"
          name="title"
          placeholder="Enter todo title"
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <SubmitButton />
      </form>

      {state.message && (
        <div className={`mt-4 p-3 rounded ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {state.message}
        </div>
      )}
    </div>
  );
}

'use client';

import { useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { addTodo } from './actions';

// Initial state for the form
const initialState = {
  message: '',
  success: false,
  todo: undefined,
};

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Adding...' : 'Add Todo'}
    </button>
  );
}

export default function TodoForm() {
  // Create a wrapper action that matches useActionState signature
  const actionWrapper = async (_prevState: any, formData: FormData) => {
    return await addTodo(formData);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [state, formAction] = useActionState(actionWrapper, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div>
      <form ref={formRef} action={formAction} className="flex flex-col space-y-4">
        <input
          placeholder="Enter todo title"
          className="px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          name="title"
          required
          type="text"
        />
        <SubmitButton />
      </form>

      {state.message && (
        <div
          className={`mt-4 p-3 rounded ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {state.message}
        </div>
      )}
    </div>
  );
}

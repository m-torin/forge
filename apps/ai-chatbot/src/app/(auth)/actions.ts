'use server';

import { z } from 'zod/v4';

import { createUser, getUser } from '#/lib/db/queries';

import { signIn } from '#/app/(auth)/auth';

/**
 * Validation schema for authentication forms
 */
const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

/**
 * State interface for login action
 */
export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

/**
 * Server action to handle user login
 * @param _ - Previous state (unused)
 * @param formData - Form data containing email and password
 * @returns Promise resolving to login action state
 */
export const login = async (_: LoginActionState, formData: FormData): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

/**
 * State interface for register action
 */
export interface RegisterActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'user_exists' | 'invalid_data';
}

/**
 * Server action to handle user registration
 * @param _ - Previous state (unused)
 * @param formData - Form data containing email and password
 * @returns Promise resolving to register action state
 */
export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }
    await createUser(validatedData.email, validatedData.password);
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

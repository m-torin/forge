import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset';
import { Input } from '@/shared/input';
import Form from 'next/form';
import Link from 'next/link';

export const metadata = {
  title: 'Forgot Password',
  description: 'Forgot password page for the application',
};

const PageForgotPass = () => {
  const handleSubmit = async (formData: FormData) => {
    'use server';
    const _formObject = Object.fromEntries(formData.entries());
    // TODO: Handle forgot password logic
  };

  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl font-semibold leading-[1.15] text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          Forgot password
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          Enter your email address to reset your password
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">
        {/* FORM */}
        <Form action={handleSubmit}>
          <Fieldset>
            <FieldGroup>
              <Field>
                <Label>Email address</Label>
                <Input type="email" name="email" placeholder="example@example.com" />
              </Field>
              <ButtonPrimary className="w-full" type="submit">
                Continue
              </ButtonPrimary>
            </FieldGroup>
          </Fieldset>
        </Form>

        {/* ==== */}
        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          Go back for {` `}
          <Link href="/login" className="text-primary-600 underline">
            Sign in
          </Link>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
          <Link href="/signup" className="text-primary-600 underline">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  );
};

export default PageForgotPass;

import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset';
import { Input } from '@/shared/input';
import Form from 'next/form';

export const metadata = {
  title: 'Account - Password',
  description: 'Account - Password page',
};

const Page = () => {
  const handleSubmit = async (formData: FormData) => {
    'use server';
    const _formObject = Object.fromEntries(formData.entries());
    // TODO: Handle password update logic
  };

  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold">Update your password</h1>
        <p className="mt-4 text-neutral-500 dark:text-neutral-400">
          Update your password to keep your account secure.
        </p>
      </div>

      <Form action={handleSubmit}>
        <Fieldset>
          <FieldGroup className="max-w-xl">
            <Field>
              <Label>Current password</Label>
              <Input type="password" name="current-password" />
            </Field>
            <Field>
              <Label>New password</Label>
              <Input type="password" name="new-password" />
            </Field>
            <Field>
              <Label>Confirm password</Label>
              <Input type="password" name="confirm-password" />
            </Field>
            <div className="pt-2">
              <ButtonPrimary>Update password</ButtonPrimary>
            </div>
          </FieldGroup>
        </Fieldset>
      </Form>
    </div>
  );
};

export default Page;

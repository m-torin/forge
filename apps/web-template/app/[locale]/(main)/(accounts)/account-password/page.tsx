import { PasswordForm } from './password-form';

export const metadata = {
  description: 'Account - Password page',
  title: 'Account - Password',
};

const Page = () => {
  return (
    <div className="flex flex-col gap-y-10 sm:gap-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Update your password</h1>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Update your password to keep your account secure.
        </p>
      </div>

      <PasswordForm />
    </div>
  );
};

export default Page;

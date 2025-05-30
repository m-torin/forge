import Label from '@/components/Label/Label';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import Input from '@/shared/Input/Input';

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

      <div className="flex max-w-xl flex-col gap-y-6">
        <div>
          <Label>Current password</Label>
          <Input className="mt-1.5" type="password" />
        </div>
        <div>
          <Label>New password</Label>
          <Input className="mt-1.5" type="password" />
        </div>
        <div>
          <Label>Confirm password</Label>
          <Input className="mt-1.5" type="password" />
        </div>
        <div className="pt-2">
          <ButtonPrimary>Update password</ButtonPrimary>
        </div>
      </div>
    </div>
  );
};

export default Page;

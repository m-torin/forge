import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { Input } from '@/shared/input';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'Coming soon page for the application',
};

const Page = () => {
  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 mt-20 text-center sm:mb-16 sm:mt-28 lg:mb-20">
        <h1 className="leading flex items-center justify-center text-6xl/none font-bold tracking-wide text-neutral-900 md:text-8xl/none dark:text-neutral-100">
          Coming Soon.
        </h1>
        <span className="mt-5 block text-base text-neutral-700 sm:text-lg dark:text-neutral-200">
          From automation to AI, we are working on something big. Stay tuned! <br />
          We will be launching soon. Sign up to get notified.
        </span>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-y-6">
        {/* FORM */}
        <form>
          <Input type="email" name="email" placeholder="Your email address" />
          <ButtonPrimary className="mt-5 w-full" type="submit">
            Notify Me
          </ButtonPrimary>
        </form>

        {/* ==== */}
        <span className="block text-center text-neutral-500 dark:text-neutral-300">
          Notify me when App is lauched
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
          <Link href="/login" className="text-primary-600">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default Page;

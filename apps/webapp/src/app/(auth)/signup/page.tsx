import facebookSvg from '@/images/socials/facebook-2.svg';
import googleSvg from '@/images/socials/google.svg';
import twitterSvg from '@/images/socials/twitter.svg';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import { Field, FieldGroup, Fieldset, Label } from '@/shared/fieldset';
import { Input } from '@/shared/input';
import { Metadata } from 'next';
import Form from 'next/form';
import Image from 'next/image';
import Link from 'next/link';

const loginSocials = [
  {
    name: 'Continue with Facebook',
    href: '#',
    icon: facebookSvg,
  },
  {
    name: 'Continue with Twitter',
    href: '#',
    icon: twitterSvg,
  },
  {
    name: 'Continue with Google',
    href: '#',
    icon: googleSvg,
  },
];

export const metadata: Metadata = {
  title: 'Signup',
  description: 'Signup page for the application',
};

const PageSignUp = () => {
  const handleSubmit = async (formData: FormData) => {
    'use server';
    const _formObject = Object.fromEntries(formData.entries());
    // TODO: Handle signup logic
  };

  return (
    <div className="container mb-24 lg:mb-32">
      <h1 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
        Sign up
      </h1>
      <div className="mx-auto max-w-md space-y-6">
        <div className="grid gap-3">
          {loginSocials.map(item => (
            <a
              key={`signup-social-${item.name}`}
              href={item.href}
              className="bg-primary-50 flex w-full transform rounded-lg px-4 py-3 transition-transform hover:translate-y-[-2px] sm:px-6 dark:bg-neutral-800"
            >
              <Image
                sizes="40px"
                className="size-5 shrink-0 object-cover"
                src={item.icon}
                alt={item.name}
              />
              <h3 className="grow text-center text-sm font-medium text-neutral-700 sm:text-sm dark:text-neutral-300">
                {item.name}
              </h3>
            </a>
          ))}
        </div>
        {/* OR */}
        <div className="relative text-center">
          <span className="relative z-10 inline-block bg-white px-4 text-sm font-medium dark:bg-neutral-900 dark:text-neutral-400">
            OR
          </span>
          <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 transform border border-neutral-100 dark:border-neutral-800" />
        </div>
        {/* FORM */}
        <Form action={handleSubmit}>
          <Fieldset>
            <FieldGroup className="sm:space-y-6">
              <Field>
                <Label>Email</Label>
                <Input type="email" name="email" placeholder="example@example.com" />
              </Field>
              <Field>
                <Label>Password</Label>
                <Input type="password" name="password" />
              </Field>

              <ButtonPrimary className="mt-2 w-full" type="submit" data-testid="signup-button">
                Continue
              </ButtonPrimary>
            </FieldGroup>
          </Fieldset>
        </Form>

        {/* ==== */}
        <span className="block text-center text-sm text-neutral-700 dark:text-neutral-300">
          Already have an account? {` `}
          <Link className="text-primary-600 underline" href="/login">
            Sign in
          </Link>
        </span>
      </div>
    </div>
  );
};

export default PageSignUp;

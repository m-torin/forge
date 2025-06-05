import Link from "next/link";
import { type Metadata } from "next";

import { ButtonPrimary, Input } from "@repo/design-system/mantine-ciseco";
import { getDictionary } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    description: dict.auth.forgotPasswordDescription,
    title: dict.auth.forgotPassword,
  };
}

const PageForgotPass = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale);
  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl font-semibold leading-[1.15] text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          {dict.auth.forgotPassword}
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          {dict.auth.welcomeToCommunity}
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">
        {/* FORM */}
        <form action="#" method="post" className="grid grid-cols-1 gap-6">
          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200">
              {dict.auth.emailAddress}
            </span>
            <Input
              placeholder={dict.auth.emailPlaceholder}
              className="mt-1"
              type="email"
            />
          </label>
          <ButtonPrimary type="submit">{dict.auth.continue}</ButtonPrimary>
        </form>

        {/* ==== */}
        <span className="block text-center text-neutral-700 dark:text-neutral-300">
          {dict.auth.goBackFor} {` `}
          <Link href="/login" className="text-primary-600">
            {dict.auth.signIn}
          </Link>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">
            /
          </span>
          <Link href="/signup" className="text-primary-600">
            {dict.auth.signup}
          </Link>
        </span>
      </div>
    </div>
  );
};

export default PageForgotPass;

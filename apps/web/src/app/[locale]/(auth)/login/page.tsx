import { getDictionary } from "@/i18n";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  ButtonPrimary,
  facebookSvg,
  googleSvg,
  Input,
  twitterSvg,
} from "@repo/design-system/mantine-ciseco";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);
  return {
    description: dict.auth.loginDescription,
    title: dict.auth.login,
  };
}

const PageLogin = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale);

  const loginSocials = [
    {
      name: dict.auth.continueWithFacebook,
      href: "#",
      icon: facebookSvg,
    },
    {
      name: dict.auth.continueWithTwitter,
      href: "#",
      icon: twitterSvg,
    },
    {
      name: dict.auth.continueWithGoogle,
      href: "#",
      icon: googleSvg,
    },
  ];
  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl font-semibold leading-[115%] text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          {dict.auth.login}
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <div className="grid gap-3">
            {loginSocials.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="bg-primary-50 flex w-full rounded-lg px-4 py-3 transition-transform hover:-translate-y-0.5 sm:px-6 dark:bg-neutral-800"
              >
                <Image
                  className="size-5 shrink-0 object-cover"
                  alt={item.name}
                  sizes="40px"
                  src={item.icon}
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
              {dict.auth.or}
            </span>
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border border-neutral-100 dark:border-neutral-800" />
          </div>
          {/* FORM */}
          <form action="#" method="post" className="grid grid-cols-1 gap-6">
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">
                {dict.auth.email}{" "}
              </span>
              <Input
                placeholder={dict.auth.emailPlaceholder}
                className="mt-1"
                type="email"
              />
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-neutral-800 dark:text-neutral-200">
                {dict.auth.password}
                <Link
                  href="/forgot-password"
                  className="text-primary-600 text-sm"
                >
                  {dict.auth.forgotPasswordQuestion}
                </Link>
              </span>
              <Input className="mt-1" type="password" />
            </label>
            <ButtonPrimary href="/" type="submit">
              {dict.auth.continue}
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            {dict.auth.newUser} {` `}
            <Link href="/signup" className="text-primary-600">
              {dict.auth.createAccount}
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default PageLogin;

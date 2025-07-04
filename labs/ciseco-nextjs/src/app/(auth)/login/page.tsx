import facebookSvg from '@/images/socials/facebook-2.svg'
import googleSvg from '@/images/socials/google.svg'
import twitterSvg from '@/images/socials/twitter.svg'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Input from '@/shared/Input/Input'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login page for the application',
}

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
]

const PageLogin = () => {
  return (
    <div>
      <div className="container mb-24 lg:mb-32">
        <h1 className="my-20 flex items-center justify-center text-3xl leading-[115%] font-semibold text-neutral-900 md:text-5xl md:leading-[115%] dark:text-neutral-100">
          Login
        </h1>
        <div className="mx-auto flex max-w-md flex-col gap-y-6">
          <div className="grid gap-3">
            {loginSocials.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex w-full rounded-lg bg-primary-50 px-4 py-3 transition-transform hover:-translate-y-0.5 sm:px-6 dark:bg-neutral-800"
              >
                <Image className="size-5 shrink-0 object-cover" src={item.icon} alt={item.name} sizes="40px" />
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
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 transform border border-neutral-100 dark:border-neutral-800"></div>
          </div>
          {/* FORM */}
          <form className="grid grid-cols-1 gap-6" action="#" method="post">
            <label className="block">
              <span className="text-neutral-800 dark:text-neutral-200">Email </span>
              <Input type="email" placeholder="example@example.com" className="mt-1" />
            </label>
            <label className="block">
              <span className="flex items-center justify-between text-neutral-800 dark:text-neutral-200">
                Password
                <Link href="/forgot-password" className="text-sm text-primary-600">
                  Forgot password?
                </Link>
              </span>
              <Input type="password" className="mt-1" />
            </label>
            <ButtonPrimary href="/" type="submit">
              Continue
            </ButtonPrimary>
          </form>

          {/* ==== */}
          <span className="block text-center text-neutral-700 dark:text-neutral-300">
            New user? {` `}
            <Link className="text-primary-600" href="/signup">
              Create an account
            </Link>
          </span>
        </div>
      </div>
    </div>
  )
}

export default PageLogin

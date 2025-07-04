import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Input from '@/shared/Input/Input'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'Coming soon page for the application',
}

const Page = () => {
  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mt-20 mb-14 text-center sm:mt-28 sm:mb-16 lg:mb-20">
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
        <form className="grid grid-cols-1 gap-5" action="#" method="post">
          <label className="block">
            <Input
              type="email"
              placeholder="Your email address"
              className="mt-1"
              sizeClass="h-[52px] px-5 py-3"
              fontClass="text-base font-normal"
            />
          </label>
          <ButtonPrimary type="submit">Notify Me</ButtonPrimary>
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
  )
}

export default Page

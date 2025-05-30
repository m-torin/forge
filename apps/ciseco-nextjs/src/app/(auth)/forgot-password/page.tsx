import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Input from '@/shared/Input/Input'
import Link from 'next/link'

export const metadata = {
  title: 'Forgot Password',
  description: 'Forgot password page for the application',
}

const PageForgotPass = () => {
  return (
    <div className="container mb-24 lg:mb-32">
      <header className="mx-auto mb-14 max-w-2xl text-center sm:mb-16 lg:mb-20">
        <h1 className="mt-20 flex items-center justify-center text-3xl leading-[1.15] font-semibold text-neutral-900 md:text-5xl md:leading-[1.15] dark:text-neutral-100">
          Forgot password
        </h1>
        <span className="mt-4 block text-sm text-neutral-700 sm:text-base dark:text-neutral-200">
          Welcome to our Community
        </span>
      </header>

      <div className="mx-auto max-w-md space-y-6">
        {/* FORM */}
        <form className="grid grid-cols-1 gap-6" action="#" method="post">
          <label className="block">
            <span className="text-neutral-800 dark:text-neutral-200">Email address</span>
            <Input type="email" placeholder="example@example.com" className="mt-1" />
          </label>
          <ButtonPrimary type="submit">Continue</ButtonPrimary>
        </form>

        {/* ==== */}
        <span className="block text-center text-neutral-700 dark:text-neutral-300">
          Go back for {` `}
          <Link href="/login" className="text-primary-600">
            Sign in
          </Link>
          <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">/</span>
          <Link href="/signup" className="text-primary-600">
            Sign up
          </Link>
        </span>
      </div>
    </div>
  )
}

export default PageForgotPass

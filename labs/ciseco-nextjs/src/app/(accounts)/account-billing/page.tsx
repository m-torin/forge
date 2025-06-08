import { ButtonPrimary } from '@repo/design-system/ciseco'

export const metadata = {
  title: 'Account - Payments & payouts',
  description: 'Account - Payments & payouts page',
}

const Page = () => {
  return (
    <div className="space-y-10 sm:space-y-12">
      {/* HEADING */}
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">Payments & payouts</h1>
        <p className="mt-2.5 text-neutral-500 dark:text-neutral-400">
          Manage your payment methods and view your payout history.
        </p>
      </div>
      {/* CONTENT */}
      <div className="prose prose-slate dark:prose-invert max-w-2xl">
        <span className="">
          {`When you receive a payment for a order, we call that payment to you a
          "payout." Our secure payment system supports several payout methods,
          which can be set up below. Go to FAQ.`}
          <br />
          <br />
          To get paid, you need to set up a payout method releases payouts about 24 hours after a guest’s scheduled
          time. The time it takes for the funds to appear in your account depends on your payout method.{` `}
          <a href="##">Learn more</a>
        </span>
        <div className="pt-10">
          <ButtonPrimary>Add payout mothod</ButtonPrimary>
        </div>
      </div>
    </div>
  )
}

export default Page

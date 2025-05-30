import Label from '@/components/Label/Label'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import ButtonSecondary from '@/shared/Button/ButtonSecondary'
import Checkbox from '@/shared/Checkbox/Checkbox'
import Input from '@/shared/Input/Input'
import { FC } from 'react'

interface Props {
  isActive: boolean
  onOpenActive: () => void
  onCloseActive: () => void
}

const ContactInfo: FC<Props> = ({ isActive, onCloseActive, onOpenActive }) => {
  const renderAccount = () => {
    return (
      <div className="z-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-start p-6 sm:flex-row">
          <span className="hidden sm:block">
            <svg
              className="mt-0.5 h-6 w-6 text-neutral-700 dark:text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.12 12.78C12.05 12.77 11.96 12.77 11.88 12.78C10.12 12.72 8.71997 11.28 8.71997 9.50998C8.71997 7.69998 10.18 6.22998 12 6.22998C13.81 6.22998 15.28 7.69998 15.28 9.50998C15.27 11.28 13.88 12.72 12.12 12.78Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18.74 19.3801C16.96 21.0101 14.6 22.0001 12 22.0001C9.40001 22.0001 7.04001 21.0101 5.26001 19.3801C5.36001 18.4401 5.96001 17.5201 7.03001 16.8001C9.77001 14.9801 14.25 14.9801 16.97 16.8001C18.04 17.5201 18.64 18.4401 18.74 19.3801Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div className="sm:ml-8">
            <h3 className="flex text-neutral-700 dark:text-neutral-300">
              <span className="tracking-tight uppercase">CONTACT INFO</span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="ml-3 h-5 w-5 text-neutral-900 dark:text-neutral-100"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </h3>
            <div className="mt-1 text-sm font-semibold">
              <span className="">Enrico Smith</span>
              <span className="ml-3 tracking-tighter">+855 - 666 - 7744</span>
            </div>
          </div>
          <button
            className="mt-5 rounded-lg bg-neutral-50 px-4 py-2 text-sm font-medium hover:bg-neutral-100 sm:mt-0 sm:ml-auto dark:bg-neutral-800 dark:hover:bg-neutral-700"
            onClick={() => onOpenActive()}
          >
            Change
          </button>
        </div>
        <div
          className={`space-y-4 border-t border-neutral-200 px-6 py-7 sm:space-y-6 dark:border-neutral-700 ${
            isActive ? 'block' : 'hidden'
          }`}
        >
          <div className="flex flex-wrap items-baseline justify-between">
            <h3 className="text-lg font-semibold">Contact infomation</h3>
            <span className="my-1 block text-sm md:my-0">
              Do not have an account?{` `}
              <a href="##" className="font-medium text-primary-500">
                Log in
              </a>
            </span>
          </div>
          <div className="max-w-lg">
            <Label className="text-sm">Your phone number</Label>
            <Input className="mt-1.5" defaultValue={'+808 xxx'} type={'tel'} />
          </div>
          <div className="max-w-lg">
            <Label className="text-sm">Email address</Label>
            <Input className="mt-1.5" type={'email'} />
          </div>
          <div>
            <Checkbox name="uudai" label="Email me news and offers" defaultChecked />
          </div>

          {/* ============ */}
          <div className="flex flex-col pt-6 sm:flex-row">
            <ButtonPrimary className="shadow-none sm:px-7!" onClick={() => onCloseActive()}>
              Save and next to Shipping
            </ButtonPrimary>
            <ButtonSecondary className="mt-3 sm:mt-0 sm:ml-3" onClick={() => onCloseActive()}>
              Cancel
            </ButtonSecondary>
          </div>
        </div>
      </div>
    )
  }

  return renderAccount()
}

export default ContactInfo

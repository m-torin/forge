'use client'
import { Switch } from '@headlessui/react'
import { FC, useEffect, useState } from 'react'
import Label from './Label/Label'

export interface MySwitchProps {
  enabled?: boolean
  label?: string
  desc?: string
  className?: string
  onChange?: (enabled: boolean) => void
}

const MySwitch: FC<MySwitchProps> = ({
  enabled = false,
  label = 'Put on sale',
  desc = 'You’ll receive bids on this item',
  className = '',
  onChange,
}) => {
  const [enabledState, setEnabledState] = useState(false)

  useEffect(() => {
    setEnabledState(enabled)
  }, [enabled])

  return (
    <div className={`MySwitch fle flex items-center justify-between space-x-2 ${className}`}>
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</p>
      </div>
      <Switch
        checked={enabledState}
        onChange={(e: boolean) => {
          setEnabledState(e)
          onChange && onChange(e)
        }}
        className={`${
          enabledState ? 'bg-teal-700' : 'bg-neutral-400 dark:bg-neutral-600'
        } relative inline-flex h-8 w-[68px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/75`}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden="true"
          className={`${enabledState ? 'translate-x-9' : 'translate-x-0'} pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  )
}

export default MySwitch

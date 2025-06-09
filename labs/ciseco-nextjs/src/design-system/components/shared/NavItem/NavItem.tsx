import React, { type FC, type ReactNode } from 'react'

export interface NavItemProps {
  children?: React.ReactNode
  className?: string
  isActive?: boolean
  onClick?: () => void
  radius?: string
  renderX?: ReactNode
}

const NavItem: FC<NavItemProps> = ({
  children,
  className = 'px-5 py-2.5 text-sm sm:text-base sm:px-6 sm:py-3 capitalize',
  isActive = false,
  onClick = () => {},
  radius = 'rounded-full',
  renderX,
}) => {
  return (
    <li className="relative">
      {renderX && renderX}
      <button
        onClick={() => {
          onClick && onClick()
        }}
        className={`leading-none! block whitespace-nowrap font-medium ${className} ${radius} ${
          isActive
            ? 'bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
            : 'text-neutral-500 hover:bg-neutral-100/75 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
        }`}
      >
        {children}
      </button>
    </li>
  )
}

export default NavItem

import React, { type FC, type ReactNode } from 'react'

export interface NavItem2Props {
  children?: React.ReactNode
  className?: string
  isActive?: boolean
  onClick?: () => void
  radius?: string
  renderX?: ReactNode
}

const NavItem2: FC<NavItem2Props> = ({
  children,
  className = 'px-3.5 py-2 text-sm sm:px-7 sm:py-3 capitalize',
  isActive = false,
  onClick = () => {},
  radius = 'rounded-full',
  renderX,
}) => {
  return (
    <li className="nc-NavItem2 relative">
      {renderX && renderX}
      <button
        onClick={() => {
          onClick && onClick()
        }}
        className={`block whitespace-nowrap font-medium ${className} ${radius} ${
          isActive
            ? 'bg-neutral-900 text-neutral-50'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
        } `}
      >
        {children}
      </button>
    </li>
  )
}

export default NavItem2

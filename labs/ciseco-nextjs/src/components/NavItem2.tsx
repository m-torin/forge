import React, { FC, ReactNode } from 'react'

export interface NavItem2Props {
  className?: string
  radius?: string
  onClick?: () => void
  isActive?: boolean
  renderX?: ReactNode
  children?: React.ReactNode
}

const NavItem2: FC<NavItem2Props> = ({
  className = 'px-3.5 py-2 text-sm sm:px-7 sm:py-3 capitalize',
  radius = 'rounded-full',
  children,
  onClick = () => {},
  isActive = false,
  renderX,
}) => {
  return (
    <li className="nc-NavItem2 relative">
      {renderX && renderX}
      <button
        className={`block font-medium whitespace-nowrap ${className} ${radius} ${
          isActive
            ? 'bg-neutral-900 text-neutral-50'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
        } `}
        onClick={() => {
          onClick && onClick()
        }}
      >
        {children}
      </button>
    </li>
  )
}

export default NavItem2

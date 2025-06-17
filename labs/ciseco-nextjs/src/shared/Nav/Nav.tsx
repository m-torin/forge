import React, { FC } from 'react'

export interface NavProps {
  containerClassName?: string
  className?: string
  children?: React.ReactNode
}

const Nav: FC<NavProps> = ({ containerClassName = '', className = '', children }) => {
  return (
    <nav className={containerClassName}>
      <ul className={`flex ${className}`}>{children}</ul>
    </nav>
  )
}

export default Nav

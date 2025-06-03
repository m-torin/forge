import React, { type FC } from 'react';

export interface NavProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const Nav: FC<NavProps> = ({ children, className = '', containerClassName = '' }) => {
  return (
    <nav className={containerClassName}>
      <ul className={`flex ${className}`}>{children}</ul>
    </nav>
  );
};

export default Nav;

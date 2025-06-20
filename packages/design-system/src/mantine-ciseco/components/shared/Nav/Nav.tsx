import React, { type FC } from 'react';

export interface NavProps extends Record<string, any> {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const Nav: FC<NavProps> = ({ children, className = '', containerClassName = '' }: any) => {
  return (
    <nav className={containerClassName}>
      <ul className={`flex ${className}`}>{children}</ul>
    </nav>
  );
};

export default Nav;

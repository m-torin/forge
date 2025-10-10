import React, { FC } from 'react';

interface NavProps {
  className?: string;
  children?: React.ReactNode;
}

const Nav: FC<NavProps> = ({ className = '', children }) => {
  return <ul className={`hidden-scrollbar flex overflow-x-auto ${className}`}>{children}</ul>;
};

export default Nav;

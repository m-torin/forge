import React, { FC } from 'react';

interface Props {
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
  children?: React.ReactNode;
}

const NavItem2: FC<Props> = ({
  className = 'px-4 py-2.5 sm:text-sm sm:px-6 sm:py-3 capitalize',
  children,
  onClick,
  isActive = false,
}) => {
  return (
    <li className="relative">
      <button
        className={`block cursor-pointer whitespace-nowrap rounded-full font-medium ${className} ${
          isActive
            ? 'bg-neutral-900 text-neutral-50'
            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
        } `}
        onClick={() => {
          onClick && onClick();
        }}
      >
        {children}
      </button>
    </li>
  );
};

export default NavItem2;

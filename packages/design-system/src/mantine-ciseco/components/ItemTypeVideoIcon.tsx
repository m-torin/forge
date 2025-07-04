import React from 'react';

export interface ItemTypeVideoIconProps extends Record<string, any> {
  className?: string;
}

const ItemTypeVideoIcon: React.FC<ItemTypeVideoIconProps> = ({
  className = 'w-8 h-8 md:w-10 md:h-10',
}) => {
  return (
    <div
      className={`bg-black/50  flex items-center justify-center rounded-full text-white ${className}`}
    >
      <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24">
        <path
          d="M12.53 20.4201H6.21C3.05 20.4201 2 18.3201 2 16.2101V7.79008C2 4.63008 3.05 3.58008 6.21 3.58008H12.53C15.69 3.58008 16.74 4.63008 16.74 7.79008V16.2101C16.74 19.3701 15.68 20.4201 12.53 20.4201Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M19.52 17.0999L16.74 15.1499V8.83989L19.52 6.88989C20.88 5.93989 22 6.51989 22 8.18989V15.8099C22 17.4799 20.88 18.0599 19.52 17.0999Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path
          d="M11.5 11C12.3284 11 13 10.3284 13 9.5C13 8.67157 12.3284 8 11.5 8C10.6716 8 10 8.67157 10 9.5C10 10.3284 10.6716 11 11.5 11Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
};

export default ItemTypeVideoIcon;

'use client';
import { StarIcon } from '@heroicons/react/24/solid';
import React, { type FC, useEffect } from 'react';
import { useState } from 'react';

export interface FiveStartIconForRateProps {
  className?: string;
  defaultPoint?: number;
  iconClass?: string;
}

const FiveStartIconForRate: FC<FiveStartIconForRateProps> = ({
  className = '',
  defaultPoint = 5,
  iconClass = 'w-4 h-4',
}) => {
  const [point, setPoint] = useState(defaultPoint);
  const [currentHover, setCurrentHover] = useState(0);

  useEffect(() => {
    setPoint(defaultPoint);
  }, [defaultPoint]);

  return (
    <div
      data-nc-id="FiveStartIconForRate"
      className={`nc-FiveStartIconForRate flex items-center text-neutral-300 ${className}`}
    >
      {[1, 2, 3, 4, 5].map((item) => {
        return (
          <StarIcon
            key={item}
            onClick={() => setPoint(() => item)}
            onMouseEnter={() => setCurrentHover(() => item)}
            onMouseLeave={() => setCurrentHover(() => 0)}
            className={`${
              point >= item || currentHover >= item ? 'text-yellow-500' : ''
            } ${iconClass}`}
          />
        );
      })}
    </div>
  );
};

export default FiveStartIconForRate;

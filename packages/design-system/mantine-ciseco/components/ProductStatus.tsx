import { ClockIcon, NoSymbolIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { type FC } from 'react';

import IconDiscount from './IconDiscount';

interface Props {
  animate?: boolean;
  availableDate?: string;
  className?: string;
  clickable?: boolean;
  colorScheme?: {
    background: string;
    text: string;
  };
  icon?: React.ReactNode;
  maxStock?: number;
  notification?: boolean;
  onClick?: () => void;
  restockDate?: string;
  shape?: 'rounded' | 'square' | 'pill';
  showCount?: boolean;
  showDate?: boolean;
  showIcon?: boolean;
  showProgress?: boolean;
  showRestockDate?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | { base: string; sm: string; md: string; lg: string };
  status?: string;
  stockCount?: number;
  text?: string;
  tooltip?: string;
  urgent?: boolean;
  variant?: 'filled' | 'outline' | 'light' | 'dot';
}

const ProductStatus: FC<Props> = ({
  className = 'absolute top-3 start-3 px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300',
  status = 'New in',
}) => {
  const renderStatus = () => {
    if (!status) {
      return null;
    }
    const classes = `nc-shadow-lg rounded-full flex items-center justify-center ${className}`;
    if (status === 'New in') {
      return (
        <div className={classes}>
          <SparklesIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === '50% Discount') {
      return (
        <div className={classes}>
          <IconDiscount className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === 'Sold Out') {
      return (
        <div className={classes}>
          <NoSymbolIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    if (status === 'limited edition') {
      return (
        <div className={classes}>
          <ClockIcon className="h-3.5 w-3.5" />
          <span className="ms-1 leading-none">{status}</span>
        </div>
      );
    }
    return null;
  };

  return renderStatus();
};

export default ProductStatus;

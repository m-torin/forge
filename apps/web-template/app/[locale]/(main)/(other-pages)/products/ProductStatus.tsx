import {
  IconCheck,
  IconClock,
  IconBan,
  IconSparkles,
  IconDiscountCheck,
} from '@tabler/icons-react';
import clsx from 'clsx';

const ProductStatus = ({ className, status }: { status: string; className?: string }) => {
  const renderStatus = () => {
    if (status === 'In Stock') {
      return (
        <>
          <IconCheck className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      );
    }
    if (status === 'New in') {
      return (
        <>
          <IconSparkles className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      );
    }
    if (status === '50% Discount') {
      return (
        <>
          <IconDiscountCheck className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      );
    }
    if (status === 'Sold Out') {
      return (
        <>
          <IconBan className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      );
    }
    if (status === 'limited edition') {
      return (
        <>
          <IconClock className="size-5" />
          <span className="ml-1 leading-none">{status}</span>
        </>
      );
    }
    return null;
  };

  return (
    <div
      className={clsx(
        className,
        'flex items-center justify-center text-sm/normal text-neutral-900 dark:bg-neutral-900 dark:text-neutral-200',
      )}
    >
      {renderStatus()}
    </div>
  );
};

export default ProductStatus;

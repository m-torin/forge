import Image from 'next/image';
import { type FC } from 'react';

export interface AvatarProps {
  containerClassName?: string;
  imgUrl?: string;
  radius?: string;
  sizeClass?: string;
  testId?: string;
  userName?: string;
  loading?: boolean;
  error?: string;
}

// Loading skeleton for Avatar
function AvatarSkeleton({
  containerClassName,
  radius,
  sizeClass,
  testId,
}: {
  containerClassName?: string;
  radius?: string;
  sizeClass?: string;
  testId?: string;
}) {
  return (
    <div
      className={`wil-avatar relative inline-flex shrink-0 items-center justify-center font-semibold text-neutral-100 uppercase shadow-inner bg-gray-200 dark:bg-gray-700 animate-pulse ${radius} ${sizeClass} ${containerClassName}`}
      data-testid={testId}
    />
  );
}

// Error state for Avatar
function AvatarError({
  containerClassName,
  radius,
  sizeClass,
  testId,
  userName,
}: {
  containerClassName?: string;
  radius?: string;
  sizeClass?: string;
  testId?: string;
  userName?: string;
}) {
  const _name = userName ?? 'John Doe';
  return (
    <div
      className={`wil-avatar relative inline-flex shrink-0 items-center justify-center font-semibold text-red-100 uppercase shadow-inner bg-red-500 ${radius} ${sizeClass} ${containerClassName}`}
      data-testid={testId}
    >
      <svg
        className="w-1/2 h-1/2 text-red-100"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
  );
}

const Avatar: FC<AvatarProps> = ({
  containerClassName = 'ring-1 ring-white dark:ring-neutral-900',
  imgUrl,
  radius = 'rounded-full',
  sizeClass = 'size-6 text-sm',
  testId,
  userName,
  loading = false,
  error,
}) => {
  // Show loading state
  if (loading) {
    return (
      <AvatarSkeleton
        containerClassName={containerClassName}
        radius={radius}
        sizeClass={sizeClass}
        testId={testId}
      />
    );
  }

  // Show error state
  if (error) {
    return (
      <AvatarError
        containerClassName={containerClassName}
        radius={radius}
        sizeClass={sizeClass}
        testId={testId}
        userName={userName}
      />
    );
  }
  const url = imgUrl || '';
  const name = userName ?? 'John Doe';
  const _setBgColor = (name: string) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8C33'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`wil-avatar relative inline-flex shrink-0 items-center justify-center font-semibold text-neutral-100 uppercase shadow-inner ${radius} ${sizeClass} ${containerClassName}`}
      data-testid={testId}
      style={{ backgroundColor: url ? undefined : _setBgColor(name) }}
    >
      {url && (
        <Image
          alt={name}
          className={`absolute inset-0 h-full w-full object-cover ${radius}`}
          fill
          sizes="100px"
          src={url}
        />
      )}
      <span className="wil-avatar__name">{name[0]}</span>
    </div>
  );
};

export { Avatar };
export default Avatar;

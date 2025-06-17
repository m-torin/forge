import Image, { type StaticImageData } from 'next/image';
import { type FC } from 'react';

import avatarImage from '../../../images/users/avatar4.jpg';
import VerifyIcon from '../../VerifyIcon';

export interface AvatarProps extends Record<string, any> {
  containerClassName?: string;
  hasChecked?: boolean;
  hasCheckedClass?: string;
  imgUrl?: StaticImageData | string;
  radius?: string;
  sizeClass?: string;
  testId?: string;
  userName?: string;
}

const Avatar: FC<AvatarProps> = ({
  containerClassName = 'ring-1 ring-white dark:ring-neutral-900',
  hasChecked,
  hasCheckedClass = 'w-4 h-4 bottom-1 -right-0.5',
  imgUrl = avatarImage,
  radius = 'rounded-full',
  sizeClass = 'size-6 text-sm',
  testId,
  userName,
}) => {
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

      {hasChecked && (
        <span className={`absolute text-white ${hasCheckedClass}`}>
          <VerifyIcon className="" />
        </span>
      )}
    </div>
  );
};

export { Avatar };
export default Avatar;

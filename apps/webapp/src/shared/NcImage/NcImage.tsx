import Image, { ImageProps } from 'next/image';
import { FC } from 'react';

export interface NcImageProps extends Omit<ImageProps, 'alt'> {
  containerClassName?: string;
  alt?: string;
  'data-testid'?: string;
}

const NcImage: FC<NcImageProps> = ({
  containerClassName = '',
  alt = 'nc-image',
  className = 'object-cover w-full h-full',
  'data-testid': dataTestId,
  ...args
}) => {
  return (
    <div className={containerClassName}>
      <Image className={className} alt={alt} data-testid={dataTestId || 'nc-image'} {...args} />
    </div>
  );
};

export default NcImage;

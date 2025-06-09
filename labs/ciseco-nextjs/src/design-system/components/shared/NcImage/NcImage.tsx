import Image, { type ImageProps } from 'next/image'
import { type FC } from 'react'

export interface NcImageProps extends Omit<ImageProps, 'alt'> {
  alt?: string
  containerClassName?: string
}

const NcImage: FC<NcImageProps> = ({
  alt = 'nc-image',
  className = 'object-cover w-full h-full',
  containerClassName = '',
  ...args
}) => {
  return (
    <div className={containerClassName}>
      <Image className={className} alt={alt} {...args} />
    </div>
  )
}

export default NcImage

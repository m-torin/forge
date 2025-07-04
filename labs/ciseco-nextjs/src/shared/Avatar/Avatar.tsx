import VerifyIcon from '@/components/VerifyIcon'
import avatarImage from '@/images/users/avatar4.jpg'
import Image, { StaticImageData } from 'next/image'
import { FC } from 'react'

export interface AvatarProps {
  containerClassName?: string
  sizeClass?: string
  radius?: string
  imgUrl?: string | StaticImageData
  userName?: string
  hasChecked?: boolean
  hasCheckedClass?: string
}

const Avatar: FC<AvatarProps> = ({
  containerClassName = 'ring-1 ring-white dark:ring-neutral-900',
  sizeClass = 'size-6 text-sm',
  radius = 'rounded-full',
  imgUrl = avatarImage.src,
  userName,
  hasChecked,
  hasCheckedClass = 'w-4 h-4 bottom-1 -right-0.5',
}) => {
  const url = imgUrl || ''
  const name = userName || 'John Doe'
  const _setBgColor = (name: string) => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8C33']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <div
      className={`wil-avatar relative inline-flex shrink-0 items-center justify-center font-semibold text-neutral-100 uppercase shadow-inner ${radius} ${sizeClass} ${containerClassName}`}
      style={{ backgroundColor: url ? undefined : _setBgColor(name) }}
    >
      {url && (
        <Image
          fill
          sizes="100px"
          className={`absolute inset-0 h-full w-full object-cover ${radius}`}
          src={url}
          alt={name}
        />
      )}
      <span className="wil-avatar__name">{name[0]}</span>

      {hasChecked && (
        <span className={`absolute text-white ${hasCheckedClass}`}>
          <VerifyIcon className="" />
        </span>
      )}
    </div>
  )
}

export default Avatar

import Image from 'next/image'
import { type FC } from 'react'

import facebook from '../../../images/socials/facebook.svg'
import telegram from '../../../images/socials/telegram.svg'
import twitter from '../../../images/socials/twitter.svg'
import youtube from '../../../images/socials/youtube.svg'
import { type SocialType } from '../SocialsShare/SocialsShare'

export interface SocialsList1Props {
  className?: string
}

const socials: SocialType[] = [
  { name: 'Facebook', href: '#', icon: facebook },
  { name: 'Youtube', href: '#', icon: youtube },
  { name: 'Telegram', href: '#', icon: telegram },
  { name: 'Twitter', href: '#', icon: twitter },
]

const SocialsList1: FC<SocialsList1Props> = ({ className = 'space-y-3' }) => {
  const renderItem = (item: SocialType, index: number) => {
    return (
      <a
        key={index}
        href={item.href}
        className="group flex items-center space-x-2 text-2xl leading-none text-neutral-700 hover:text-black dark:text-neutral-300 dark:hover:text-white"
      >
        <div className="w-5 shrink-0">
          <Image alt="" sizes="40px" src={item.icon} />
        </div>
        <span className="hidden text-sm lg:block">{item.name}</span>
      </a>
    )
  }

  return (
    <div data-nc-id="SocialsList1" className={`nc-SocialsList1 ${className}`}>
      {socials.map(renderItem)}
    </div>
  )
}

export default SocialsList1

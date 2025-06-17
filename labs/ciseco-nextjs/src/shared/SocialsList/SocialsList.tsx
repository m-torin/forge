import facebook from '@/images/socials/facebook.svg'
import telegram from '@/images/socials/telegram.svg'
import twitter from '@/images/socials/twitter.svg'
import youtube from '@/images/socials/youtube.svg'
import Image from 'next/image'
import { FC } from 'react'

export interface SocialsListProps {
  className?: string
  itemClass?: string
}

const socialsDemo = [
  { name: 'Facebook', icon: facebook, href: '#' },
  { name: 'Twitter', icon: twitter, href: '#' },
  { name: 'Youtube', icon: youtube, href: '#' },
  { name: 'Telegram', icon: telegram, href: '#' },
]

const SocialsList: FC<SocialsListProps> = ({ className = '', itemClass = 'block w-6 h-6' }) => {
  return (
    <nav className={`nc-SocialsList flex space-x-2.5 text-2xl text-neutral-600 dark:text-neutral-300 ${className}`}>
      {socialsDemo.map((item, i) => (
        <a
          key={i}
          className={`${itemClass}`}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          title={item.name}
        >
          <Image sizes="40px" src={item.icon} alt="" />
        </a>
      ))}
    </nav>
  )
}

export default SocialsList

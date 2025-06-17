import Heading from '@/components/Heading/Heading'
import { FC } from 'react'

export interface Statistic {
  id: string
  heading: string
  subHeading: string
}

const FOUNDER_DEMO: Statistic[] = [
  {
    id: '1',
    heading: '10 million',
    subHeading: 'Articles have been public around the world (as of Sept. 30, 2025)',
  },
  {
    id: '2',
    heading: '100,000',
    subHeading: 'Registered users account and active users (as of Sept. 30, 2025)',
  },
  {
    id: '3',
    heading: '220+',
    subHeading: 'Countries and regions have our presence (as of Sept. 30, 2025)',
  },
]

export interface SectionStatisticProps {
  className?: string
}

const SectionStatistic: FC<SectionStatisticProps> = ({ className = '' }) => {
  return (
    <div className={`nc-SectionStatistic relative ${className}`}>
      <Heading
        description=" We’re impartial and independent, and every day we create distinctive,
          world-class programmes and content"
      >
        🚀 Fast Facts
      </Heading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {FOUNDER_DEMO.map((item) => (
          <div key={item.id} className="rounded-2xl bg-neutral-50 p-8 dark:border-neutral-800 dark:bg-neutral-800">
            <h3 className="text-2xl leading-none font-semibold text-neutral-900 md:text-3xl dark:text-neutral-200">
              {item.heading}
            </h3>
            <span className="mt-10 block max-w-sm text-sm text-neutral-500 sm:text-base dark:text-neutral-400">
              {item.subHeading}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionStatistic

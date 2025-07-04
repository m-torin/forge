import { Divider } from '@/components/Divider'
import Label from '@/components/Label/Label'
import SectionPromo1 from '@/components/SectionPromo1'
import ButtonPrimary from '@/shared/Button/ButtonPrimary'
import Input from '@/shared/Input/Input'
import SocialsList from '@/shared/SocialsList/SocialsList'
import Textarea from '@/shared/Textarea/Textarea'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact us for any inquiries or support',
}

const info = [
  {
    title: '🗺 ADDRESS',
    desc: 'Photo booth tattooed prism, portland taiyaki hoodie neutra typewriter',
  },
  {
    title: '💌 EMAIL',
    desc: 'nc.example@example.com',
  },
  {
    title: '☎ PHONE',
    desc: '000-123-456-7890',
  },
]

const PageContact = () => {
  return (
    <div className="py-16 lg:py-24">
      <div className="container mx-auto flex max-w-6xl flex-col gap-y-16 lg:gap-y-28">
        <h1 className="flex items-center justify-center text-4xl leading-[1.15] font-semibold tracking-tight text-neutral-900 md:text-5xl dark:text-neutral-100">
          Contact
        </h1>
        <div className="grid shrink-0 grid-cols-1 gap-12 md:grid-cols-2">
          <div className="flex max-w-sm flex-col gap-y-8">
            {info.map((item, index) => (
              <div key={index}>
                <p className="text-sm font-semibold tracking-wider uppercase dark:text-neutral-200">{item.title}</p>
                <span className="mt-4 block text-neutral-500 dark:text-neutral-400">{item.desc}</span>
              </div>
            ))}
            <div>
              <p className="text-sm font-semibold tracking-wider uppercase dark:text-neutral-200">🌏 SOCIALS</p>
              <SocialsList className="mt-4" />
            </div>
          </div>
          <div>
            <form className="grid grid-cols-1 gap-6" action="#" method="post">
              <label className="block">
                <Label>Full name</Label>
                <Input placeholder="Example Doe" type="text" className="mt-1" />
              </label>
              <label className="block">
                <Label>Email address</Label>
                <Input type="email" placeholder="example@example.com" className="mt-1" />
              </label>
              <label className="block">
                <Label>Message</Label>
                <Textarea className="mt-1" rows={6} />
              </label>
              <div>
                <ButtonPrimary type="submit">Send Message</ButtonPrimary>
              </div>
            </form>
          </div>
        </div>
        <Divider />
      </div>

      <div className="container pt-16 lg:pt-28">
        <SectionPromo1 />
      </div>
    </div>
  )
}

export default PageContact

'use client'

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'

const DEMO_DATA = [
  {
    name: 'Description',
    content:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
  },
  {
    name: 'Fabric + Care',
    content: `<ul class="list-disc list-inside leading-7">
    <li>Made from a sheer Belgian power micromesh.</li>
    <li>
    74% Polyamide (Nylon) 26% Elastane (Spandex)
    </li>
    <li>
    Adjustable hook & eye closure and straps
    </li>
    <li>
    Hand wash in cold water, dry flat
    </li>
  </ul>`,
  },

  {
    name: 'How it Fits',
    content:
      "Use this as a guide. Preference is a huge factor — if you're near the top of a size range and/or prefer more coverage, you may want to size up.",
  },
  {
    name: 'FAQ',
    content: `
    <ul class="list-disc list-inside leading-7">
    <li>All full-priced, unworn items, with tags attached and in their original packaging are eligible for return or exchange within 30 days of placing your order.</li>
    <li>
    Please note, packs must be returned in full. We do not accept partial returns of packs.
    </li>
    <li>
    Want to know our full returns policies? Here you go.
    </li>
    <li>
    Want more info about shipping, materials or care instructions? Here!
    </li>
  </ul>
    `,
  },
]

interface Props {
  panelClassName?: string
  data?: typeof DEMO_DATA
}

const AccordionInfo: FC<Props> = ({
  panelClassName = 'p-4 pt-3 last:pb-0 text-neutral-600 text-sm dark:text-neutral-300 leading-6',
  data = DEMO_DATA,
}) => {
  return (
    <div className="w-full space-y-2.5 rounded-2xl">
      {/* ============ */}
      {data.map((item, index) => {
        return (
          <Disclosure key={index} defaultOpen={index < 2}>
            {({ open }) => (
              <div>
                <DisclosureButton className="flex w-full items-center justify-between rounded-lg bg-neutral-100/80 px-4 py-2 text-left font-medium hover:bg-neutral-200/60 focus:outline-hidden focus-visible:ring-3 focus-visible:ring-neutral-500/75 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                  <span>{item.name}</span>
                  {!open ? (
                    <PlusIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  ) : (
                    <MinusIcon className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  )}
                </DisclosureButton>
                <DisclosurePanel className={panelClassName} as="div">
                  <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        )
      })}

      {/* ============ */}
    </div>
  )
}

export default AccordionInfo

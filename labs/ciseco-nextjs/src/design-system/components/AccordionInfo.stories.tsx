import AccordionInfo from './AccordionInfo'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof AccordionInfo> = {
  argTypes: {
    data: {
      control: 'object',
      description: 'Array of objects with name and content properties',
    },
    panelClassName: {
      control: 'text',
      description: 'CSS classes for the panel content',
    },
  },
  component: AccordionInfo,
  parameters: {
    docs: {
      description: {
        component: 'An accordion component for displaying collapsible information sections with HTML content support.',
      },
    },
    layout: 'centered',
  },
  title: 'Ciseco/AccordionInfo',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultData = [
  {
    name: 'Description',
    content:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
  },
  {
    name: 'Fabric + Care',
    content: `<ul class="list-disc list-inside leading-7">
    <li>Made from a sheer Belgian power micromesh.</li>
    <li>74% Polyamide (Nylon) 26% Elastane (Spandex)</li>
    <li>Adjustable hook & eye closure and straps</li>
    <li>Hand wash in cold water, dry flat</li>
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
    <li>Please note, packs must be returned in full. We do not accept partial returns of packs.</li>
    <li>Want to know our full returns policies? Here you go.</li>
    <li>Want more info about shipping, materials or care instructions? Here!</li>
  </ul>
    `,
  },
]

export const Default: Story = {
  args: {
    data: defaultData,
  },
}

export const CustomPanelStyling: Story = {
  args: {
    data: defaultData,
    panelClassName: 'p-6 pt-4 last:pb-0 text-blue-600 text-base leading-7 bg-blue-50 rounded-lg mt-2',
  },
}

export const SingleItem: Story = {
  args: {
    data: [
      {
        name: 'Single Item',
        content: 'This is a single accordion item with just text content.',
      },
    ],
  },
}

export const HTMLContent: Story = {
  args: {
    data: [
      {
        name: 'Rich HTML Content',
        content: `
          <div>
            <h4 class="font-bold text-lg mb-3">Product Features</h4>
            <ul class="list-disc list-inside space-y-2">
              <li><strong>Material:</strong> Premium cotton blend</li>
              <li><strong>Size:</strong> Available in XS to XXL</li>
              <li><strong>Care:</strong> Machine washable</li>
            </ul>
            <div class="mt-4 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
              <p class="text-sm"><strong>Note:</strong> Color may vary slightly due to monitor settings.</p>
            </div>
          </div>
        `,
      },
    ],
  },
}

export const ManyItems: Story = {
  args: {
    data: [
      { name: 'Item 1', content: 'Content for the first item.' },
      { name: 'Item 2', content: 'Content for the second item.' },
      { name: 'Item 3', content: 'Content for the third item.' },
      { name: 'Item 4', content: 'Content for the fourth item.' },
      { name: 'Item 5', content: 'Content for the fifth item.' },
      { name: 'Item 6', content: 'Content for the sixth item.' },
    ],
  },
}

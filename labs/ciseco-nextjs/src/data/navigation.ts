export async function getNavigation(): Promise<TNavigationItem[]> {
  return [
    {
      id: '1',
      href: '/',
      name: 'Home',
    },
    {
      id: '2',
      href: '/collections/page-style-2/all',
      name: 'Shop',
    },
    {
      id: '3',
      href: '/collections/all',
      name: 'Beauty',
    },
    {
      id: '4',
      href: '/collections/page-style-2/all',
      name: 'Sport',
    },
    {
      id: '5',
      href: '/collections/all',
      name: 'Templates',
      type: 'mega-menu',
      children: [
        {
          id: '1',
          href: '/',
          name: 'Home Page',
          type: 'dropdown',
          children: [
            {
              id: '1-1',
              href: '/',
              name: 'Home 1',
            },
            {
              id: '1-2',
              href: '/home-2',
              name: 'Home 2',
            },
            { id: '1-3', href: '/', name: 'Header 1' },
            { id: '1-4', href: '/home-2', name: 'Header 2' },
            { id: '1-5', href: '/coming-soon', name: 'Coming Soon' },
          ],
        },
        {
          id: '2',
          href: '/#',
          name: 'Shop Pages',
          type: 'dropdown',
          children: [
            { id: '2-1', href: '/collections/sale-collection', name: 'Collection 1' },
            { id: '2-2', href: '/collections/page-style-2/sale-collection', name: 'Collection 2' },
            { id: '2-3', href: '/products/leather-tote-bag', name: 'Product 1' },
            { id: '2-4', href: '/products/page-style-2/leather-tote-bag', name: 'Product 2' },
            { id: '2-5', href: '/cart', name: 'Cart' },
            { id: '2-6', href: '/checkout', name: 'Checkout', children: [] },
            { id: '2-7', href: '/orders', name: 'Orders history' },
          ],
        },
        {
          id: '3',
          href: '/#',
          name: 'Other Pages',
          type: 'dropdown',
          children: [
            { id: '3-2', href: '/search', name: 'Search' },
            { id: '3-4', href: '/account', name: 'Account' },
            { id: '3-3', href: '/order-successful', name: 'Order Successful' },
            { id: '3-1', href: '/checkout', name: 'Checkout' },
            { id: '3-5', href: '/orders', name: 'Orders history' },
            { id: '3-6', href: '/orders/4657', name: 'Order detail' },
            { id: '3-7', href: '/subscription', name: 'Subscription' },
          ],
        },
        {
          id: '4',
          href: '/#',
          name: 'Other Pages',
          type: 'dropdown',
          children: [
            { id: '4-1', href: '/blog', name: 'Blog' },
            { id: '4-2', href: '/blog/graduation-dresses-style-guide', name: 'Blog Single' },
            { id: '4-3', href: '/about', name: 'About' },
            { id: '4-4', href: '/contact', name: 'Contact' },
            { id: '4-5', href: '/login', name: 'Login' },
            { id: '4-6', href: '/signup', name: 'Signup' },
            { id: '4-7', href: '/forgot-password', name: 'Forgot Password' },
          ],
        },
      ],
    },
    {
      id: '6',
      href: '/collections/page-style-2/all',
      name: 'Explore',
      type: 'dropdown',
      children: [
        {
          id: '3',
          href: '/collections/all',
          name: 'Collection pages',
          type: 'dropdown',
          children: [
            {
              id: '3-1',
              href: '/collections/all',
              name: 'Collection 1',
            },
            {
              id: '3-2',
              href: '/collections/page-style-2/all',
              name: 'Collection 2',
            },
          ],
        },
        {
          id: '4',
          href: '/products/leather-tote-bag',
          name: 'Product Pages',
          type: 'dropdown',
          children: [
            {
              id: '4-1',
              href: '/products/leather-tote-bag',
              name: 'Product 1',
            },
            {
              id: '4-2',
              href: '/products/page-style-2/leather-tote-bag',
              name: 'Product 2',
            },
          ],
        },
        {
          id: '5',
          href: '/cart',
          name: 'Cart Page',
        },
        {
          id: '6',
          href: '/checkout',
          name: 'Checkout',
        },
        {
          id: 'gid://6',
          href: '/orders',
          name: 'Orders',
        },
        {
          id: '7',
          href: '/search',
          name: 'Search Page',
        },
        {
          id: '8',
          href: '/account',
          name: 'Account Page',
        },
        {
          id: '9',
          href: '/about',
          name: 'Other Pages',
          type: 'dropdown',
          children: [
            {
              id: '9-1',
              href: '/about',
              name: 'About',
            },
            {
              id: '9-2',
              href: '/contact',
              name: 'Contact us',
            },
            {
              id: '9-3',
              href: '/login',
              name: 'Login',
            },
            {
              id: '9-4',
              href: '/signup',
              name: 'Signup',
            },
            {
              id: '9-5',
              href: '/subscription',
              name: 'Subscription',
            },
            { id: '9-6', href: '/forgot-pass', name: 'Forgot Password' },
          ],
        },
        {
          id: '10',
          href: '/blog',
          name: 'Blog Page',
          type: 'dropdown',
          children: [
            {
              id: '10-1',
              href: '/blog',
              name: 'Blog Page',
            },
            {
              id: '10-2',
              href: '/blog/graduation-dresses-style-guide',
              name: 'Blog Single',
            },
          ],
        },
      ],
    },
  ]
}

export async function getNavMegaMenu(): Promise<TNavigationItem> {
  const navigation = await getNavigation()

  // Find the mega menu item in the navigation array
  return navigation[4]
}

// ============ TYPE =============
export type TNavigationItem = Partial<{
  id: string
  href: string
  name: string
  type?: 'dropdown' | 'mega-menu'
  isNew?: boolean
  children?: TNavigationItem[]
}>

export const getLanguages = async () => {
  return [
    {
      id: 'English',
      name: 'English',
      description: 'United State',
      href: '#',
      active: true,
    },
    {
      id: 'Vietnamese',
      name: 'Vietnamese',
      description: 'Vietnamese',
      href: '#',
    },
    {
      id: 'Francais',
      name: 'Francais',
      description: 'Belgique',
      href: '#',
    },
    {
      id: 'Francais',
      name: 'Francais',
      description: 'Canada',
      href: '#',
    },
    {
      id: 'Francais',
      name: 'Francais',
      description: 'Belgique',
      href: '#',
    },
    {
      id: 'Francais',
      name: 'Francais',
      description: 'Canada',
      href: '#',
    },
  ]
}
export const getCurrencies = async () => {
  return [
    {
      id: 'EUR',
      name: 'EUR',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#000000" strokeWidth="1.5"></path>
    <path d="M15 14.4923C14.5216 15.3957 13.6512 16 12.6568 16C11.147 16 9.92308 14.6071 9.92308 12.8889V11.1111C9.92308 9.39289 11.147 8 12.6568 8C13.6512 8 14.5216 8.60426 15 9.50774M9 12H12.9231" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>
</svg>`,
      active: true,
    },
    {
      id: 'USD',
      name: 'USD',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#000000" strokeWidth="1.5"></path>
    <path d="M14.7102 10.0611C14.6111 9.29844 13.7354 8.06622 12.1608 8.06619C10.3312 8.06616 9.56136 9.07946 9.40515 9.58611C9.16145 10.2638 9.21019 11.6571 11.3547 11.809C14.0354 11.999 15.1093 12.3154 14.9727 13.956C14.836 15.5965 13.3417 15.951 12.1608 15.9129C10.9798 15.875 9.04764 15.3325 8.97266 13.8733M11.9734 6.99805V8.06982M11.9734 15.9031V16.998" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>
</svg>`,
    },
    {
      id: 'GBF',
      name: 'GBF',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 12H13.2M9 12V9.2963C9 8.82489 9 8.58919 9.14645 8.44274C9.29289 8.2963 9.5286 8.2963 10 8.2963H13.2C14.1941 8.2963 15 9.1254 15 10.1481C15 11.1709 14.1941 12 13.2 12M9 12V14.7037C9 15.1751 9 15.4108 9.14645 15.5572C9.29289 15.7037 9.5286 15.7037 10 15.7037H13.2C14.1941 15.7037 15 14.8746 15 13.8518C15 12.8291 14.1941 12 13.2 12M10.4938 8.2963V7M10.4938 17V15.7037M12.8982 8.2963V7M12.8982 17V15.7037" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
</svg>`,
    },
    {
      id: 'SAR',
      name: 'SAR',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#000000" strokeWidth="1.5"></path>
    <path d="M14.7102 10.0611C14.6111 9.29844 13.7354 8.06622 12.1608 8.06619C10.3312 8.06616 9.56136 9.07946 9.40515 9.58611C9.16145 10.2638 9.21019 11.6571 11.3547 11.809C14.0354 11.999 15.1093 12.3154 14.9727 13.956C14.836 15.5965 13.3417 15.951 12.1608 15.9129C10.9798 15.875 9.04764 15.3325 8.97266 13.8733M11.9734 6.99805V8.06982M11.9734 15.9031V16.998" stroke="#000000" strokeWidth="1.5" strokeLinecap="round"></path>
</svg>`,
    },
    {
      id: 'QAR',
      name: 'QAR',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9 7.5C9.2 8.41667 10.08 10.5 12 11.5M12 11.5C13.92 10.5 14.8 8.41667 15 7.5M12 11.5V16.5M14.5 13.5H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>`,
    },
    {
      id: 'BAD',
      name: 'BAD',
      href: '#',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" color="#000000" fill="none">
    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#000000" strokeWidth="1.5"></path>
    <path d="M9 7.5C9.2 8.41667 10.08 10.5 12 11.5M12 11.5C13.92 10.5 14.8 8.41667 15 7.5M12 11.5V16.5M14.5 13.5H9.5" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
</svg>`,
    },
  ]
}

export const getHeaderDropdownCategories = async () => {
  return [
    {
      name: 'Women',
      handle: 'all',
      description: 'New items in 2025',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    },
    {
      name: 'Man',
      handle: 'page-style-2/all',
      description: 'Perfect for gentlemen',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21.5 2.5L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 2.5H21.5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    },
    {
      name: 'Sports',
      handle: 'page-style-2/all',
      description: 'The needs of sports ',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.81995 12H14.1799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M22.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M1.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg> 
     `,
    },
    {
      name: 'Beauty',
      handle: 'shoes',
      description: 'Luxury and nobility',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
     `,
    },
    {
      name: 'Jewelry',
      handle: 'page-style-2/all',
      description: 'Diamond always popular',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.7998 3.40005L7.19982 7.70005C7.09982 7.90005 6.99982 8.20005 6.89982 8.40005L5.19982 17C5.09982 17.6 5.39982 18.3 5.89982 18.6L11.1998 21.6C11.5998 21.8 12.2998 21.8 12.6998 21.6L17.9998 18.6C18.4998 18.3 18.7998 17.6 18.6998 17L16.9998 8.40005C16.9998 8.20005 16.7998 7.90005 16.6998 7.70005L13.0998 3.40005C12.4998 2.60005 11.4998 2.60005 10.7998 3.40005Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.8002 8.5L12.5002 20.7C12.3002 21.1 11.7002 21.1 11.6002 20.7L7.2002 8.5" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
     `,
    },
  ]
}

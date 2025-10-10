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
  ];
}

export async function getNavMegaMenu(): Promise<TNavigationItem> {
  const navigation = await getNavigation();

  // Find the mega menu item in the navigation array
  return navigation[4];
}

// ============ TYPE =============
export type TNavigationItem = Partial<{
  id: string;
  href: string;
  name: string;
  type?: 'dropdown' | 'mega-menu';
  isNew?: boolean;
  children?: TNavigationItem[];
}>;

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
  ];
};
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
  ];
};

export const getHeaderDropdownCategories = async () => {
  return [
    {
      name: 'Jackets',
      handle: 'jackets',
      description: 'New items in 2025',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    `,
    },
    {
      name: 'T-Shirts',
      handle: 'page-style-2/t-shirts',
      description: 'Perfect for gentlemen',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-8" width="24" height="24" color="currentColor" fill="none">
        <path d="M6 9V16.6841C6 18.4952 6 19.4008 6.58579 19.9635C7.89989 21.2257 15.8558 21.4604 17.4142 19.9635C18 19.4008 18 18.4952 18 16.6841V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
        <path d="M5.74073 12L3.04321 9.38915C2.34774 8.71602 2 8.37946 2 7.96123C2 7.543 2.34774 7.20644 3.04321 6.53331L5.04418 4.59664C5.39088 4.26107 5.56423 4.09329 5.77088 3.96968C5.97753 3.84607 6.21011 3.77103 6.67526 3.62096L8.32112 3.08997C8.56177 3.01233 8.68209 2.97351 8.76391 3.02018C8.84573 3.06686 8.87157 3.2013 8.92324 3.47018C9.19358 4.87684 10.4683 5.94185 12 5.94185C13.5317 5.94185 14.8064 4.87684 15.0768 3.47018C15.1284 3.2013 15.1543 3.06686 15.2361 3.02018C15.3179 2.97351 15.4382 3.01233 15.6789 3.08997L17.3247 3.62096C17.7899 3.77103 18.0225 3.84607 18.2291 3.96968C18.4358 4.09329 18.6091 4.26107 18.9558 4.59664L20.9568 6.53331C21.6523 7.20644 22 7.543 22 7.96123C22 8.37946 21.6523 8.71602 20.9568 9.38915L18.2593 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    `,
    },
    {
      name: 'Shoes',
      handle: 'shoes',
      description: 'The needs of sports ',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="size-8" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
        <path d="M19.1012 18H7.96299C5.02913 18 3.56221 18 2.66807 16.8828C0.97093 14.7623 2.9047 9.1238 4.07611 7C4.47324 9.4 8.56152 9.33333 10.0507 9C9.05852 7.00119 10.3831 6.33413 11.0453 6.00059L11.0465 6C14 9.5 20.3149 11.404 21.8624 15.2188C22.5309 16.8667 20.6262 18 19.1012 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M2 14C6.16467 15.4294 8.73097 15.8442 12.0217 14.8039C13.0188 14.4887 13.5174 14.3311 13.8281 14.3525C14.1389 14.3739 14.7729 14.6695 16.0408 15.2608C17.6243 15.9992 19.7971 16.4243 22 15.3583" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path>
        <path d="M13.5 9.5L15 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M15.5 11L17 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg> 
     `,
    },
    {
      name: 'Bags',
      handle: 'page-style-2/bags',
      description: 'Luxury and nobility',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" class="size-8" viewBox="0 0 24 24" width="24" height="24" color="currentColor" fill="none">
        <path d="M19.1737 12.9256V12.12C19.1737 10.6492 19.1737 9.91383 18.7234 9.45691C18.2732 9 17.5485 9 16.0992 9H7.90077C6.45147 9 5.72682 9 5.27658 9.45691C4.82634 9.91383 4.82634 10.6492 4.82634 12.12V12.9256C4.82634 13.3018 4.82634 13.4899 4.79345 13.6739C4.76056 13.858 4.69549 14.0341 4.56534 14.3863L4.34812 14.9742C3.16867 18.166 2.57895 19.7619 3.34312 20.8809C4.1073 22 5.78684 22 9.14591 22H14.8541C18.2132 22 19.8927 22 20.6569 20.8809C21.4211 19.7619 20.8313 18.166 19.6519 14.9742L19.4347 14.3863C19.3045 14.0341 19.2394 13.858 19.2065 13.6739C19.1737 13.4899 19.1737 13.3018 19.1737 12.9256Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
        <path d="M16 11C16 5 13.8655 2 12 2C10.1345 2 8 5 8 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
        <path d="M12 16C13.2504 16 14.944 18.6278 13.3547 18.8954C12.5228 19.0354 11.4711 19.0344 10.6453 18.8954C9.056 18.6278 10.7496 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>
        <path d="M13.94 17.0049C15.2105 16.8729 17.4477 16.1267 19.0551 14.9424" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M10.1147 17.0314C8.84417 16.8993 6.60699 16.1532 4.99961 14.9689" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
     `,
    },
    {
      name: 'Accessories',
      handle: 'accessories',
      description: 'Diamond always popular',
      icon: `<svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.7998 3.40005L7.19982 7.70005C7.09982 7.90005 6.99982 8.20005 6.89982 8.40005L5.19982 17C5.09982 17.6 5.39982 18.3 5.89982 18.6L11.1998 21.6C11.5998 21.8 12.2998 21.8 12.6998 21.6L17.9998 18.6C18.4998 18.3 18.7998 17.6 18.6998 17L16.9998 8.40005C16.9998 8.20005 16.7998 7.90005 16.6998 7.70005L13.0998 3.40005C12.4998 2.60005 11.4998 2.60005 10.7998 3.40005Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.8002 8.5L12.5002 20.7C12.3002 21.1 11.7002 21.1 11.6002 20.7L7.2002 8.5" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
     `,
    },
  ];
};

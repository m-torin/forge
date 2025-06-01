import collectionImage1 from '../images/collections/1.png';
import collectionImage2 from '../images/collections/2.png';
import collectionImage3 from '../images/collections/3.png';
import collectionImage4 from '../images/collections/4.png';
import collectionImage5 from '../images/collections/5.png';
import collectionImage6 from '../images/collections/6.png';
import collectionImage7 from '../images/collections/7.png';
import boothImage1 from '../images/collections/booth1.png';
import boothImage2 from '../images/collections/booth2.png';
import boothImage3 from '../images/collections/booth3.png';
import boothImage4 from '../images/collections/booth4.png';
import productImage1_1 from '../images/products/p1-1.jpg';
import productImage1_2 from '../images/products/p1-2.jpg';
import productImage1_3 from '../images/products/p1-3.jpg';
import productImage1 from '../images/products/p1.jpg';
import productImage2_1 from '../images/products/p2-1.jpg';
import productImage2_2 from '../images/products/p2-2.jpg';
import productImage2_3 from '../images/products/p2-3.jpg';
import productImage2 from '../images/products/p2.jpg';
import productImage3_1 from '../images/products/p3-1.jpg';
import productImage3_2 from '../images/products/p3-2.jpg';
import productImage3_3 from '../images/products/p3-3.jpg';
import productImage3 from '../images/products/p3.jpg';
import productImage4_1 from '../images/products/p4-1.jpg';
import productImage4_2 from '../images/products/p4-2.jpg';
import productImage4_3 from '../images/products/p4-3.jpg';
import productImage4 from '../images/products/p4.jpg';
import productImage5_1 from '../images/products/p5-1.jpg';
import productImage5_2 from '../images/products/p5-2.jpg';
import productImage5_3 from '../images/products/p5-3.jpg';
import productImage5 from '../images/products/p5.jpg';
import productImage6_1 from '../images/products/p6-1.jpg';
import productImage6_2 from '../images/products/p6-2.jpg';
import productImage6_3 from '../images/products/p6-3.jpg';
import productImage6 from '../images/products/p6.jpg';
import productImage7_1 from '../images/products/p7-1.jpg';
import productImage7_2 from '../images/products/p7-2.jpg';
import productImage7_3 from '../images/products/p7-3.jpg';
import productImage7 from '../images/products/p7.jpg';
import productImage8_1 from '../images/products/p8-1.jpg';
import productImage8_2 from '../images/products/p8-2.jpg';
import productImage8_3 from '../images/products/p8-3.jpg';
import productImage8 from '../images/products/p8.jpg';
import avatarImage1 from '../images/users/avatar1.jpg';
import avatarImage2 from '../images/users/avatar2.jpg';
import avatarImage3 from '../images/users/avatar3.jpg';
import avatarImage4 from '../images/users/avatar4.jpg';
import { shuffleArray } from '../utils/shuffleArray';

export async function getOrder(number: string) {
  return (await getOrders()).find((order) => order.number.toString() === number);
}
export async function getOrders() {
  return [
    {
      cost: {
        discount: 0,
        shipping: 0,
        subtotal: 199,
        tax: 0,
        total: 199,
      },
      date: 'March 22, 2025',
      invoiceHref: '#',
      number: '4657',
      products: [
        {
          id: 'gid://2',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          color: 'Black Brown',
          date: 'March 24, 2021',
          datetime: '2021-03-24',
          description:
            'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
          email: 'f•••@example.com',
          featuredImage: {
            width: productImage2.width,
            alt: 'Insulated bottle with white base and black snap lid.',
            height: productImage2.height,
            src: productImage2.src,
          },
          handle: 'nomad-tumbler',
          href: '#',
          phone: '1•••••••••40',
          price: 35,
          quantity: 1,
          size: 'XS',
          status: 'Preparing to ship',
          step: 1,
          title: 'Nomad Tumbler',
        },
        {
          id: 'gid://3',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          color: 'White',
          date: 'March 23, 2021',
          datetime: '2021-03-23',
          description:
            'This contemporary wristwatch has a clean, minimalist look and high quality components.',
          email: 'f•••@example.com',
          featuredImage: {
            width: productImage4.width,
            alt: 'Insulated bottle with white base and black snap lid.',
            height: productImage4.height,
            src: productImage4.src,
          },
          handle: 'minimalist-wristwatch',
          href: '#',
          phone: '1•••••••••40',
          price: 149,
          quantity: 1,
          size: 'XL',
          status: 'Shipped',
          step: 0,
          title: 'Minimalist Wristwatch',
        },
      ],
      status: 'Delivered on January 11, 2025',
      totalQuantity: 4,
    },
    {
      cost: {
        discount: 0,
        shipping: 0,
        subtotal: 199,
        tax: 0,
        total: 199,
      },
      date: 'March 22, 2025',
      invoiceHref: '#',
      number: '4376',
      products: [
        {
          id: 'gid://1',
          address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
          color: 'Black',
          date: 'March 24, 2021',
          datetime: '2021-03-24',
          description:
            'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
          email: 'f•••@example.com',
          featuredImage: {
            width: productImage1.width,
            alt: 'Insulated bottle with white base and black snap lid.',
            height: productImage1.height,
            src: productImage1.src,
          },
          handle: 'nomad-tumbler',
          href: '#',
          phone: '1•••••••••40',
          price: 99,
          quantity: 1,
          size: 'M',
          status: 'Preparing to ship',
          step: 1,
          title: 'Nomad Tumbler',
        },
      ],
      status: 'Delivered on January 08, 2028',
      totalQuantity: 4,
    },
  ];
}

export async function getCountries() {
  return [
    {
      name: 'Canada',
      code: 'CA',
      flagUrl: '/flags/ca.svg',
      regions: [
        'Alberta',
        'British Columbia',
        'Manitoba',
        'New Brunswick',
        'Newfoundland and Labrador',
        'Northwest Territories',
        'Nova Scotia',
        'Nunavut',
        'Ontario',
        'Prince Edward Island',
        'Quebec',
        'Saskatchewan',
        'Yukon',
      ],
    },
    {
      name: 'Mexico',
      code: 'MX',
      flagUrl: '/flags/mx.svg',
      regions: [
        'Aguascalientes',
        'Baja California',
        'Baja California Sur',
        'Campeche',
        'Chiapas',
        'Chihuahua',
        'Ciudad de Mexico',
        'Coahuila',
        'Colima',
        'Durango',
        'Guanajuato',
        'Guerrero',
        'Hidalgo',
        'Jalisco',
        'Mexico State',
        'Michoacán',
        'Morelos',
        'Nayarit',
        'Nuevo León',
        'Oaxaca',
        'Puebla',
        'Querétaro',
        'Quintana Roo',
        'San Luis Potosí',
        'Sinaloa',
        'Sonora',
        'Tabasco',
        'Tamaulipas',
        'Tlaxcala',
        'Veracruz',
        'Yucatán',
        'Zacatecas',
      ],
    },
    {
      name: 'United States',
      code: 'US',
      flagUrl: '/flags/us.svg',
      regions: [
        'Alabama',
        'Alaska',
        'American Samoa',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Washington DC',
        'Micronesia',
        'Florida',
        'Georgia',
        'Guam',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Marshall Islands',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Northern Mariana Islands',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Palau',
        'Pennsylvania',
        'Puerto Rico',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'U.S. Virgin Islands',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
        'Armed Forces Americas',
        'Armed Forces Europe',
        'Armed Forces Pacific',
      ],
    },
  ];
}

export async function getShopData() {
  return {
    name: 'graphql',
    description: 'An example shop with GraphQL.',
    primaryDomain: {
      url: 'https://graphql.myshopify.com',
    },
    privacyPolicy: {
      id: 'gid://shopify/ShopPolicy/30401283',
      url: 'https://checkout.shopify.com/13120893/policies/30401283.html?locale=en',
      body: '<p>privacyPolicy</p>',
      handle: 'privacy-policy',
      title: 'Privacy Policy',
    },
    refundPolicy: {
      id: 'gid://shopify/ShopPolicy/30401219',
      url: 'https://checkout.shopify.com/13120893/policies/30401219.html?locale=en',
      body: '<p>refundPolicy</p>',
      handle: 'refund-policy',
      title: 'Refund Policy',
    },
    shippingPolicy: {
      id: 'gid://shopify/ShopPolicy/23745298488',
      url: 'https://checkout.shopify.com/13120893/policies/23745298488.html?locale=en',
      body: '<p>Shipping Policy</p>',
      handle: 'shipping-policy',
      title: 'Shipping Policy',
    },
    subscriptionPolicy: {
      id: 'gid://shopify/ShopPolicy/30401219',
      url: 'https://checkout.shopify.com/13120893/policies/30401219.html?locale=en',
      body: '<p>Subscription Policy</p>',
      handle: 'refund-policy',
      title: 'Refund Policy',
    },
    termsOfService: {
      id: 'gid://shopify/ShopPolicy/30401347',
      url: 'https://checkout.shopify.com/13120893/policies/30401347.html?locale=en',
      body: 'lorem ispsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nisl nunc egestas nunc, vitae facilisis nunc nisi euismod nisi.',
      handle: 'terms-of-service',
      title: 'Terms of Service',
    },
  };
}

export async function getProductReviews(handle: string) {
  return [
    {
      id: '1',
      author: 'S. Walkinshaw',
      authorAvatar: avatarImage1,
      content: `
        <p>I was really pleased with the overall shopping experience. My order even included a little personal, handwritten note, which delighted me!</p>
        <p>The product quality is amazing, it looks and feel even better than I had anticipated. </p>
      `,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
      rating: 5,
      title: "Can't say enough good things",
    },
    {
      id: '2',
      author: 'Risako M',
      authorAvatar: avatarImage2,
      content: `
        <p>The product quality is amazing, it looks and feel even better than I had anticipated.</p>
        <p>I like it better than a regular hoody because it is tailored to be a slimmer fit. Perfect for going out when you want to stay comfy. The head opening is a little tight which makes it a little.</p>
      `,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
      rating: 4,
      title: 'Perfect for going out when you want to stay comfy',
    },
    {
      id: '3',
      author: 'Eden Birch',
      authorAvatar: avatarImage3,
      content: `
        <p> I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.</p>
        <p>The product quality is amazing!</p>
      `,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
      rating: 4,
      title: 'Very nice feeling sweater!',
    },
    {
      id: '4',
      author: 'Jonathan Edwards',
      authorAvatar: avatarImage4,
      content: `
        <p> I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.</p>
        <p>The product quality is amazing!</p>
      `,
      date: 'May 16, 2025',
      datetime: '2025-01-06',
      rating: 5,
      title: 'Very nice feeling sweater!',
    },
  ];
}

export async function getBlogPosts() {
  return [
    {
      id: '1',
      author: {
        name: 'Scott Walkinshaw',
        avatar: {
          width: avatarImage1.width,
          alt: 'Scott Walkinshaw',
          height: avatarImage1.height,
          src: avatarImage1.src,
        },
        description:
          'Scott Walkinshaw is a fashion designer and stylist with over 10 years of experience in the industry. He specializes in creating unique and stylish outfits for special occasions.',
      },
      category: { href: '#', title: 'Marketing' },
      date: 'Mar 16, 2020',
      datetime: '2020-03-16',
      excerpt:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      featuredImage: {
        width: 3637,
        alt: 'Graduation Dresses: A Style Guide',
        height: 2432,
        src: 'https://images.unsplash.com/photo-1744029829181-ad19c2ee248b?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      handle: 'graduation-dresses-style-guide',
      timeToRead: '2 min read',
      title: 'Graduation Dresses: A Style Guide',
    },
    {
      id: '2',
      author: {
        name: 'Erica Alexander',
        avatar: {
          width: avatarImage2.width,
          alt: 'Erica Alexander',
          height: avatarImage2.height,
          src: avatarImage2.src,
        },
        description:
          'Erica Alexander is a fashion influencer and stylist with a passion for creating unique and stylish outfits. She has a keen eye for detail and loves to experiment with different styles and trends.',
      },
      category: { href: '#', title: 'Marketing' },
      date: 'Mar 16, 2020',
      datetime: '2020-03-16',
      excerpt:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      featuredImage: {
        width: 3637,
        alt: 'How to Wear Your Eid Pieces All Year Long',
        height: 2432,
        src: 'https://images.unsplash.com/photo-1710060654876-cc69c9abade6?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      handle: 'how-to-wear-your-eid-pieces-all-year-long',
      timeToRead: '3 min read',
      title: 'How to Wear Your Eid Pieces All Year Long',
    },
    {
      id: '3',
      author: {
        name: 'Wellie Edwards',
        avatar: {
          width: avatarImage3.width,
          alt: 'Wellie Edwards',
          height: avatarImage3.height,
          src: avatarImage3.src,
        },
        description:
          'Wellie Edwards is a fashion designer and stylist with a passion for creating unique and stylish outfits. She has a keen eye for detail and loves to experiment with different styles and trends.',
      },
      category: { href: '#', title: 'Marketing' },
      date: 'Mar 16, 2020',
      datetime: '2020-03-16',
      excerpt:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      featuredImage: {
        width: 3637,
        alt: 'The Must-Have Hijabi Friendly Fabrics for 2024',
        height: 2432,
        src: 'https://images.unsplash.com/photo-1665047189192-3a49516d496a?q=80&w=3874&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      handle: 'the-must-have-hijabi-friendly-fabrics-for-2024',
      timeToRead: '3 min read',
      title: 'The Must-Have Hijabi Friendly Fabrics for 2024',
    },
    {
      id: '4',
      author: {
        name: 'Alex Klein',
        avatar: {
          width: avatarImage4.width,
          alt: 'Alex Klein',
          height: avatarImage4.height,
          src: avatarImage4.src,
        },
        description:
          'Alex Klein is a fashion designer and stylist with a passion for creating unique and stylish outfits. He has a keen eye for detail and loves to experiment with different styles and trends.',
      },
      category: { href: '#', title: 'Marketing' },
      date: 'Mar 16, 2020',
      datetime: '2020-03-16',
      excerpt:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      featuredImage: {
        width: 3637,
        alt: 'The Must-Have Hijabi Friendly Fabrics for 2024',
        height: 2432,
        src: 'https://images.unsplash.com/photo-1636522302676-79eb484e0b11?q=80&w=3637&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      handle: 'the-must-have-hijabi-friendly-fabrics-for',
      timeToRead: '3 min read',
      title: 'The Hijabi Friendly Fabrics for 2025',
    },
    {
      id: '5',
      author: {
        name: 'Eden Birch',
        avatar: {
          width: avatarImage1.width,
          alt: 'Eden Birch',
          height: avatarImage1.height,
          src: avatarImage1.src,
        },
        description:
          'Eden Birch is a fashion designer and stylist with a passion for creating unique and stylish outfits. She has a keen eye for detail and loves to experiment with different styles and trends.',
      },
      category: { href: '#', title: 'Marketing' },
      date: 'Mar 16, 2020',
      datetime: '2020-03-16',
      excerpt:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      featuredImage: {
        width: 3637,
        alt: 'Boost your conversion rate',
        height: 2432,
        src: 'https://images.unsplash.com/photo-1623876355139-cb77f029bd29?q=80&w=3296&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      },
      handle: 'boost-your-conversion-rate',
      timeToRead: '3 min read',
      title: 'Boost your conversion rate',
    },
    {
      id: '6',
      author: {
        name: 'Scott Edwards',
        avatar: {
          width: avatarImage2.width,
          alt: 'Scott Edwards',
          height: avatarImage2.height,
          src: avatarImage2.src,
        },
        description:
          'Scott Edwards is a fashion designer and stylist with a passion for creating unique and stylish outfits. He has a keen eye for detail and loves to experiment with different styles and trends.',
      },
      category: { href: '#', title: 'Marketing' },
      date: 'Mar 16, 2020',
      datetime: '2020-03-16',
      excerpt:
        'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
      featuredImage: {
        width: 3773,
        alt: 'Graduation Dresses: A Style Guide',
        height: 600,
        src: 'https://images.unsplash.com/photo-1746699484949-869986068267?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzNHx8fGVufDB8fHx8fA%3D%3D',
      },
      handle: 'graduation-dresses-style-guide',
      timeToRead: '3 min read',
      title: 'Graduation Dresses: A Style Guide',
    },
  ];
}
export async function getBlogPostsByHandle(handle: string) {
  // lower case the handle
  handle = handle.toLowerCase();

  const posts = await getBlogPosts();
  const post = posts.find((post) => post.handle === handle);
  return {
    ...post,
    content: 'Lorem ipsum dolor ...',
    tags: ['fashion', 'style', 'trends'],
  };
}

export function getCart(id: string) {
  return {
    id: 'gid://shopify/Cart/1',
    cost: {
      discount: 0,
      shipping: 0,
      subtotal: 199,
      tax: 0,
      total: 199,
    },
    createdAt: '2025-01-06',
    lines: [
      {
        id: '1',
        name: 'Basic Tee',
        color: 'Sienna',
        handle: 'basic-tee',
        image: {
          width: productImage1.width,
          alt: 'Front of Basic Tee in black.',
          height: productImage1.height,
          src: productImage1.src,
        },
        inStock: true,
        price: 199,
        quantity: 1,
        size: 'L',
      },
      {
        id: '2',
        name: 'Basic Coahuila',
        color: 'Black',
        handle: 'basic-coahuila',
        image: {
          width: productImage2.width,
          alt: 'Front of Basic Coahuila in black.',
          height: productImage2.height,
          src: productImage2.src,
        },
        inStock: false,
        leadTime: '3–4 weeks',
        price: 99,
        quantity: 2,
        size: 'XL',
      },
      {
        id: '3',
        name: 'Nomad Tumbler',
        color: 'White',
        handle: 'nomad-tumbler',
        image: {
          width: productImage3.width,
          alt: 'Front of Nomad Tumbler in white.',
          height: productImage3.height,
          src: productImage3.src,
        },
        inStock: true,
        price: 119,
        quantity: 1,
        size: 'M',
      },
    ],
    note: 'This is a note',
    totalQuantity: 4,
  };
}

// ------------------------  DATA ------------------------
export async function getCollections() {
  return [
    // default collections 1 - 7
    {
      id: 'gid://1',
      color: 'bg-indigo-50',
      count: 77,
      description:
        'Stylish jackets for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'jackets',
      image: {
        width: collectionImage1.width,
        alt: 'Explore new arrivals',
        height: collectionImage1.height,
        src: collectionImage1.src,
      },
      sortDescription: 'Newest arrivals',
      title: 'Jackets',
    },
    {
      id: 'gid://2',
      color: 'bg-indigo-50',
      count: 155,
      description:
        'Casual t-shirts for everyday wear, combining comfort and style effortlessly. Find your fit.',
      handle: 't-shirts',
      image: {
        width: collectionImage2.width,
        alt: 'Explore new arrivals',
        height: collectionImage2.height,
        src: collectionImage2.src,
      },
      sortDescription: 'Best sellers',
      title: 'T-Shirts',
    },
    {
      id: 'gid://3',
      color: 'bg-indigo-50',
      count: 35,
      description:
        'Trendy jeans for a casual yet stylish look. Perfect for any occasion. Find your fit.',
      handle: 'jeans',
      image: {
        width: collectionImage3.width,
        alt: 'Explore new arrivals',
        height: collectionImage3.height,
        src: collectionImage3.src,
      },
      sortDescription: 'Best sellers',
      title: 'Jeans',
    },
    {
      id: 'gid://4',
      color: 'bg-indigo-50',
      count: 87,
      description:
        'Elegant coats for every season, combining warmth and style. Find your perfect outerwear.',
      handle: 'coats',
      image: {
        width: collectionImage4.width,
        alt: 'Explore new arrivals',
        height: collectionImage4.height,
        src: collectionImage4.src,
      },
      sortDescription: 'Best seasonal',
      title: 'Coats',
    },
    {
      id: 'gid://5',
      color: 'bg-indigo-50',
      count: 114,
      description:
        'Trendy shoes for every occasion, from casual to formal. Find your perfect pair.',
      handle: 'shoes',
      image: {
        width: collectionImage5.width,
        alt: 'Explore new arrivals',
        height: collectionImage5.height,
        src: collectionImage5.src,
      },
      sortDescription: 'Top rated',
      title: 'Shoes',
    },
    {
      id: 'gid://6',
      color: 'bg-indigo-50',
      count: 55,
      description:
        'Stylish accessories to complete your look. Explore our collection of trendy accessories.',
      handle: 'accessories',
      image: {
        width: collectionImage6.width,
        alt: 'Explore new arrivals',
        height: collectionImage6.height,
        src: collectionImage6.src,
      },
      sortDescription: 'Top transparent',
      title: 'Accessories',
    },
    {
      id: 'gid://7',
      color: 'bg-indigo-50',
      count: 55,
      description: 'Stylish bags for every occasion, from casual to formal. Find your perfect bag.',
      handle: 'bags',
      image: {
        width: collectionImage7.width,
        alt: 'Explore new arrivals',
        height: collectionImage7.height,
        src: collectionImage7.src,
      },
      sortDescription: 'Best trends',
      title: 'Bags',
    },

    //  Featured collections 8 - 11
    {
      id: 'gid://8',
      color: 'bg-orange-50',
      count: 77,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'explore-new-arrivals',
      image: {
        width: collectionImage5.width,
        alt: 'Explore new arrivals',
        height: collectionImage5.height,
        src: collectionImage5.src,
      },
      sortDescription: 'Shop the latest <br /> from top brands',
      title: 'Explore new arrivals',
    },
    {
      id: 'gid://9',
      color: 'bg-green-50',
      count: 85,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'sale-collection',
      image: {
        width: collectionImage4.width,
        alt: 'Explore new arrivals',
        height: collectionImage4.height,
        src: collectionImage4.src,
      },
      sortDescription: 'Up to <br /> 80% off retail',
      title: 'Sale collection',
    },
    {
      id: 'gid://10',
      color: 'bg-blue-50',
      count: 77,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'sale-collection',
      image: {
        width: collectionImage3.width,
        alt: 'Explore new arrivals',
        height: collectionImage3.height,
        src: collectionImage3.src,
      },
      sortDescription: 'Up to <br /> 90% off retail',
      title: 'Sale collection',
    },
    {
      id: 'gid://11',
      color: 'bg-red-50',
      count: 112,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'digital-gift-cards',
      image: {
        width: collectionImage2.width,
        alt: 'Explore new arrivals',
        height: collectionImage2.height,
        src: collectionImage2.src,
      },
      sortDescription: 'Give the gift <br /> of choice',
      title: 'Digital gift cards',
    },

    // Brands collections 12 - 15
    {
      id: 'gid://12',
      color: 'bg-neutral-100',
      count: 77,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'sport-kits',
      image: {
        width: boothImage1.width,
        alt: 'Explore new arrivals',
        height: boothImage1.height,
        src: boothImage1.src,
      },
      sortDescription: '20+ categories',
      title: 'Sport Kits',
    },
    {
      id: 'gid://13',
      color: 'bg-neutral-100',
      count: 77,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'beauty-products',
      image: {
        width: boothImage2.width,
        alt: 'Explore new arrivals',
        height: boothImage2.height,
        src: boothImage2.src,
      },
      sortDescription: '20+ categories',
      title: 'Beauty Products',
    },
    {
      id: 'gid://14',
      color: 'bg-neutral-100',
      count: 77,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'travel-kits',
      image: {
        width: boothImage3.width,
        alt: 'Explore new arrivals',
        height: boothImage3.height,
        src: boothImage3.src,
      },
      sortDescription: '20+ categories',
      title: 'Travel Kits',
    },
    {
      id: 'gid://15',
      color: 'bg-neutral-100',
      count: 99,
      description:
        'Excoolent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
      handle: 'pets-food',
      image: {
        width: boothImage4.width,
        alt: 'Explore new arrivals',
        height: boothImage4.height,
        src: boothImage4.src,
      },
      sortDescription: '44+ categories',
      title: 'Pets Food',
    },
  ];
}

export async function getGroupCollections() {
  const allCollections = await getCollections();
  const collections = allCollections.slice(0, 6);
  return [
    {
      id: '1',
      collections,
      description: 'lorem ipsum',
      handle: 'women',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      title: 'Women',
    },
    {
      id: '2',
      collections: shuffleArray(collections),
      description: 'lorem ipsum',
      handle: 'man',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M21.5 2.5L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M15 2.5H21.5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      title: 'Man',
    },
    {
      id: '3',
      collections: shuffleArray(collections),
      description: 'lorem ipsum',
      handle: 'accessories',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 11.0001C13.2869 11.0001 14.33 9.95687 14.33 8.67004C14.33 7.38322 13.2869 6.34009 12 6.34009C10.7132 6.34009 9.67004 7.38322 9.67004 8.67004C9.67004 9.95687 10.7132 11.0001 12 11.0001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M16 16.6601C16 14.8601 14.21 13.4001 12 13.4001C9.79 13.4001 8 14.8601 8 16.6601" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      title: 'Accessories',
    },
    {
      id: '4',
      collections: shuffleArray(collections),
      description: 'lorem ipsum',
      handle: 'footwear',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.81995 12H14.1799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M1.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      title: 'Footwear',
    },
    {
      id: '5',
      collections: shuffleArray(collections),
      description: 'lorem ipsum',
      handle: 'jewelry',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      title: 'Jewelry',
    },
    {
      id: '6',
      collections: shuffleArray(collections),
      description: 'lorem ipsum',
      handle: 'beauty',
      iconSvg: `<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>`,
      title: 'Beauty',
    },
  ];
}

export async function getCollectionByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase();
  // const all products slug: /collections/all
  if (handle === 'all') {
    return {
      id: 'gid://all',
      color: 'bg-indigo-50',
      count: 77,
      description:
        'Explore our entire collection of products, from clothing to accessories. Find your perfect style.',
      handle: 'all',
      image: {
        width: collectionImage1.width,
        alt: 'Explore new arrivals',
        height: collectionImage1.height,
        src: collectionImage1.src,
      },
      sortDescription: 'All products',
      title: 'All Products',
    };
  }

  const allCollections = await getCollections();
  return allCollections?.find((collection) => collection?.handle === handle);
}

export async function getProducts() {
  return [
    {
      id: 'gid://1001',
      createdAt: '2025-05-06T10:00:00-04:00',
      featuredImage: {
        width: productImage1.width,
        alt: 'Leather Tote Bag',
        height: productImage1.height,
        src: productImage1.src,
      },
      handle: 'leather-tote-bag',
      images: [
        {
          width: productImage1.width,
          alt: 'Leather Tote Bag',
          height: productImage1.height,
          src: productImage1.src,
        },
        {
          width: productImage1_1.width,
          alt: 'Leather Tote Bag',
          height: productImage1_1.height,
          src: productImage1_1.src,
        },
        {
          width: productImage1_2.width,
          alt: 'Leather Tote Bag',
          height: productImage1_2.height,
          src: productImage1_2.src,
        },
        {
          width: productImage1_3.width,
          alt: 'Leather Tote Bag',
          height: productImage1_3.height,
          src: productImage1_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Black',
              swatch: {
                color: '#000000',
                image: null,
              },
            },
            {
              name: 'Pink Yarrow',
              swatch: {
                color: 'oklch(42.1% 0.095 57.708)',
                image: null,
              },
            },
            {
              name: 'indigo',
              swatch: {
                color: '#D1C9C1',
                image: null,
              },
            },
            {
              name: 'Stone',
              swatch: {
                color: '#f7e3d4',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'XXS',
              swatch: null,
            },
            {
              name: 'XS',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
            {
              name: 'XL',
              swatch: null,
            },
          ],
        },
      ],
      price: 85,
      rating: 4.5,
      reviewNumber: 87,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Pink Yarrow',
        },
        {
          name: 'Size',
          value: 'XS',
        },
      ],
      status: 'New in',
      title: 'Leather Tote Bag',
      vendor: 'LuxCouture',
    },
    {
      id: 'gid://1002',
      createdAt: '2025-05-07T09:30:00-04:00',
      featuredImage: {
        width: productImage2.width,
        alt: 'Silk Midi Dress',
        height: productImage2.height,
        src: productImage2.src,
      },
      handle: 'silk-midi-dress',
      images: [
        {
          width: productImage2.width,
          alt: 'Silk Midi Dress',
          height: productImage2.height,
          src: productImage2.src,
        },
        {
          width: productImage2_1.width,
          alt: 'Silk Midi Dress',
          height: productImage2_1.height,
          src: productImage2_1.src,
        },
        {
          width: productImage2_2.width,
          alt: 'Silk Midi Dress',
          height: productImage2_2.height,
          src: productImage2_2.src,
        },
        {
          width: productImage2_3.width,
          alt: 'Silk Midi Dress',
          height: productImage2_3.height,
          src: productImage2_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Emerald Green',
              swatch: {
                color: '#2E8B57',
                image: null,
              },
            },
            {
              name: 'Ivory',
              swatch: {
                color: 'oklch(84.1% 0.238 128.85)',
                image: null,
              },
            },
            {
              name: 'Navy Blue',
              swatch: {
                color: '#000080',
                image: null,
              },
            },
            {
              name: 'Coral',
              swatch: {
                color: '#FF7F50',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'XS',
              swatch: null,
            },
            {
              name: 'S',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
          ],
        },
      ],
      price: 120,
      rating: 4.7,
      reviewNumber: 95,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Emerald Green',
        },
        {
          name: 'Size',
          value: 'S',
        },
      ],
      status: 'Best Seller',
      title: 'Silk Midi Dress',
      vendor: 'ChicElegance',
    },
    {
      id: 'gid://1003',
      createdAt: '2025-05-08T11:15:00-04:00',
      featuredImage: {
        width: productImage3.width,
        alt: 'Denim Jacket',
        height: productImage3.height,
        src: productImage3.src,
      },
      handle: 'denim-jacket',
      images: [
        {
          width: productImage3.width,
          alt: 'Denim Jacket',
          height: productImage3.height,
          src: productImage3.src,
        },
        {
          width: productImage3_1.width,
          alt: 'Denim Jacket',
          height: productImage3_1.height,
          src: productImage3_1.src,
        },
        {
          width: productImage3_2.width,
          alt: 'Denim Jacket',
          height: productImage3_2.height,
          src: productImage3_2.src,
        },
        {
          width: productImage3_3.width,
          alt: 'Denim Jacket',
          height: productImage3_3.height,
          src: productImage3_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Light Blue',
              swatch: {
                color: '#ADD8E6',
                image: null,
              },
            },
            {
              name: 'Dark Blue',
              swatch: {
                color: '#00008B',
                image: null,
              },
            },
            {
              name: 'Black',
              swatch: {
                color: '#000000',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'S',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
            {
              name: 'XL',
              swatch: null,
            },
          ],
        },
      ],
      price: 65,
      rating: 4.3,
      reviewNumber: 120,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Light Blue',
        },
        {
          name: 'Size',
          value: 'M',
        },
      ],
      status: 'New in',
      title: 'Denim Jacket',
      vendor: 'UrbanTrend',
    },
    {
      id: 'gid://1004',
      createdAt: '2025-05-09T14:20:00-04:00',
      featuredImage: {
        width: productImage4.width,
        alt: 'Cashmere Sweater',
        height: productImage4.height,
        src: productImage4.src,
      },
      handle: 'cashmere-sweater',
      images: [
        {
          width: productImage4.width,
          alt: 'Cashmere Sweater',
          height: productImage4.height,
          src: productImage4.src,
        },
        {
          width: productImage4_1.width,
          alt: 'Cashmere Sweater',
          height: productImage4_1.height,
          src: productImage4_1.src,
        },
        {
          width: productImage4_2.width,
          alt: 'Cashmere Sweater',
          height: productImage4_2.height,
          src: productImage4_2.src,
        },
        {
          width: productImage4_3.width,
          alt: 'Cashmere Sweater',
          height: productImage4_3.height,
          src: productImage4_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Charcoal',
              swatch: {
                color: '#36454F',
                image: null,
              },
            },
            {
              name: 'Cream',
              swatch: {
                color: 'oklch(81% 0.117 11.638)',
                image: null,
              },
            },
            {
              name: 'Burgundy',
              swatch: {
                color: '#800020',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'XS',
              swatch: null,
            },
            {
              name: 'S',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
          ],
        },
      ],
      price: 150,
      rating: 4.8,
      reviewNumber: 75,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Cream',
        },
        {
          name: 'Size',
          value: 'M',
        },
      ],
      status: 'Limited Edition',
      title: 'Cashmere Sweater',
      vendor: 'SoftLux',
    },
    {
      id: 'gid://1005',
      createdAt: '2025-05-10T08:45:00-04:00',
      featuredImage: {
        width: productImage5.width,
        alt: 'Linen Blazer',
        height: productImage5.height,
        src: productImage5.src,
      },
      handle: 'linen-blazer',
      images: [
        {
          width: productImage5.width,
          alt: 'Linen Blazer',
          height: productImage5.height,
          src: productImage5.src,
        },
        {
          width: productImage5_1.width,
          alt: 'Linen Blazer',
          height: productImage5_1.height,
          src: productImage5_1.src,
        },
        {
          width: productImage5_2.width,
          alt: 'Linen Blazer',
          height: productImage5_2.height,
          src: productImage5_2.src,
        },
        {
          width: productImage5_3.width,
          alt: 'Linen Blazer',
          height: productImage5_3.height,
          src: productImage5_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Beige',
              swatch: {
                color: '#F5F5DC',
                image: null,
              },
            },
            {
              name: 'Navy',
              swatch: {
                color: '#000080',
                image: null,
              },
            },
            {
              name: 'Olive',
              swatch: {
                color: '#808000',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
            {
              name: 'XL',
              swatch: null,
            },
          ],
        },
      ],
      price: 95,
      rating: 4.4,
      reviewNumber: 60,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Beige',
        },
        {
          name: 'Size',
          value: 'L',
        },
      ],
      status: 'New in',
      title: 'Linen Blazer',
      vendor: 'TailoredFit',
    },
    {
      id: 'gid://1006',
      createdAt: '2025-05-11T12:10:00-04:00',
      featuredImage: {
        width: productImage6.width,
        alt: 'Velvet Skirt',
        height: productImage6.height,
        src: productImage6.src,
      },
      handle: 'velvet-skirt',
      images: [
        {
          width: productImage6.width,
          alt: 'Velvet Skirt',
          height: productImage6.height,
          src: productImage6.src,
        },
        {
          width: productImage6_1.width,
          alt: 'Velvet Skirt',
          height: productImage6_1.height,
          src: productImage6_1.src,
        },
        {
          width: productImage6_2.width,
          alt: 'Velvet Skirt',
          height: productImage6_2.height,
          src: productImage6_2.src,
        },
        {
          width: productImage6_3.width,
          alt: 'Velvet Skirt',
          height: productImage6_3.height,
          src: productImage6_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Midnight Blue',
              swatch: {
                color: '#191970',
                image: null,
              },
            },
            {
              name: 'Wine Red',
              swatch: {
                color: '#722F37',
                image: null,
              },
            },
            {
              name: 'Emerald',
              swatch: {
                color: '#50C878',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'XS',
              swatch: null,
            },
            {
              name: 'S',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
          ],
        },
      ],
      price: 55,
      rating: 4.2,
      reviewNumber: 45,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Wine Red',
        },
        {
          name: 'Size',
          value: 'S',
        },
      ],
      status: 'Trending',
      title: 'Velvet Skirt',
      vendor: 'GlamVibe',
    },
    {
      id: 'gid://1007',
      createdAt: '2025-05-12T10:25:00-04:00',
      featuredImage: {
        width: productImage7.width,
        alt: 'Wool Trench Coat',
        height: productImage7.height,
        src: productImage7.src,
      },
      handle: 'wool-trench-coat',
      images: [
        {
          width: productImage7.width,
          alt: 'Wool Trench Coat',
          height: productImage7.height,
          src: productImage7.src,
        },
        {
          width: productImage7_1.width,
          alt: 'Wool Trench Coat',
          height: productImage7_1.height,
          src: productImage7_1.src,
        },
        {
          width: productImage7_2.width,
          alt: 'Wool Trench Coat',
          height: productImage7_2.height,
          src: productImage7_2.src,
        },
        {
          width: productImage7_3.width,
          alt: 'Wool Trench Coat',
          height: productImage7_3.height,
          src: productImage7_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'Camel',
              swatch: {
                color: '#C19A6B',
                image: null,
              },
            },
            {
              name: 'Black',
              swatch: {
                color: '#000000',
                image: null,
              },
            },
            {
              name: 'Grey',
              swatch: {
                color: '#808080',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'S',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
            {
              name: 'XL',
              swatch: null,
            },
          ],
        },
      ],
      price: 180,
      rating: 4.6,
      reviewNumber: 80,
      selectedOptions: [
        {
          name: 'Color',
          value: 'Camel',
        },
        {
          name: 'Size',
          value: 'M',
        },
      ],
      status: 'New in',
      title: 'Wool Trench Coat',
      vendor: 'ClassicCharm',
    },
    {
      id: 'gid://1008',
      createdAt: '2025-05-13T09:00:00-04:00',
      featuredImage: {
        width: productImage8.width,
        alt: 'Cotton Shirt',
        height: productImage8.height,
        src: productImage8.src,
      },
      handle: 'cotton-shirt',
      images: [
        {
          width: productImage8.width,
          alt: 'Cotton Shirt',
          height: productImage8.height,
          src: productImage8.src,
        },
        {
          width: productImage8_1.width,
          alt: 'Cotton Shirt',
          height: productImage8_1.height,
          src: productImage8_1.src,
        },
        {
          width: productImage8_2.width,
          alt: 'Cotton Shirt',
          height: productImage8_2.height,
          src: productImage8_2.src,
        },
        {
          width: productImage8_3.width,
          alt: 'Cotton Shirt',
          height: productImage8_3.height,
          src: productImage8_3.src,
        },
      ],
      options: [
        {
          name: 'Color',
          optionValues: [
            {
              name: 'White',
              swatch: {
                color: 'oklch(81% 0.117 11.638)',
                image: null,
              },
            },
            {
              name: 'Light Blue',
              swatch: {
                color: '#ADD8E6',
                image: null,
              },
            },
            {
              name: 'Pink',
              swatch: {
                color: '#FFC1CC',
                image: null,
              },
            },
          ],
        },
        {
          name: 'Size',
          optionValues: [
            {
              name: 'S',
              swatch: null,
            },
            {
              name: 'M',
              swatch: null,
            },
            {
              name: 'L',
              swatch: null,
            },
          ],
        },
      ],
      price: 45,
      rating: 4.1,
      reviewNumber: 110,
      selectedOptions: [
        {
          name: 'Color',
          value: 'White',
        },
        {
          name: 'Size',
          value: 'M',
        },
      ],
      status: 'Best Seller',
      title: 'Cotton Shirt',
      vendor: 'CasualVibe',
    },
  ];
}

export async function getProductByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase();

  const products = await getProducts();
  return products.find((product) => product.handle === handle);
}
// get product by handle
export async function getProductDetailByHandle(handle: string) {
  // lowercase handle
  handle = handle.toLowerCase();

  // for demo purposes, we are using a static product detail
  const product = await getProductByHandle(handle);

  return {
    ...product,
    careInstruction:
      'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron low if needed. Do not dry clean.',
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 43% Sorona Yarn + 57% Stretch Polyester',
      'Casual pants waist with elastic elastic inside',
      'The pants are a bit tight so you always feel comfortable',
      'Excool technology application 4-way stretch',
    ],
    publishedAt: '2019-03-27T17:43:25Z',
    selectedOptions: [
      {
        name: 'Color',
        value: 'Pink Yarrow',
      },
      {
        name: 'Size',
        value: 'XS',
      },
    ],
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
    status: 'In Stock',
  };
}

// COMMON Types ------------------------------------------------------------------------
export type TCollection = Partial<Awaited<ReturnType<typeof getCollections>>[number]>;
export type TProductItem = Partial<Awaited<ReturnType<typeof getProducts>>[number]>;
export type TProductDetail = Partial<Awaited<ReturnType<typeof getProductDetailByHandle>>>;
export type TCardProduct = Partial<Awaited<ReturnType<typeof getCart>['lines'][number]>>;
export type TBlogPost = Partial<Awaited<ReturnType<typeof getBlogPosts>>[number]>;
export type TReview = Partial<Awaited<ReturnType<typeof getProductReviews>>[number]>;
export type TOrder = Partial<Awaited<ReturnType<typeof getOrders>>[number]>;

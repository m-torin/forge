// Extracted data from apps/webapp/src/data/data.ts
// This contains the demo e-commerce data for seeding

export const webappProducts = [
  {
    id: 'gid://1001',
    title: 'Leather Tote Bag',
    handle: 'leather-tote-bag',
    createdAt: '2025-05-06T10:00:00-04:00',
    vendor: 'LuxCouture',
    price: 85,
    featuredImage: {
      src: '/images/products/p1.jpg',
      alt: 'Leather Tote Bag',
    },
    images: [
      { src: '/images/products/p1.jpg', alt: 'Leather Tote Bag' },
      { src: '/images/products/p1-1.jpg', alt: 'Leather Tote Bag' },
      { src: '/images/products/p1-2.jpg', alt: 'Leather Tote Bag' },
      { src: '/images/products/p1-3.jpg', alt: 'Leather Tote Bag' },
    ],
    reviewNumber: 87,
    rating: 4.5,
    status: 'New in',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Black', swatch: { color: '#000000' } },
          { name: 'Pink Yarrow', swatch: { color: 'oklch(42.1% 0.095 57.708)' } },
          { name: 'Indigo', swatch: { color: '#D1C9C1' } },
          { name: 'Stone', swatch: { color: '#f7e3d4' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [
          { name: 'XXS' },
          { name: 'XS' },
          { name: 'M' },
          { name: 'L' },
          { name: 'XL' },
        ],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 43% Sorona Yarn + 57% Stretch Polyester',
      'Casual pants waist with elastic elastic inside',
      'The pants are a bit tight so you always feel comfortable',
      'Excool technology application 4-way stretch',
    ],
    careInstruction:
      'Machine wash cold with like colors. Do not bleach. Tumble dry low. Iron low if needed. Do not dry clean.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1002',
    title: 'Silk Midi Dress',
    handle: 'silk-midi-dress',
    createdAt: '2025-05-07T09:30:00-04:00',
    vendor: 'ChicElegance',
    price: 120,
    featuredImage: {
      src: '/images/products/p2.jpg',
      alt: 'Silk Midi Dress',
    },
    images: [
      { src: '/images/products/p2.jpg', alt: 'Silk Midi Dress' },
      { src: '/images/products/p2-1.jpg', alt: 'Silk Midi Dress' },
      { src: '/images/products/p2-2.jpg', alt: 'Silk Midi Dress' },
      { src: '/images/products/p2-3.jpg', alt: 'Silk Midi Dress' },
    ],
    reviewNumber: 95,
    rating: 4.7,
    status: 'Best Seller',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Emerald Green', swatch: { color: '#2E8B57' } },
          { name: 'Ivory', swatch: { color: 'oklch(84.1% 0.238 128.85)' } },
          { name: 'Navy Blue', swatch: { color: '#000080' } },
          { name: 'Coral', swatch: { color: '#FF7F50' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'XS' }, { name: 'S' }, { name: 'M' }, { name: 'L' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 100% Mulberry Silk',
      'Midi length with elegant flow',
      'Hidden zipper closure',
      'Dry clean only for best results',
    ],
    careInstruction:
      'Dry clean only. Store in a cool, dry place. Steam or iron on low heat with a pressing cloth.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1003',
    title: 'Denim Jacket',
    handle: 'denim-jacket',
    createdAt: '2025-05-08T11:15:00-04:00',
    vendor: 'UrbanTrend',
    price: 65,
    featuredImage: {
      src: '/images/products/p3.jpg',
      alt: 'Denim Jacket',
    },
    images: [
      { src: '/images/products/p3.jpg', alt: 'Denim Jacket' },
      { src: '/images/products/p3-1.jpg', alt: 'Denim Jacket' },
      { src: '/images/products/p3-2.jpg', alt: 'Denim Jacket' },
      { src: '/images/products/p3-3.jpg', alt: 'Denim Jacket' },
    ],
    reviewNumber: 120,
    rating: 4.3,
    status: 'New in',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Light Blue', swatch: { color: '#ADD8E6' } },
          { name: 'Dark Blue', swatch: { color: '#00008B' } },
          { name: 'Black', swatch: { color: '#000000' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 100% Cotton Denim',
      'Classic button-front closure',
      'Two chest pockets with button flaps',
      'Adjustable button tabs at hem',
    ],
    careInstruction: 'Machine wash cold inside out. Tumble dry low. Iron if needed. Do not bleach.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1004',
    title: 'Cashmere Sweater',
    handle: 'cashmere-sweater',
    createdAt: '2025-05-09T14:20:00-04:00',
    vendor: 'SoftLux',
    price: 150,
    featuredImage: {
      src: '/images/products/p4.jpg',
      alt: 'Cashmere Sweater',
    },
    images: [
      { src: '/images/products/p4.jpg', alt: 'Cashmere Sweater' },
      { src: '/images/products/p4-1.jpg', alt: 'Cashmere Sweater' },
      { src: '/images/products/p4-2.jpg', alt: 'Cashmere Sweater' },
      { src: '/images/products/p4-3.jpg', alt: 'Cashmere Sweater' },
    ],
    reviewNumber: 75,
    rating: 4.8,
    status: 'Limited Edition',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Charcoal', swatch: { color: '#36454F' } },
          { name: 'Cream', swatch: { color: 'oklch(81% 0.117 11.638)' } },
          { name: 'Burgundy', swatch: { color: '#800020' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'XS' }, { name: 'S' }, { name: 'M' }, { name: 'L' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 100% Pure Cashmere',
      'Luxuriously soft and warm',
      'Ribbed cuffs and hem',
      'Classic crew neck design',
    ],
    careInstruction:
      'Hand wash cold or dry clean. Lay flat to dry. Store folded with cedar or lavender.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1005',
    title: 'Linen Blazer',
    handle: 'linen-blazer',
    createdAt: '2025-05-10T08:45:00-04:00',
    vendor: 'TailoredFit',
    price: 95,
    featuredImage: {
      src: '/images/products/p5.jpg',
      alt: 'Linen Blazer',
    },
    images: [
      { src: '/images/products/p5.jpg', alt: 'Linen Blazer' },
      { src: '/images/products/p5-1.jpg', alt: 'Linen Blazer' },
      { src: '/images/products/p5-2.jpg', alt: 'Linen Blazer' },
      { src: '/images/products/p5-3.jpg', alt: 'Linen Blazer' },
    ],
    reviewNumber: 60,
    rating: 4.4,
    status: 'New in',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Beige', swatch: { color: '#F5F5DC' } },
          { name: 'Navy', swatch: { color: '#000080' } },
          { name: 'Olive', swatch: { color: '#808000' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'M' }, { name: 'L' }, { name: 'XL' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 100% Linen',
      'Breathable and lightweight',
      'Two-button closure',
      'Functional interior pockets',
    ],
    careInstruction:
      'Dry clean recommended. Can be hand washed in cold water. Hang to dry. Iron on medium heat.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1006',
    title: 'Velvet Skirt',
    handle: 'velvet-skirt',
    createdAt: '2025-05-11T12:10:00-04:00',
    vendor: 'GlamVibe',
    price: 55,
    featuredImage: {
      src: '/images/products/p6.jpg',
      alt: 'Velvet Skirt',
    },
    images: [
      { src: '/images/products/p6.jpg', alt: 'Velvet Skirt' },
      { src: '/images/products/p6-1.jpg', alt: 'Velvet Skirt' },
      { src: '/images/products/p6-2.jpg', alt: 'Velvet Skirt' },
      { src: '/images/products/p6-3.jpg', alt: 'Velvet Skirt' },
    ],
    reviewNumber: 45,
    rating: 4.2,
    status: 'Trending',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Midnight Blue', swatch: { color: '#191970' } },
          { name: 'Wine Red', swatch: { color: '#722F37' } },
          { name: 'Emerald', swatch: { color: '#50C878' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'XS' }, { name: 'S' }, { name: 'M' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: ['Material: Plush Velvet', 'A-line silhouette', 'Hidden side zipper', 'Fully lined'],
    careInstruction: 'Dry clean only. Steam to remove wrinkles. Store hanging to prevent crushing.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1007',
    title: 'Wool Trench Coat',
    handle: 'wool-trench-coat',
    createdAt: '2025-05-12T10:25:00-04:00',
    vendor: 'ClassicCharm',
    price: 180,
    featuredImage: {
      src: '/images/products/p7.jpg',
      alt: 'Wool Trench Coat',
    },
    images: [
      { src: '/images/products/p7.jpg', alt: 'Wool Trench Coat' },
      { src: '/images/products/p7-1.jpg', alt: 'Wool Trench Coat' },
      { src: '/images/products/p7-2.jpg', alt: 'Wool Trench Coat' },
      { src: '/images/products/p7-3.jpg', alt: 'Wool Trench Coat' },
    ],
    reviewNumber: 80,
    rating: 4.6,
    status: 'New in',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'Camel', swatch: { color: '#C19A6B' } },
          { name: 'Black', swatch: { color: '#000000' } },
          { name: 'Grey', swatch: { color: '#808080' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'S' }, { name: 'M' }, { name: 'L' }, { name: 'XL' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 80% Wool, 20% Polyester',
      'Double-breasted design',
      'Belted waist',
      'Storm shield and epaulettes',
    ],
    careInstruction:
      'Dry clean only. Store in breathable garment bag. Use cedar blocks to prevent moths.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
  {
    id: 'gid://1008',
    title: 'Cotton Shirt',
    handle: 'cotton-shirt',
    createdAt: '2025-05-13T09:00:00-04:00',
    vendor: 'CasualVibe',
    price: 45,
    featuredImage: {
      src: '/images/products/p8.jpg',
      alt: 'Cotton Shirt',
    },
    images: [
      { src: '/images/products/p8.jpg', alt: 'Cotton Shirt' },
      { src: '/images/products/p8-1.jpg', alt: 'Cotton Shirt' },
      { src: '/images/products/p8-2.jpg', alt: 'Cotton Shirt' },
      { src: '/images/products/p8-3.jpg', alt: 'Cotton Shirt' },
    ],
    reviewNumber: 110,
    rating: 4.1,
    status: 'Best Seller',
    options: [
      {
        name: 'Color',
        optionValues: [
          { name: 'White', swatch: { color: 'oklch(81% 0.117 11.638)' } },
          { name: 'Light Blue', swatch: { color: '#ADD8E6' } },
          { name: 'Pink', swatch: { color: '#FFC1CC' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [{ name: 'S' }, { name: 'M' }, { name: 'L' }],
      },
    ],
    description:
      'Fashion is a form of self-expression and autonomy at a particular period and place and in a specific context, of clothing, footwear, lifestyle, accessories, makeup, hairstyle, and body posture.',
    features: [
      'Material: 100% Premium Cotton',
      'Classic button-down collar',
      'Chest pocket',
      'Regular fit',
    ],
    careInstruction: 'Machine wash warm. Tumble dry medium. Iron on high heat. Do not bleach.',
    shippingAndReturn:
      'We offer free shipping on all orders over $50. If you are not satisfied with your purchase, you can return it within 30 days for a full refund.',
  },
];

export const webappCollections = [
  {
    id: 'gid://1',
    title: 'Jackets',
    handle: 'jackets',
    description: 'Explore our collection of trendy jackets that elevate your outfit.',
    sortDescription: 'Newest arrivals',
    color: 'bg-indigo-50',
    count: 77,
    image: { src: '/images/collections/1.png', width: 400, height: 400, alt: 'Jackets Collection' },
  },
  {
    id: 'gid://2',
    title: 'T-Shirts',
    handle: 't-shirts',
    sortDescription: 'Best sellers',
    description: 'Casual t-shirts for everyday wear, combining comfort and style effortlessly.',
    image: {
      src: '/images/collections/2.png',
      width: 400,
      height: 400,
      alt: 'T-Shirts Collection',
    },
    color: 'bg-indigo-50',
    count: 155,
  },
  {
    id: 'gid://3',
    title: 'Jeans',
    handle: 'jeans',
    sortDescription: 'Best sellers',
    description: 'Trendy jeans for a casual yet stylish look. Perfect for any occasion.',
    image: { src: '/images/collections/3.png', width: 400, height: 400, alt: 'Jeans Collection' },
    color: 'bg-indigo-50',
    count: 35,
  },
  {
    id: 'gid://4',
    title: 'Coats',
    handle: 'coats',
    sortDescription: 'Best seasonal',
    description:
      'Elegant coats for every season, combining warmth and style. Find your perfect outerwear.',
    image: { src: '/images/collections/4.png', width: 400, height: 400, alt: 'Coats Collection' },
    color: 'bg-indigo-50',
    count: 87,
  },
  {
    id: 'gid://5',
    title: 'Shoes',
    handle: 'shoes',
    sortDescription: 'Top rated',
    description: 'Trendy shoes for every occasion, from casual to formal.',
    image: { src: '/images/collections/5.png', width: 400, height: 400, alt: 'Shoes Collection' },
    color: 'bg-indigo-50',
    count: 114,
  },
  {
    id: 'gid://6',
    title: 'Accessories',
    handle: 'accessories',
    sortDescription: 'Top transparent',
    description:
      'Stylish accessories to complete your look. Explore our collection of trendy accessories.',
    image: {
      src: '/images/collections/6.png',
      width: 400,
      height: 400,
      alt: 'Accessories Collection',
    },
    color: 'bg-indigo-50',
    count: 55,
  },
  {
    id: 'gid://7',
    title: 'Bags',
    handle: 'bags',
    sortDescription: 'Best trends',
    description: 'Stylish bags for every occasion, from casual to formal. Find your perfect bag.',
    image: { src: '/images/collections/7.png', width: 400, height: 400, alt: 'Bags Collection' },
    color: 'bg-indigo-50',
    count: 55,
  },
  {
    id: 'gid://8',
    title: 'Explore new arrivals',
    handle: 'explore-new-arrivals',
    sortDescription: 'Shop the latest from top brands',
    description:
      'Excellent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
    color: 'bg-orange-50',
    count: 77,
    image: { src: '/images/collections/5.png', width: 400, height: 400, alt: 'New Arrivals' },
  },
  {
    id: 'gid://9',
    title: 'Sale collection',
    handle: 'sale-collection',
    sortDescription: 'Up to 80% off retail',
    description:
      'Excellent new arrivals for every occasion, from casual to formal. Explore our collection of trendy jackets that elevate your outfit.',
    color: 'bg-green-50',
    count: 85,
    image: { src: '/images/collections/4.png', width: 400, height: 400, alt: 'Sale Collection' },
  },
];

export const webappReviews = [
  {
    id: '1',
    title: "Can't say enough good things",
    rating: 5,
    content: `<p>I was really pleased with the overall shopping experience. My order even included a little personal, handwritten note, which delighted me!</p><p>The product quality is amazing, it looks and feel even better than I had anticipated.</p>`,
    author: 'S. Walkinshaw',
    authorAvatar: '/images/users/avatar1.jpg',
    date: 'May 16, 2025',
    datetime: '2025-01-06',
  },
  {
    id: '2',
    title: 'Perfect for going out when you want to stay comfy',
    rating: 4,
    content: `<p>The product quality is amazing, it looks and feel even better than I had anticipated.</p><p>I like it better than a regular hoody because it is tailored to be a slimmer fit. Perfect for going out when you want to stay comfy. The head opening is a little tight which makes it a little.</p>`,
    author: 'Risako M',
    authorAvatar: '/images/users/avatar2.jpg',
    date: 'May 16, 2025',
    datetime: '2025-01-06',
  },
  {
    id: '3',
    title: 'Very nice feeling sweater!',
    rating: 4,
    content: `<p>I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.</p><p>The product quality is amazing!</p>`,
    author: 'Eden Birch',
    authorAvatar: '/images/users/avatar3.jpg',
    date: 'May 16, 2025',
    datetime: '2025-01-06',
  },
  {
    id: '4',
    title: 'Very nice feeling sweater!',
    rating: 5,
    content: `<p>I would gladly recommend this store to my friends. And, now that I think of it... I actually have, many times.</p><p>The product quality is amazing!</p>`,
    author: 'Jonathan Edwards',
    authorAvatar: '/images/users/avatar4.jpg',
    date: 'May 16, 2025',
    datetime: '2025-01-06',
  },
];

export const webappBlogPosts = [
  {
    id: '1',
    title: 'Graduation Dresses: A Style Guide',
    handle: 'graduation-dresses-style-guide',
    excerpt:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    featuredImage: {
      src: 'https://images.unsplash.com/photo-1535745122259-f1e187953c4c?q=80&w=3873&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Graduation Dresses: A Style Guide',
    },
    date: 'Mar 16, 2020',
    datetime: '2020-03-16',
    category: { title: 'Marketing', href: '#' },
    timeToRead: '2 min read',
    author: {
      name: 'Scott Walkinshaw',
      avatar: { src: '/images/users/avatar1.jpg', alt: 'Scott Walkinshaw' },
      description:
        'Scott Walkinshaw is a fashion designer and stylist with over 10 years of experience in the industry. He specializes in creating unique and stylish outfits for special occasions.',
    },
  },
  {
    id: '2',
    title: 'How to Wear Your Eid Pieces All Year Long',
    handle: 'how-to-wear-your-eid-pieces-all-year-long',
    excerpt:
      'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
    featuredImage: {
      src: 'https://images.unsplash.com/photo-1668585418249-f87c0f926583?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'How to Wear Your Eid Pieces All Year Long',
    },
    date: 'Mar 16, 2020',
    datetime: '2020-03-16',
    category: { title: 'Marketing', href: '#' },
    timeToRead: '3 min read',
    author: {
      name: 'Erica Alexander',
      avatar: { src: '/images/users/avatar2.jpg', alt: 'Erica Alexander' },
      description:
        'Erica Alexander is a fashion influencer and stylist with a passion for creating unique and stylish outfits. She has a keen eye for detail and loves to experiment with different styles and trends.',
    },
  },
];

// Navigation data for creating categories
export const webappNavigation = {
  currencies: [
    { id: 'EUR', name: 'EUR' },
    { id: 'USD', name: 'USD' },
    { id: 'GBF', name: 'GBF' },
    { id: 'SAR', name: 'SAR' },
    { id: 'QAR', name: 'QAR' },
    { id: 'BAD', name: 'BAD' },
  ],
  languages: [
    { id: 'English', name: 'English', description: 'United State' },
    { id: 'Vietnamese', name: 'Vietnamese', description: 'Vietnamese' },
    { id: 'Francais', name: 'Francais', description: 'Belgique' },
  ],
  categories: [
    { name: 'Jackets', handle: 'jackets', description: 'New items in 2025' },
    { name: 'T-Shirts', handle: 'page-style-2/t-shirts', description: 'Perfect for gentlemen' },
    { name: 'Shoes', handle: 'shoes', description: 'The needs of sports' },
    { name: 'Bags', handle: 'page-style-2/bags', description: 'Luxury and nobility' },
    { name: 'Accessories', handle: 'accessories', description: 'Diamond always popular' },
  ],
};

// Shop policies
export const webappShopData = {
  description: 'An example shop with GraphQL.',
  name: 'graphql',
  termsOfService: {
    title: 'Terms of Service',
    body: 'lorem ispsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nisl nunc egestas nunc, vitae facilisis nunc nisi euismod nisi.',
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    body: '<p>privacyPolicy</p>',
  },
  refundPolicy: {
    title: 'Refund Policy',
    body: '<p>refundPolicy</p>',
  },
  shippingPolicy: {
    title: 'Shipping Policy',
    body: '<p>Shipping Policy</p>',
  },
};

// Orders data
export const webappOrders = [
  {
    number: '4657',
    date: 'March 22, 2025',
    status: 'Delivered on January 11, 2025',
    invoiceHref: '#',
    totalQuantity: 4,
    cost: {
      subtotal: 199,
      shipping: 0,
      tax: 0,
      total: 199,
      discount: 0,
    },
    products: [
      {
        id: 'gid://2',
        title: 'Nomad Tumbler',
        handle: 'nomad-tumbler',
        description:
          'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
        href: '#',
        price: 35,
        status: 'Preparing to ship',
        step: 1,
        date: 'March 24, 2021',
        datetime: '2021-03-24',
        address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
        email: 'f•••@example.com',
        phone: '1•••••••••40',
        featuredImage: {
          src: '/images/products/p2.jpg',
          width: 400,
          height: 400,
          alt: 'Insulated bottle with white base and black snap lid.',
        },
        quantity: 1,
        size: 'XS',
        color: 'Black Brown',
      },
      {
        id: 'gid://3',
        title: 'Minimalist Wristwatch',
        handle: 'minimalist-wristwatch',
        description:
          'This contemporary wristwatch has a clean, minimalist look and high quality components.',
        href: '#',
        price: 149,
        status: 'Shipped',
        step: 0,
        date: 'March 23, 2021',
        datetime: '2021-03-23',
        address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
        email: 'f•••@example.com',
        phone: '1•••••••••40',
        featuredImage: {
          src: '/images/products/p4.jpg',
          width: 400,
          height: 400,
          alt: 'Minimalist wristwatch.',
        },
        quantity: 1,
        size: 'XL',
        color: 'White',
      },
    ],
  },
  {
    number: '4376',
    status: 'Delivered on January 08, 2028',
    invoiceHref: '#',
    date: 'March 22, 2025',
    totalQuantity: 4,
    cost: {
      subtotal: 199,
      shipping: 0,
      tax: 0,
      total: 199,
      discount: 0,
    },
    products: [
      {
        id: 'gid://1',
        title: 'Nomad Tumbler',
        handle: 'nomad-tumbler',
        description:
          'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
        href: '#',
        price: 99,
        status: 'Preparing to ship',
        step: 1,
        date: 'March 24, 2021',
        datetime: '2021-03-24',
        address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
        email: 'f•••@example.com',
        phone: '1•••••••••40',
        featuredImage: {
          src: '/images/products/p1.jpg',
          width: 400,
          height: 400,
          alt: 'Insulated bottle with white base and black snap lid.',
        },
        quantity: 1,
        size: 'M',
        color: 'Black',
      },
    ],
  },
];

// Cart data
export const webappCart = {
  id: 'gid://shopify/Cart/1',
  note: 'This is a note',
  createdAt: '2025-01-06',
  totalQuantity: 4,
  cost: {
    subtotal: 199,
    shipping: 0,
    tax: 0,
    total: 199,
    discount: 0,
  },
  lines: [
    {
      id: '1',
      name: 'Basic Tee',
      handle: 'basic-tee',
      price: 199,
      color: 'Sienna',
      inStock: true,
      size: 'L',
      quantity: 1,
      image: {
        src: '/images/products/p1.jpg',
        width: 400,
        height: 400,
        alt: 'Front of Basic Tee in black.',
      },
    },
    {
      id: '2',
      name: 'Basic Coahuila',
      handle: 'basic-coahuila',
      price: 99,
      color: 'Black',
      inStock: false,
      leadTime: '3–4 weeks',
      size: 'XL',
      quantity: 2,
      image: {
        src: '/images/products/p2.jpg',
        width: 400,
        height: 400,
        alt: 'Front of Basic Coahuila in black.',
      },
    },
    {
      id: '3',
      name: 'Nomad Tumbler',
      handle: 'nomad-tumbler',
      price: 119,
      color: 'White',
      inStock: true,
      size: 'M',
      quantity: 1,
      image: {
        src: '/images/products/p3.jpg',
        width: 400,
        height: 400,
        alt: 'Front of Nomad Tumbler in white.',
      },
    },
  ],
};

// Group Collections data
export const webappGroupCollections = [
  {
    id: '1',
    title: 'Women',
    handle: 'women',
    description: "Women's fashion and accessories",
    iconSvg:
      '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 16V22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 19H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collections: webappCollections.slice(0, 6),
  },
  {
    id: '2',
    title: 'Man',
    handle: 'man',
    description: "Men's fashion and accessories",
    iconSvg:
      '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.25 21.5C14.5302 21.5 18 18.0302 18 13.75C18 9.46979 14.5302 6 10.25 6C5.96979 6 2.5 9.46979 2.5 13.75C2.5 18.0302 5.96979 21.5 10.25 21.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M21.5 2.5L16 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 2.5H21.5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collections: webappCollections.slice(0, 6),
  },
  {
    id: '3',
    title: 'Accessories',
    handle: 'accessories',
    description: 'Fashion accessories and jewelry',
    iconSvg:
      '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.08 8.58003V15.42C21.08 16.54 20.48 17.58 19.51 18.15L13.57 21.58C12.6 22.14 11.4 22.14 10.42 21.58L4.48003 18.15C3.51003 17.59 2.91003 16.55 2.91003 15.42V8.58003C2.91003 7.46003 3.51003 6.41999 4.48003 5.84999L10.42 2.42C11.39 1.86 12.59 1.86 13.57 2.42L19.51 5.84999C20.48 6.41999 21.08 7.45003 21.08 8.58003Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11.0001C13.2869 11.0001 14.33 9.95687 14.33 8.67004C14.33 7.38322 13.2869 6.34009 12 6.34009C10.7132 6.34009 9.67004 7.38322 9.67004 8.67004C9.67004 9.95687 10.7132 11.0001 12 11.0001Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 16.6601C16 14.8601 14.21 13.4001 12 13.4001C9.79 13.4001 8 14.8601 8 16.6601" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collections: webappCollections.slice(0, 6),
  },
  {
    id: '4',
    title: 'Footwear',
    handle: 'footwear',
    description: 'Shoes and footwear for all occasions',
    iconSvg:
      '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.1801 18C19.5801 18 20.1801 16.65 20.1801 15V9C20.1801 7.35 19.5801 6 17.1801 6C14.7801 6 14.1801 7.35 14.1801 9V15C14.1801 16.65 14.7801 18 17.1801 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.81995 18C4.41995 18 3.81995 16.65 3.81995 15V9C3.81995 7.35 4.41995 6 6.81995 6C9.21995 6 9.81995 7.35 9.81995 9V15C9.81995 16.65 9.21995 18 6.81995 18Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.81995 12H14.1799" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M1.5 14.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collections: webappCollections.slice(0, 6),
  },
  {
    id: '5',
    title: 'Jewelry',
    handle: 'jewelry',
    description: 'Fine jewelry and accessories',
    iconSvg:
      '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collections: webappCollections.slice(0, 6),
  },
  {
    id: '6',
    title: 'Beauty',
    handle: 'beauty',
    description: 'Beauty products and cosmetics',
    iconSvg:
      '<svg class="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.7 18.98H7.30002C6.88002 18.98 6.41002 18.65 6.27002 18.25L2.13002 6.66999C1.54002 5.00999 2.23002 4.49999 3.65002 5.51999L7.55002 8.30999C8.20002 8.75999 8.94002 8.52999 9.22002 7.79999L10.98 3.10999C11.54 1.60999 12.47 1.60999 13.03 3.10999L14.79 7.79999C15.07 8.52999 15.81 8.75999 16.45 8.30999L20.11 5.69999C21.67 4.57999 22.42 5.14999 21.78 6.95999L17.74 18.27C17.59 18.65 17.12 18.98 16.7 18.98Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.5 22H17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 14H14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    collections: webappCollections.slice(0, 6),
  },
];

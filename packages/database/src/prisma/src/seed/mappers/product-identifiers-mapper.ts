import { type Prisma } from '../../../../../prisma-generated/client';

export interface ProductIdentifierConfig {
  productId: string;
  productName: string;
  brandName: string;
  category: string;
}

export function generateProductIdentifiers(
  config: ProductIdentifierConfig,
): Prisma.ProductIdentifiersCreateInput {
  const upcA = generateUPC();
  const ean13 = generateEAN();
  const isbn13 = config.category.toLowerCase().includes('book') ? generateISBN() : undefined;
  const asin = generateASIN();
  const mpn = generateMPN(config.brandName);

  return {
    upcA,
    ean13,
    isbn13,
    asin,
    mpn,
    product: { connect: { id: config.productId } },
  };
}

// Generate realistic UPC-A (12 digits)
function generateUPC(): string {
  // UPC-A format: 1 digit system + 5 digit manufacturer + 5 digit product + 1 check digit
  const system = '0'; // Most common for retail
  const manufacturer = Math.floor(Math.random() * 90000 + 10000).toString(); // 5 digits
  const product = Math.floor(Math.random() * 90000 + 10000).toString(); // 5 digits
  const base = system + manufacturer + product;

  // Calculate check digit
  const checkDigit = calculateUPCCheckDigit(base);
  return base + checkDigit;
}

// Generate realistic EAN-13 (13 digits)
function generateEAN(): string {
  // EAN-13 format: 3 digit country + 4 digit manufacturer + 5 digit product + 1 check digit
  const countryCodes = ['400', '401', '402', '403', '404']; // Germany range (for demo)
  const country = countryCodes[Math.floor(Math.random() * countryCodes.length)];
  const manufacturer = Math.floor(Math.random() * 9000 + 1000).toString(); // 4 digits
  const product = Math.floor(Math.random() * 90000 + 10000).toString(); // 5 digits
  const base = country + manufacturer + product;

  // Calculate check digit
  const checkDigit = calculateEANCheckDigit(base);
  return base + checkDigit;
}

// Generate realistic ISBN-13 (for books)
function generateISBN(): string {
  // ISBN-13 format: 978 + 1 digit group + 4 digit publisher + 4 digit title + 1 check digit
  const prefix = '978';
  const group = Math.floor(Math.random() * 9 + 1).toString(); // 1 digit (1-9)
  const publisher = Math.floor(Math.random() * 9000 + 1000).toString(); // 4 digits
  const title = Math.floor(Math.random() * 9000 + 1000).toString(); // 4 digits
  const base = prefix + group + publisher + title;

  // Calculate check digit
  const checkDigit = calculateISBNCheckDigit(base);
  return `${prefix}-${group}-${publisher}-${title}-${checkDigit}`;
}

// Generate realistic ASIN (Amazon Standard Identification Number)
function generateASIN(): string {
  // ASIN format: B0 followed by 8 alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let asin = 'B0';

  for (let i = 0; i < 8; i++) {
    asin += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return asin;
}

// Generate Manufacturer Part Number
function generateMPN(brandName: string): string {
  const brandPrefix = brandName.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear().toString().substring(2); // Last 2 digits of year
  const model = Math.floor(Math.random() * 9000 + 1000).toString(); // 4 digits
  const variant = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z

  return `${brandPrefix}-${year}${model}${variant}`;
}

// Calculate UPC check digit
function calculateUPCCheckDigit(code: string): string {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// Calculate EAN check digit
function calculateEANCheckDigit(code: string): string {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// Calculate ISBN check digit
function calculateISBNCheckDigit(code: string): string {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    const digit = parseInt(code[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

// Generate batch identifiers for variants
export function generateVariantIdentifiers(
  parentIdentifiers: Prisma.ProductIdentifiersCreateInput,
  _variantSKU: string,
): Prisma.ProductIdentifiersCreateInput {
  // Variants share some identifiers with parent but have unique UPC
  return {
    ...parentIdentifiers,
    upcA: generateUPC(), // Unique UPC for each variant
  };
}

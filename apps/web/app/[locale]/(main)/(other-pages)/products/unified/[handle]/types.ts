export type LayoutType = 'standard' | 'gallery' | 'minimal' | 'children' | 'showcase';

export interface Seller {
  availability: string;
  hoverColor: string;
  isDirect?: boolean;
  logo: string;
  name: string;
  price: number;
  primaryColor: string;
  shipping: string;
  textColor: string;
  url: string;
}

export interface UnifiedPDPProps extends Record<string, any> {
  params: Promise<{ handle: string }>;
}

export interface ProductInfoProps extends Record<string, any> {
  className?: string;
  sellerDisplayMode?: 'buttons' | 'table';
  showAffiliateSellers?: boolean;
  showDirectPurchase?: boolean;
}

export interface SellerOptionsProps extends Record<string, any> {
  displayMode?: 'buttons' | 'table';
  includeDirectSale?: boolean;
}

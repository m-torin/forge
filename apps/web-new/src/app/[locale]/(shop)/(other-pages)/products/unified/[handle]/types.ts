export type LayoutType =
  | "standard"
  | "gallery"
  | "minimal"
  | "children"
  | "showcase";

export interface Seller {
  name: string;
  price: number;
  availability: string;
  shipping: string;
  url: string;
  logo: string;
  primaryColor: string;
  hoverColor: string;
  textColor: string;
  isDirect?: boolean;
}

export interface UnifiedPDPProps {
  params: Promise<{ handle: string }>;
}

export interface ProductInfoProps {
  className?: string;
  showDirectPurchase?: boolean;
  showAffiliateSellers?: boolean;
  sellerDisplayMode?: "buttons" | "table";
}

export interface SellerOptionsProps {
  displayMode?: "buttons" | "table";
  includeDirectSale?: boolean;
}

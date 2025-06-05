export type LayoutType =
  | "standard"
  | "gallery"
  | "minimal"
  | "children"
  | "showcase";

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

export interface UnifiedPDPProps {
  params: Promise<{ handle: string }>;
}

export interface ProductInfoProps {
  className?: string;
  sellerDisplayMode?: "buttons" | "table";
  showAffiliateSellers?: boolean;
  showDirectPurchase?: boolean;
}

export interface SellerOptionsProps {
  displayMode?: "buttons" | "table";
  includeDirectSale?: boolean;
}

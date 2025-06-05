import type { Seller } from "./types";

export function getSellerData(basePrice: number, dict?: any): Seller[] {
  return [
    {
      name: "Amazon",
      price: basePrice,
      availability: dict?.product?.inStock || "In Stock",
      shipping: dict?.product?.freeShipping || "Free with Prime",
      url: "#",
      logo: "🛒",
      primaryColor: "bg-[#FF9900]",
      hoverColor: "hover:bg-[#FF7700]",
      textColor: "text-black",
    },
    {
      name: "Target",
      price: basePrice * 0.95,
      availability: dict?.product?.inStock || "In Stock",
      shipping: "Free shipping on $35+",
      url: "#",
      logo: "🎯",
      primaryColor: "bg-[#CC0000]",
      hoverColor: "hover:bg-[#AA0000]",
      textColor: "text-white",
    },
    {
      name: "Walmart",
      price: basePrice * 0.92,
      availability: dict?.product?.inStock || "In Stock",
      shipping: dict?.product?.freeShipping || "Free shipping",
      url: "#",
      logo: "🏪",
      primaryColor: "bg-[#0071CE]",
      hoverColor: "hover:bg-[#0056A0]",
      textColor: "text-white",
    },
    {
      name: "Best Buy",
      price: basePrice * 1.05,
      availability: dict?.product?.limitedStock || "Limited Stock",
      shipping: "Free next-day delivery",
      url: "#",
      logo: "💙",
      primaryColor: "bg-[#0046BE]",
      hoverColor: "hover:bg-[#003299]",
      textColor: "text-white",
    },
    {
      name: "eBay",
      price: basePrice * 0.88,
      availability: dict?.product?.inStock || "In Stock",
      shipping: "Varies by seller",
      url: "#",
      logo: "🛍️",
      primaryColor:
        "bg-gradient-to-r from-[#0064D2] via-[#F5AF02] via-[#86B817] to-[#E53238]",
      hoverColor: "hover:opacity-90",
      textColor: "text-white",
    },
  ];
}

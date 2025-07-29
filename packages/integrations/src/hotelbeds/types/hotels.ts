// Hotel Search Types
export interface HotelSearchRequest {
  stay: {
    checkIn: string;
    checkOut: string;
  };
  occupancies: {
    rooms: number;
    adults: number;
    children: number;
    paxes?: {
      type: 'AD' | 'CH';
      age?: number;
    }[];
  }[];
  destination?: {
    code: string;
    zone?: number;
  };
  hotels?: {
    hotel: number[];
  };
  geolocation?: {
    latitude: number;
    longitude: number;
    radius: number;
    unit: 'km' | 'mi';
  };
  filter?: {
    minRate?: number;
    maxRate?: number;
    minCategory?: number;
    maxCategory?: number;
    packaging?: boolean;
    boardCodes?: string[];
    accommodations?: string[];
  };
  dailyRate?: boolean;
  language?: string;
  reviews?: {
    type: 'TRIPADVISOR' | 'HOTELBEDS';
    order: 'RATING' | 'POPULARITY';
    minRate?: number;
    maxRate?: number;
  }[];
  rooms?: {
    included?: boolean;
  };
  keywords?: {
    keyword: number[];
  };
  aifUse?: boolean;
}

export interface HotelSearchResponse {
  hotels: {
    checkIn: string;
    checkOut: string;
    total: number;
    hotels: Hotel[];
  };
}

export interface Hotel {
  code: number;
  name: string;
  description?: string;
  countryCode: string;
  stateCode?: string;
  destinationCode: string;
  zoneCode: number;
  zoneName: string;
  latitude: string;
  longitude: string;
  categoryCode: string;
  categoryName: string;
  accommodationTypeCode: string;
  accommodationTypeName: string;
  boardCodes: string[];
  segmentCodes: number[];
  address: {
    content: string;
    street?: string;
    number?: string;
  };
  postalCode: string;
  city: {
    content: string;
  };
  email?: string;
  license?: string;
  phones: {
    phoneNumber: string;
    phoneType: string;
  }[];
  rooms: Room[];
  totalSellingRate: number;
  totalNet: number;
  pendingAmount: number;
  currency: string;
  supplier: {
    name: string;
    vatNumber: string;
  };
  clientComments?: string;
  cancellationPolicies?: CancellationPolicy[];
  taxes?: {
    allIncluded: boolean;
    tax: Tax[];
  };
  images?: HotelImage[];
  reviews?: Review[];
  keywords?: Keyword[];
  minRate?: number;
  maxRate?: number;
  rateRange?: string;
  upselling?: {
    room: UpsellingRoom[];
  };
}

export interface Room {
  code: string;
  name: string;
  rates: Rate[];
}

export interface Rate {
  rateKey: string;
  rateClass: string;
  rateType: 'BOOKABLE' | 'RECHECK';
  net: number;
  discount?: number;
  discountPCT?: number;
  sellingRate: number;
  hotelSellingRate?: number;
  amount?: number;
  hotelCurrency: string;
  hotelMandatory?: boolean;
  allotment?: number;
  commission?: number;
  commissionVAT?: number;
  commissionPCT?: number;
  cost?: {
    amount: number;
    currency?: string;
  };
  rateCommentsId?: string;
  rateComments?: string;
  paymentType: 'AT_HOTEL' | 'AT_WEB';
  packaging?: boolean;
  boardCode: string;
  boardName: string;
  rateBreakDown?: {
    rateDiscount?: RateDiscount[];
    rateSupplement?: RateSupplement[];
  };
  rooms: number;
  adults: number;
  children: number;
  childrenAges?: string;
  rateup?: string;
  taxes?: {
    allIncluded: boolean;
    tax: Tax[];
  };
  promotions?: Promotion[];
  offers?: Offer[];
  shiftRate?: ShiftRate[];
  dailyRates?: DailyRate[];
}

export interface CancellationPolicy {
  amount: number;
  hotelAmount?: number;
  hotelCurrency?: string;
  from: string;
}

export interface Tax {
  included: boolean;
  percent?: number;
  amount?: number;
  currency?: string;
  type: string;
  clientAmount?: number;
  clientCurrency?: string;
}

export interface HotelImage {
  imageTypeCode: string;
  path: string;
  roomCode?: string;
  roomType?: string;
  characteristicCode?: string;
  order: number;
  visualOrder: number;
}

export interface Review {
  rate: number;
  reviewCount: number;
  type: 'TRIPADVISOR' | 'HOTELBEDS';
}

export interface Keyword {
  code: number;
  rating: number;
}

export interface RateDiscount {
  code: string;
  name?: string;
  amount: number;
}

export interface RateSupplement {
  code: string;
  name?: string;
  from?: string;
  to?: string;
  amount: number;
  nights?: number;
  paxNumber?: number;
}

export interface Promotion {
  code: string;
  name?: string;
  remark?: string;
}

export interface Offer {
  code: string;
  name?: string;
  amount?: number;
}

export interface ShiftRate {
  rateKey: string;
  rateClass: string;
  rateType: string;
  net: number;
  sellingRate: number;
  checkIn: string;
  checkOut: string;
}

export interface DailyRate {
  offset: number;
  dailyNet: number;
  dailySellingRate: number;
}

export interface UpsellingRoom {
  code: string;
  name: string;
  rates: Rate[];
}

// Booking Types
export interface BookingRequest {
  holder: {
    name: string;
    surname: string;
  };
  rooms: BookingRoom[];
  clientReference: string;
  creationDate?: string;
  remark?: string;
  voucher?: {
    language?: string;
    email?: {
      to: string;
      from: string;
      title: string;
      body: string;
    };
  };
  paymentData?: {
    paymentCard: {
      cardType: string;
      cardNumber: string;
      expiryDate: string;
      cardHolderName: string;
      cardCVC: string;
    };
    contactData?: {
      email: string;
      phoneNumber: string;
    };
    billingAddress?: {
      address1: string;
      address2?: string;
      city: string;
      state: string;
      postalCode: string;
      countryCode: string;
    };
    webPartner?: number;
  };
}

export interface BookingRoom {
  rateKey: string;
  paxes: BookingPax[];
}

export interface BookingPax {
  roomId: number;
  type: 'AD' | 'CH';
  age?: number;
  name: string;
  surname: string;
}

export interface BookingResponse {
  booking: {
    reference: string;
    clientReference: string;
    creationDate: string;
    status: 'CONFIRMED' | 'CANCELLED';
    modificationPolicies?: {
      cancellation: boolean;
      modification: boolean;
    };
    agCommision?: number;
    commisionVAT?: number;
    creationUser?: string;
    holder: {
      name: string;
      surname: string;
    };
    remark?: string;
    totalSellingRate: number;
    totalNet: number;
    pendingAmount: number;
    currency: string;
    hotel: Hotel;
  };
}

// Search Filters
export interface SearchFilters {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  rooms?: number;
  adults?: number;
  children?: number;
  childrenAges?: number[];
  minRate?: number;
  maxRate?: number;
  minCategory?: number;
  maxCategory?: number;
  boardTypes?: string[];
  amenities?: string[];
  sorting?: 'price' | 'rating' | 'distance' | 'popularity';
  page?: number;
  limit?: number;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  auditData?: {
    processTime: string;
    timestamp: string;
    requestHost: string;
    serverId: string;
    environment: string;
    release: string;
    token: string;
    internal: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  auditData: {
    processTime: string;
    timestamp: string;
    requestHost: string;
    serverId: string;
    environment: string;
    release: string;
    token: string;
    internal: string;
  };
}

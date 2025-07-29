// Types for Hotelbeds Activities API
export interface Activity {
  code: string;
  name: string;
  description: string;
  type: 'ACTIVITY' | 'TICKET' | 'EVENT' | 'TRANSFER' | 'EXCURSION';
  category: {
    code: string;
    name: string;
  };
  destination: {
    code: string;
    name: string;
    countryCode: string;
  };
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  duration: {
    value: number;
    unit: 'HOURS' | 'DAYS' | 'MINUTES';
  };
  images: ActivityImage[];
  content: {
    description: string;
    highlights: string[];
    includes: string[];
    excludes: string[];
    importantInfo: string[];
    cancellationPolicy: string;
  };
  modalities: ActivityModality[];
  reviews?: {
    rating: number;
    reviewCount: number;
    source: string;
  };
  supplier: {
    name: string;
    logo?: string;
  };
  tags: string[];
  minAge?: number;
  maxAge?: number;
  accessibility: boolean;
  languages: string[];
  operatingDays: string[];
  seasonality?: {
    from: string;
    to: string;
  };
}

export interface ActivityImage {
  url: string;
  type: string;
  order: number;
}

export interface ActivityModality {
  code: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  available: boolean;
  cancellationPolicy: string;
}

export interface ActivitySearchRequest {
  destination: {
    code: string;
    type: 'DESTINATION' | 'HOTEL' | 'ZONE';
  };
  dateFrom: string;
  dateTo: string;
  paxes: ActivityPax[];
  language?: string;
  currency?: string;
  filters?: {
    categories?: string[];
    types?: string[];
    minPrice?: number;
    maxPrice?: number;
    duration?: {
      min?: number;
      max?: number;
    };
    tags?: string[];
    accessibility?: boolean;
    languages?: string[];
  };
  pagination?: {
    page: number;
    size: number;
  };
  order?: 'PRICE_ASC' | 'PRICE_DESC' | 'RATING' | 'POPULARITY' | 'NAME';
}

export interface ActivityPax {
  type: 'ADULT' | 'CHILD';
  age: number;
}

export interface ActivityBookingRequest {
  reference: string;
  language: string;
  activities: ActivityBookingItem[];
  holder: {
    name: string;
    surname: string;
    email: string;
    phone: string;
  };
  paymentData?: {
    paymentCard: {
      cardType: string;
      cardNumber: string;
      expiryDate: string;
      cardHolderName: string;
      cardCVC: string;
    };
  };
}

export interface ActivityBookingItem {
  rateKey: string;
  date: string;
  paxes: ActivityBookingPax[];
  questions?: ActivityAnswer[];
  pickupInformation?: {
    from: {
      code: string;
      description: string;
      type: 'HOTEL' | 'AIRPORT' | 'PORT' | 'LOCATION';
    };
    time: string;
    remarks?: string;
  };
}

export interface ActivityBookingPax {
  type: 'ADULT' | 'CHILD';
  age: number;
  name: string;
  surname: string;
}

export interface ActivityAnswer {
  questionCode: string;
  answer: string;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  type: 'CONCERT' | 'SPORTS' | 'THEATER' | 'EXHIBITION' | 'FESTIVAL' | 'CONFERENCE';
  category: string;
  venue: {
    name: string;
    address: string;
    city: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    capacity?: number;
  };
  dates: EventDate[];
  images: EventImage[];
  performers?: Performer[];
  ageRestriction?: {
    minimum: number;
    maximum?: number;
  };
  dresscode?: string;
  accessibility: boolean;
  languages: string[];
  ticketTypes: TicketType[];
  seatingChart?: string;
  terms: string;
  cancellationPolicy: string;
}

export interface EventDate {
  date: string;
  time: string;
}

export interface EventImage {
  url: string;
  type: string;
  order: number;
}

export interface Performer {
  name: string;
  role: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  section?: string;
  row?: string;
  price: {
    amount: number;
    currency: string;
  };
  fees?: {
    amount: number;
    currency: string;
    description: string;
  }[];
  availability: {
    total: number;
    available: number;
  };
  restrictions?: string[];
  benefits?: string[];
  transferable: boolean;
  refundable: boolean;
}

export interface Ticket {
  id: string;
  eventId: string;
  type: TicketType;
  date: string;
  time: string;
  seat?: {
    section: string;
    row: string;
    number: string;
  };
  barcode: string;
  qrCode: string;
  status: 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';
  holder: {
    name: string;
    email: string;
  };
  purchaseDate: string;
  totalPrice: {
    amount: number;
    currency: string;
  };
  terms: string;
}

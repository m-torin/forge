// Disney-specific types and interfaces
// Import constants for type references
import {
  BOARD_TYPES,
  DINING_PLANS,
  GUEST_PREFERENCES,
  PAYMENT_TYPES,
  RATE_CLASSES,
  ROOM_PREFERENCES,
  SPECIAL_EVENTS,
  TICKET_TYPES,
} from '../constants/disney';

export interface DisneyPackage {
  code: string;
  name: string;
  description: string;
  type: 'ROOM_ONLY' | 'ROOM_TICKET' | 'DINING' | 'ULTIMATE';
  duration: number;
  inclusions: {
    room: boolean;
    tickets: {
      included: boolean;
      type?: keyof typeof TICKET_TYPES;
      duration?: number;
      hopper?: boolean;
      waterParks?: boolean;
    };
    dining: {
      included: boolean;
      plan?: keyof typeof DINING_PLANS;
      duration?: number;
    };
    extras: {
      memoryMaker?: boolean;
      geniePlus?: boolean;
      characterDining?: boolean;
      specialEvents?: string[];
    };
  };
  pricing: {
    basePrice: number;
    adultPrice: number;
    childPrice: number;
    savingsAmount?: number;
    savingsPercentage?: number;
  };
  validityPeriod?: {
    startDate: string;
    endDate: string;
  };
  blackoutDates?: string[];
  minimumStay?: number;
  maximumStay?: number;
  restrictions?: string[];
  terms?: string[];
}

export interface DisneyPromotion {
  code: string;
  name: string;
  description: string;
  type: 'ROOM' | 'PACKAGE' | 'DINING' | 'TICKET';
  discount: {
    type: 'PERCENTAGE' | 'FIXED' | 'FREE_NIGHTS';
    value: number;
    maxAmount?: number;
  };
  validityPeriod: {
    startDate: string;
    endDate: string;
  };
  eligibility: {
    residentTypes?: string[];
    membershipTypes?: string[];
    minimumStay?: number;
    roomTypes?: string[];
    hotels?: string[];
  };
  combinable: boolean;
  terms: string[];
  blackoutDates?: string[];
}

export interface DisneyDiningReservation {
  locationCode: string;
  date: string;
  mealPeriod: 'BREAKFAST' | 'LUNCH' | 'DINNER';
  partySize: number;
  experienceType: 'STANDARD' | 'CHARACTER' | 'SIGNATURE' | 'DINNER_SHOW';
  timeSlots: {
    time: string;
    available: boolean;
    requiresPrepayment: boolean;
    pricing: {
      adult: number;
      child: number;
    };
  }[];
  diningPlan: {
    accepted: boolean;
    creditsRequired: number;
    type: keyof typeof DINING_PLANS;
  };
}

export interface DisneyEventReservation {
  eventCode: keyof typeof SPECIAL_EVENTS;
  date: string;
  time: string;
  location: string;
  capacity: {
    total: number;
    available: number;
  };
  pricing: {
    adult: number;
    child: number;
    passholder?: number;
    resident?: number;
  };
  inclusions: string[];
  restrictions?: {
    age?: number;
    height?: number;
    physical?: string[];
  };
  weather?: {
    policy: string;
    alternativeDate?: string;
  };
}

export interface DisneyDiningPlan {
  type: 'QuickService' | 'Regular' | 'Deluxe';
  duration: number;
  guests: number;
  specialDietary?: string[];
  characterDining?: boolean;
  signatureRestaurants?: boolean;
}

export interface DisneyCelebration {
  type: string;
  date: string;
  addOns: {
    inRoomCelebration: boolean;
    cake: boolean;
    decorations: boolean;
    giftBasket?: boolean;
    floral?: boolean;
  };
  notes?: string;
}

export interface DisneyRoomPreference {
  view?: 'Castle' | 'Park' | 'Water' | 'Savanna' | 'Fireworks';
  floor?: 'Low' | 'High' | 'Ground';
  location?: 'Near Elevator' | 'Away from Elevator' | 'Near Transportation' | 'Near Dining';
  connecting?: boolean;
  accessibility?: {
    wheelchair?: boolean;
    hearing?: boolean;
    visual?: boolean;
    serviceAnimal?: boolean;
  };
}

export interface DisneySpecialEvent {
  code: string;
  name: string;
  date: string;
  type: 'Party' | 'Tour' | 'Dining' | 'VIP';
  price: number;
  guests: number;
  addOns?: {
    dessertParty?: boolean;
    fireworksViewing?: boolean;
    photoPass?: boolean;
  };
}

export interface DisneyHotel {
  disneyBenefits: {
    earlyEntry?: boolean;
    extendedEvening?: boolean;
    magicBands?: boolean;
    roomCharge?: boolean;
    packageDelivery?: boolean;
    complimentaryTransport?: boolean;
  };
  diningLocations: {
    restaurants: {
      name: string;
      type: 'Table Service' | 'Quick Service' | 'Character Dining' | 'Signature';
      cuisine: string[];
      priceRange: 1 | 2 | 3 | 4;
      diningPlan: boolean;
      reservations: boolean;
      mobileOrder?: boolean;
    }[];
    lounges: {
      name: string;
      type: 'Bar' | 'Lounge' | 'Pool Bar';
      hours: string;
      atmosphere: string;
    }[];
  };
  recreation: {
    pools: {
      name: string;
      type: 'Feature' | 'Quiet' | 'Splash';
      slides?: boolean;
      kidArea?: boolean;
      hours: string;
    }[];
    activities: {
      name: string;
      type: string;
      schedule: string;
      location: string;
      ageRestrictions?: string;
    }[];
  };
  transportation: {
    type: 'Monorail' | 'Bus' | 'Boat' | 'Skyliner' | 'Walking';
    destinations: string[];
    frequency: string;
    hours: {
      start: string;
      end: string;
      exceptions?: {
        date: string;
        hours: string;
        reason: string;
      }[];
    };
  }[];
  roomTypes: {
    category: string;
    name: string;
    maxOccupancy: {
      standard: number;
      maximum: number;
      rollaway?: boolean;
      crib?: boolean;
    };
    beds: {
      type: string;
      size: string;
      count: number;
    }[];
    views: string[];
    amenities: string[];
    accessibility?: string[];
    location?: string[];
  }[];
}

// Disney-specific search parameters
export interface DisneyHotelSearchParams {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childrenAges?: number[];
  rooms?: number;
  rateClass?: keyof typeof RATE_CLASSES;
  packaging?: boolean;
  paymentType?: keyof typeof PAYMENT_TYPES;
  roomPreferences?: (keyof typeof ROOM_PREFERENCES)[];
  guestPreferences?: (keyof typeof GUEST_PREFERENCES)[];
  minCategory?: string;
  maxCategory?: string;
  minRate?: number;
  maxRate?: number;
  minStay?: number;
  maxStay?: number;
  includeHotelFacilities?: boolean;
  includeRoomFacilities?: boolean;
}

export interface DisneyRoomAvailabilityParams {
  hotelCode: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  childrenAges?: number[];
  rateClass?: keyof typeof RATE_CLASSES;
  packaging?: boolean;
  paymentType?: keyof typeof PAYMENT_TYPES;
  boards?: (keyof typeof BOARD_TYPES)[];
  roomTypes?: string[];
  roomPreferences?: (keyof typeof ROOM_PREFERENCES)[];
  guestPreferences?: (keyof typeof GUEST_PREFERENCES)[];
  upgradeAllowed?: boolean;
  shiftDays?: number;
}

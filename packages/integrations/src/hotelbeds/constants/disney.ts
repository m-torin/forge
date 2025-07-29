// Disney-specific constants for enhanced booking functionality

export const RATE_CLASSES = {
  STANDARD: 'Standard Rate',
  FLORIDA_RESIDENT: 'Florida Resident Rate',
  ANNUAL_PASSHOLDER: 'Annual Passholder Rate',
  MILITARY: 'Military Rate',
} as const;

export const PAYMENT_TYPES = {
  AT_WEB: 'Pay Now',
  AT_HOTEL: 'Pay at Hotel',
  DEPOSIT: 'Pay Deposit',
  INSTALLMENT: 'Payment Plan',
} as const;

export const BOARD_TYPES = {
  ROOM_ONLY: 'Room Only',
  QUICK_SERVICE: 'Quick Service Dining',
  DISNEY_DINING: 'Disney Dining Plan',
  DELUXE_DINING: 'Deluxe Dining Plan',
} as const;

export const ROOM_PREFERENCES = {
  CONNECTING: 'Connecting Rooms',
  HIGH_FLOOR: 'High Floor',
  LOW_FLOOR: 'Low Floor',
  NEAR_ELEVATOR: 'Near Elevator',
  AWAY_ELEVATOR: 'Away from Elevator',
  NEAR_POOL: 'Near Pool',
  NEAR_TRANSPORTATION: 'Near Transportation',
} as const;

export const GUEST_PREFERENCES = {
  ACCESSIBILITY: 'Accessibility Features',
  MOBILITY_ASSISTANCE: 'Mobility Assistance',
  HEARING_ACCESSIBLE: 'Hearing Accessible',
  VISUAL_ACCESSIBLE: 'Visual Accessible',
  SERVICE_ANIMAL: 'Service Animal Accommodation',
} as const;

export const SPECIAL_EVENTS = {
  MICKEYS_NOT_SO_SCARY: "Mickey's Not-So-Scary Halloween Party",
  MICKEYS_VERY_MERRY: "Mickey's Very Merry Christmas Party",
  AFTER_HOURS: 'Disney After Hours',
  EARLY_MORNING_MAGIC: 'Early Morning Magic',
  DESSERT_PARTY: 'Fireworks Dessert Party',
} as const;

export const DISNEY_FASTPASS_ATTRACTIONS = {
  MAGIC_KINGDOM: {
    SEVEN_DWARFS: 'Seven Dwarfs Mine Train',
    SPACE_MOUNTAIN: 'Space Mountain',
    BIG_THUNDER: 'Big Thunder Mountain Railroad',
  },
  EPCOT: {
    TEST_TRACK: 'Test Track',
    SOARIN: 'Soarin Around the World',
    FROZEN: 'Frozen Ever After',
  },
  HOLLYWOOD_STUDIOS: {
    SLINKY_DOG: 'Slinky Dog Dash',
    RISE_RESISTANCE: 'Rise of the Resistance',
    RUNAWAY_RAILWAY: "Mickey & Minnie's Runaway Railway",
  },
  ANIMAL_KINGDOM: {
    FLIGHT_PASSAGE: 'Flight of Passage',
    EVEREST: 'Expedition Everest',
    SAFARI: 'Kilimanjaro Safaris',
  },
} as const;

export const DISNEY_CELEBRATION_PACKAGES = {
  BIRTHDAY: 'Birthday Celebration',
  ANNIVERSARY: 'Anniversary Celebration',
  HONEYMOON: 'Honeymoon Celebration',
  GRADUATION: 'Graduation Celebration',
  FIRST_VISIT: 'First Visit Celebration',
} as const;

export const DISNEY_DINING_TYPES = {
  CHARACTER: 'Character Dining',
  SIGNATURE: 'Signature Dining',
  TABLE_SERVICE: 'Table Service',
  QUICK_SERVICE: 'Quick Service',
  LOUNGE: 'Lounge',
} as const;

export const DISNEY_MEAL_PERIODS = {
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  DINNER: 'Dinner',
  BRUNCH: 'Brunch',
  SNACK: 'Snack',
} as const;

export const DISNEY_TRANSPORTATION = {
  MONORAIL: 'Monorail',
  BUS: 'Bus',
  BOAT: 'Boat',
  SKYLINER: 'Disney Skyliner',
  WALKING: 'Walking Path',
} as const;

export const MEMORY_MAKER = {
  ADVANCE_PURCHASE: 'Advance Purchase Memory Maker',
  REGULAR: 'Regular Memory Maker',
  ONE_DAY: 'One Day Memory Maker',
} as const;

export const TICKET_TYPES = {
  BASE: 'Base Ticket',
  PARK_HOPPER: 'Park Hopper',
  PARK_HOPPER_PLUS: 'Park Hopper Plus',
  WATER_PARKS: 'Water Parks & Sports',
} as const;

export const DINING_PLANS = {
  QUICK_SERVICE: 'Quick Service Dining',
  DISNEY_DINING: 'Disney Dining Plan',
  DELUXE_DINING: 'Deluxe Dining Plan',
} as const;

// Disney Theme Parks
export const DISNEY_PARKS = {
  MAGIC_KINGDOM: {
    code: 'MK',
    name: 'Magic Kingdom',
    description: 'The most magical place on earth',
  },
  EPCOT: {
    code: 'EP',
    name: 'EPCOT',
    description: 'Discover the future today',
  },
  HOLLYWOOD_STUDIOS: {
    code: 'HS',
    name: 'Hollywood Studios',
    description: 'Lights, camera, action!',
  },
  ANIMAL_KINGDOM: {
    code: 'AK',
    name: 'Animal Kingdom',
    description: 'Adventure awaits',
  },
} as const;

// Disney Water Parks
export const DISNEY_WATER_PARKS = {
  TYPHOON_LAGOON: {
    code: 'TL',
    name: 'Typhoon Lagoon',
    description: 'Surf, swim, and splash',
  },
  BLIZZARD_BEACH: {
    code: 'BB',
    name: 'Blizzard Beach',
    description: 'Ski resort turned water park',
  },
} as const;

// Disney Resort Categories
export const DISNEY_RESORT_CATEGORIES = {
  VALUE: {
    code: 'VALUE',
    name: 'Value Resort',
    description: 'Affordable Disney magic',
  },
  MODERATE: {
    code: 'MODERATE',
    name: 'Moderate Resort',
    description: 'Comfort and convenience',
  },
  DELUXE: {
    code: 'DELUXE',
    name: 'Deluxe Resort',
    description: 'Premium Disney experience',
  },
  DELUXE_VILLA: {
    code: 'DELUXE_VILLA',
    name: 'Deluxe Villa Resort',
    description: 'Spacious accommodations',
  },
} as const;

// Disney Dining Plan Credits
export const DINING_PLAN_CREDITS = {
  QUICK_SERVICE: {
    name: 'Quick Service Dining Plan',
    credits: {
      quickService: 2,
      snack: 2,
      refillableMug: true,
    },
  },
  DISNEY_DINING: {
    name: 'Disney Dining Plan',
    credits: {
      tableService: 1,
      quickService: 1,
      snack: 2,
      refillableMug: true,
    },
  },
  DELUXE_DINING: {
    name: 'Deluxe Dining Plan',
    credits: {
      tableService: 3,
      snack: 2,
      refillableMug: true,
    },
  },
} as const;

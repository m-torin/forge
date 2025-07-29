import { faker } from '@faker-js/faker';
import { type Prisma } from '../../../../../prisma-generated/client';

export function generateUser(): Prisma.UserCreateInput {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = faker.internet.email({ firstName, lastName }).toLowerCase();

  return {
    id: crypto.randomUUID(),
    email,
    name: `${firstName} ${lastName}`,
    emailVerified: faker.datatype.boolean({ probability: 0.8 }), // 80% verified
    image: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.3 }), // 30% have avatars
    bio: faker.helpers.maybe(() => faker.person.bio(), { probability: 0.2 }), // 20% have bios
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: new Date(),
  };
}

export function generateUserAddress(userId: string): Prisma.AddressCreateInput {
  return {
    type: faker.helpers.arrayElement(['SHIPPING', 'BILLING', 'BOTH']),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.helpers.maybe(() => faker.company.name(), { probability: 0.2 }),
    street1: faker.location.streetAddress(),
    street2: faker.helpers.maybe(() => faker.location.secondaryAddress(), { probability: 0.3 }),
    city: faker.location.city(),
    state: faker.location.state(),
    country: 'United States',
    postalCode: faker.location.zipCode(),
    phone: faker.phone.number(),
    isDefault: faker.datatype.boolean({ probability: 0.3 }),
    user: { connect: { id: userId } },
  };
}

export function generateCustomerProfile(_user: any): Record<string, any> {
  return {
    loyaltyPoints: faker.number.int({ min: 0, max: 5000 }),
    tier: faker.helpers.arrayElement(['Bronze', 'Silver', 'Gold', 'Platinum']),
    preferences: {
      newsletter: faker.datatype.boolean({ probability: 0.6 }),
      smsAlerts: faker.datatype.boolean({ probability: 0.3 }),
      productRecommendations: faker.datatype.boolean({ probability: 0.7 }),
    },
    stats: {
      totalOrders: faker.number.int({ min: 0, max: 50 }),
      totalSpent: faker.number.float({ min: 0, max: 10000, multipleOf: 0.01 }),
      averageOrderValue: faker.number.float({ min: 50, max: 300, multipleOf: 0.01 }),
      lastOrderDate: faker.date.recent({ days: 180 }),
    },
  };
}

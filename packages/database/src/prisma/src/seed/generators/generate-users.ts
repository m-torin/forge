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

import { faker } from '@faker-js/faker';
import { type Prisma, ReviewType, VoteType } from '../../../../../prisma-generated/client';

// Review templates for more realistic content
const reviewTemplates = {
  positive: [
    'I absolutely love this {product}! The quality is amazing and it fits perfectly.',
    'Exceeded my expectations! The {material} is so soft and comfortable.',
    "Best purchase I've made in a while. The {product} looks even better in person.",
    'Great value for money. The craftsmanship is excellent and it arrived quickly.',
    "Couldn't be happier with this {product}. It's exactly what I was looking for.",
  ],
  neutral: [
    "The {product} is okay. It's decent quality but nothing special.",
    "It's fine for the price. The {material} is average quality.",
    'Not bad, but not great either. It serves its purpose.',
    'The {product} is as described. No surprises, good or bad.',
    "It's alright. I've seen better but also worse at this price point.",
  ],
  negative: [
    'Disappointed with the quality. The {material} feels cheap.',
    "Not worth the price. The {product} doesn't look like the photos.",
    'Had issues with the sizing. It runs much smaller than expected.',
    'The {product} started showing wear after just a few uses.',
    'Expected better quality for this price. Would not recommend.',
  ],
};

// Review titles by rating
const reviewTitles = {
  5: ['Amazing!', 'Love it!', 'Perfect!', 'Highly recommend!', 'Exceeded expectations!'],
  4: ['Great product', 'Very happy', 'Good quality', 'Nice purchase', 'Would buy again'],
  3: ["It's okay", 'Average', 'Decent', 'Not bad', 'As expected'],
  2: ['Disappointed', 'Not great', 'Below average', 'Expected better', 'Meh'],
  1: ['Terrible', 'Waste of money', 'Do not buy', 'Very disappointed', 'Poor quality'],
};

export function generateReview(
  productId: string,
  userId: string,
  productName: string,
  productAttributes: any,
): Prisma.ReviewCreateInput {
  const rating = generateWeightedRating();
  const template = getReviewTemplate(rating);
  const content = template
    .replace('{product}', productName.toLowerCase())
    .replace('{material}', productAttributes?.material || 'material');

  return {
    type: ReviewType.DEDICATED,
    rating,
    title: faker.helpers.arrayElement(reviewTitles[rating as keyof typeof reviewTitles]),
    content: expandReviewContent(content, rating),
    verified: faker.datatype.boolean({ probability: 0.7 }), // 70% verified purchases
    source: faker.helpers.maybe(() => 'imported', { probability: 0.1 }), // 10% imported
    helpfulCount: 0, // Will be updated when votes are added
    totalVotes: 0,
    product: { connect: { id: productId } },
    user: { connect: { id: userId } },
  };
}

function generateWeightedRating(): number {
  // Weighted towards positive reviews (realistic for e-commerce)
  const weights = {
    5: 0.45, // 45% chance
    4: 0.3, // 30% chance
    3: 0.15, // 15% chance
    2: 0.07, // 7% chance
    1: 0.03, // 3% chance
  };

  const random = Math.random();
  let cumulative = 0;

  for (const [rating, weight] of Object.entries(weights)) {
    cumulative += weight;
    if (random <= cumulative) {
      return parseInt(rating);
    }
  }

  return 5; // Default to 5 if something goes wrong
}

function getReviewTemplate(rating: number): string {
  if (rating >= 4) {
    return faker.helpers.arrayElement(reviewTemplates.positive);
  } else if (rating === 3) {
    return faker.helpers.arrayElement(reviewTemplates.neutral);
  } else {
    return faker.helpers.arrayElement(reviewTemplates.negative);
  }
}

function expandReviewContent(baseContent: string, rating: number): string {
  let expanded = baseContent;

  // Add details based on rating
  if (rating >= 4) {
    const positiveDetails = [
      ' The packaging was also very nice.',
      " I've received so many compliments!",
      ' Will definitely order more colors.',
      ' The customer service was excellent too.',
      ' Shipping was faster than expected.',
    ];
    expanded += faker.helpers.arrayElement(positiveDetails);
  } else if (rating <= 2) {
    const negativeDetails = [
      " I've contacted customer service but no response yet.",
      ' The return process is complicated.',
      ' Photos are misleading.',
      ' Save your money and look elsewhere.',
      ' Very frustrating experience.',
    ];
    expanded += faker.helpers.arrayElement(negativeDetails);
  }

  // Sometimes add specific details
  if (faker.datatype.boolean({ probability: 0.4 })) {
    const specifics = [
      " I'm 5'6\" and ordered a medium - it fits perfectly.",
      ' The color is exactly as shown in the pictures.',
      " I've washed it several times and it still looks great.",
      ' Note that it runs a bit large/small.',
      ' The fabric has a nice weight to it.',
    ];
    expanded += faker.helpers.arrayElement(specifics);
  }

  return expanded;
}

export function generateReviewVotes(
  reviewId: string,
  userIds: string[],
  rating: number,
): Prisma.ReviewVoteJoinCreateManyInput[] {
  // Higher rated reviews get more votes and more helpful votes
  const voteCount = faker.number.int({
    min: rating >= 4 ? 5 : 0,
    max: rating >= 4 ? 20 : 10,
  });

  const helpfulProbability = rating >= 4 ? 0.8 : 0.4;
  const voters = faker.helpers.arrayElements(userIds, {
    min: 0,
    max: Math.min(voteCount, userIds.length),
  });

  return voters.map(userId => ({
    voteType: faker.datatype.boolean({ probability: helpfulProbability })
      ? VoteType.HELPFUL
      : VoteType.NOT_HELPFUL,
    userId,
    reviewId,
  }));
}

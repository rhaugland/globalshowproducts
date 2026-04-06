export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1-5
  title: string;
  body: string;
  date: string;
}

const firstNames = ['Sarah', 'Mike', 'Jessica', 'David', 'Emily', 'Chris', 'Amanda', 'James', 'Ashley', 'Ryan', 'Megan', 'Tyler', 'Lauren', 'Brandon', 'Nicole'];
const lastInitials = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const titles = [
  'Love it!', 'Great product', 'Exactly what I needed', 'Good quality', 'Kids love this',
  'Perfect gift', 'Highly recommend', 'Better than expected', 'Very happy', 'Solid purchase',
  'Fun for the whole family', 'Great value', 'Would buy again', 'Nice quality', 'Awesome!',
];
const bodies = [
  'Really impressed with the quality. Shipped fast and looks great.',
  'Bought this as a gift and it was a huge hit. Will definitely order more.',
  'Good value for the price. Works exactly as described.',
  'My kids absolutely love this. We use it every day.',
  'The quality exceeded my expectations. Very well made.',
  'Easy to use and looks great. Happy with my purchase.',
  'Arrived quickly and in perfect condition. Highly recommend this seller.',
  'Great product for the price point. Would recommend to friends.',
  'Exactly as pictured. No complaints at all.',
  'Wonderful addition to our home. Gets lots of compliments.',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generateReviews(productId: string): Review[] {
  const seed = productId.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);
  const count = Math.floor(rand() * 6) + 2; // 2-7 reviews per product
  const reviews: Review[] = [];

  for (let i = 0; i < count; i++) {
    const r = rand();
    // Weight towards higher ratings: 60% chance of 5, 25% chance of 4, 10% chance of 3, 5% chance of 2
    const rating = r < 0.05 ? 2 : r < 0.15 ? 3 : r < 0.4 ? 4 : 5;
    const daysAgo = Math.floor(rand() * 180) + 1;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    reviews.push({
      id: `${productId}_r${i}`,
      productId,
      author: `${firstNames[Math.floor(rand() * firstNames.length)]} ${lastInitials[Math.floor(rand() * lastInitials.length)]}.`,
      rating,
      title: titles[Math.floor(rand() * titles.length)],
      body: bodies[Math.floor(rand() * bodies.length)],
      date: date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
    });
  }

  return reviews;
}

const reviewCache = new Map<string, Review[]>();

export function getReviewsForProduct(productId: string): Review[] {
  if (!reviewCache.has(productId)) {
    reviewCache.set(productId, generateReviews(productId));
  }
  return reviewCache.get(productId)!;
}

export function getAverageRating(productId: string): number {
  const reviews = getReviewsForProduct(productId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

export function getReviewCount(productId: string): number {
  return getReviewsForProduct(productId).length;
}

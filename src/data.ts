export * from './types';
import { Creator, Job, Order } from './types';

export const CREATORS: Creator[] = [
  { id: 'c1', name: 'Ananya Rao', city: 'Bengaluru', cat: 'Beauty', followers: '48.2k', platform: 'Instagram', rating: 4.9, price: 8000, badge: 'Top creator', bio: 'Skincare & makeup storyteller. Honest reviews, clean visuals, strong saves.', reach: '540k', eng: '4.9%', delivered: 64, photo: require('./assets/creators/ananya.jpg'), portfolioPreview: require('./assets/portfolio/beauty.jpg') },
  { id: 'c2', name: 'Rohan Mehta', city: 'Mumbai', cat: 'Tech', followers: '210k', platform: 'YouTube', rating: 5.0, price: 12500, badge: 'Responds fast', bio: 'Gadget unboxings and quick explainers for everyday buyers.', reach: '1.1M', eng: '5.2%', delivered: 91, photo: require('./assets/creators/rohan.jpg'), portfolioPreview: require('./assets/portfolio/tech.jpg') },
  { id: 'c3', name: 'Meera Iyer', city: 'Chennai', cat: 'Lifestyle', followers: '31.7k', platform: 'Instagram', rating: 4.8, price: 6500, bio: 'Slow-living, travel and home. Warm, aesthetic UGC.', reach: '310k', eng: '4.2%', delivered: 37, photo: require('./assets/creators/meera.jpg'), portfolioPreview: require('./assets/portfolio/lifestyle.jpg') },
  { id: 'c4', name: 'Kabir Singh', city: 'Delhi', cat: 'Fitness', followers: '76.4k', platform: 'Instagram', rating: 4.9, price: 9000, badge: 'Responds fast', bio: 'Fitness coach making training and nutrition simple.', reach: '488k', eng: '5.4%', delivered: 52, photo: require('./assets/creators/kabir.jpg'), portfolioPreview: require('./assets/portfolio/fitness.jpg') },
  { id: 'c5', name: 'Sana Qureshi', city: 'Hyderabad', cat: 'Fashion', followers: '58.9k', platform: 'Instagram', rating: 4.8, price: 7200, bio: 'Modest wear and festive fashion lookbooks.', reach: '402k', eng: '4.6%', delivered: 44, photo: require('./assets/creators/sana.jpg'), portfolioPreview: require('./assets/portfolio/fashion.jpg') },
  { id: 'c6', name: 'Priya Nair', city: 'Kochi', cat: 'Food', followers: '22.3k', platform: 'Instagram', rating: 4.9, price: 5500, bio: 'Home cooking, festive food gifting and quick recipes.', reach: '612k', eng: '6.1%', delivered: 29, photo: require('./assets/creators/priya.jpg'), portfolioPreview: require('./assets/portfolio/food.jpg') },
  { id: 'c7', name: 'Arjun Das', city: 'Pune', cat: 'Comedy', followers: '402k', platform: 'YouTube', rating: 4.7, price: 15000, bio: 'Sketch comedy with big, loyal audiences.', reach: '2.0M', eng: '3.9%', delivered: 58, photo: require('./assets/creators/arjun.jpg'), portfolioPreview: require('./assets/portfolio/comedy.jpg') },
  { id: 'c8', name: 'Ishita Kapoor', city: 'Jaipur', cat: 'Beauty', followers: '95.1k', platform: 'Instagram', rating: 4.8, price: 10000, bio: 'Makeup tutorials and product deep-dives.', reach: '720k', eng: '4.4%', delivered: 70, photo: require('./assets/creators/ishita.jpg'), portfolioPreview: require('./assets/portfolio/beauty-products.jpg') },
];

export const creatorById = (id: string) => CREATORS.find((c) => c.id === id) || CREATORS[0];
export const creatorByName = (n: string) => CREATORS.find((c) => c.name === n);

export const JOBS: Job[] = [
  {
    id: 'j1', title: 'Festive snack hamper launch', platform: 'Instagram', deliverables: '1 Reel + 2 Stories',
    min: 5000, max: 15000, status: 'open', bidsCount: 12, closes: 'Closes in 2 days', bidders: ['c1', 'c6', 'c8', 'c3'],
    category: 'Food', city: 'Mumbai',
    bids: [
      { id: 'b1', creatorId: 'c1', price: 11000, note: 'Reel + 2 stories. I’ll tag your page and pin the Reel for a week.' },
      { id: 'b2', creatorId: 'c6', price: 9500, note: 'Can shoot at home with diyas and rangoli — very on-brand for food gifting.' },
      { id: 'b3', creatorId: 'c8', price: 12000, note: 'Cinematic unboxing with a festive makeup-look tie-in.' },
    ],
  },
  {
    id: 'j2', title: 'Nimbu masala soda — summer UGC', platform: 'UGC', deliverables: '3 short videos',
    min: 3000, max: 8000, status: 'open', bidsCount: 7, closes: 'Closes in 5 days', bidders: ['c3', 'c5', 'c4'],
    category: 'Food', city: 'Mumbai',
    bids: [
      { id: 'b4', creatorId: 'c3', price: 6500, note: 'Three 20-sec clips in natural light, with a refreshing summer hook.' },
      { id: 'b5', creatorId: 'c5', price: 7000, note: 'Street-style serve and taste reactions, ready for ads.' },
    ],
  },
  {
    id: 'j3', title: 'Diwali gift box unboxing', platform: 'YouTube', deliverables: '1 Short + post',
    min: 10000, max: 25000, status: 'progress', bidsCount: 12, closes: '', bidders: ['c6'], hired: 'c6', escrow: 12000, bids: [],
  },
  {
    id: 'j4', title: 'Monsoon chai Reel', platform: 'Instagram', deliverables: '1 Reel',
    min: 6000, max: 10000, status: 'completed', bidsCount: 9, closes: '', bidders: ['c4'], hired: 'c4', bids: [],
  },
  {
    id: 'j5', title: 'Festive hamper Reel', platform: 'Instagram', deliverables: '1 Reel + 3 Stories',
    min: 7000, max: 12000, status: 'completed', bidsCount: 11, closes: '', bidders: ['c1'], hired: 'c1', bids: [],
  },
];

export const ORDERS: Order[] = [
  { id: 'o1', code: '#XX-2041', title: 'Diwali gift box unboxing', kind: 'Instagram Reel', creatorId: 'c6', stage: 'delivered', held: 13238, fee: 12500, platformFee: 625, gst: 113, paidOn: '21 Oct', draftDue: '25 Oct', deliveredOn: '23 Oct' },
  { id: 'o2', code: '#XX-2037', title: 'Nimbu masala soda — UGC', kind: 'UGC · 3 videos', creatorId: 'c3', stage: 'working', held: 6500, fee: 6190, platformFee: 310, gst: 56, paidOn: '24 Oct', draftDue: '30 Oct', deliveredOn: '' },
  { id: 'o3', code: '#XX-2029', title: 'Festive hamper Reel', kind: 'Instagram Reel', creatorId: 'c1', stage: 'released', held: 3762, fee: 3583, platformFee: 179, gst: 32, paidOn: '9 Oct', draftDue: '15 Oct', deliveredOn: '14 Oct' },
];

export const LISTS = [
  { id: 'l1', name: 'Diwali campaign shortlist', count: 8, updated: 'Updated 2 days ago' },
  { id: 'l2', name: 'Beauty micro-creators', count: 12, updated: 'Updated 5 days ago' },
  { id: 'l3', name: 'Bengaluru food creators', count: 5, updated: 'Updated 1 week ago' },
  { id: 'l4', name: 'UGC for summer ads', count: 6, updated: 'Updated 2 weeks ago' },
];

export const CATEGORIES = ['Beauty', 'Fashion', 'Food', 'Tech', 'Fitness', 'Lifestyle', 'Travel', 'UGC', 'Comedy', 'Gaming'];
export const PLATFORMS = ['Instagram', 'YouTube', 'UGC'];

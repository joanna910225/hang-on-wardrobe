import { colors } from './theme';
import { WardrobeItem } from './types';

const starterBasics: Omit<WardrobeItem, 'subcategory' | 'styleTags' | 'seasonTags' | 'occasionTags' | 'favoriteScore' | 'createdAt' | 'updatedAt'>[] = [
  { id: 'white-shirt', name: 'Relaxed shirt', category: 'Tops', emoji: '👔', background: '#E7E8E2', colorName: 'White' },
  { id: 'navy-knit', name: 'Navy knit', category: 'Tops', emoji: '🧶', background: '#CCD1DF', colorName: 'Navy' },
  { id: 'stripe-tee', name: 'Stripe tee', category: 'Tops', emoji: '👕', background: '#E5DED0', colorName: 'Cream' },
  { id: 'grey-cardigan', name: 'Soft cardigan', category: 'Tops', emoji: '🧥', background: '#D5D2D0', colorName: 'Grey' },
  { id: 'blue-jeans', name: 'Straight jeans', category: 'Bottoms', emoji: '👖', background: '#B7CCE0', colorName: 'Mid blue' },
  { id: 'black-trousers', name: 'Wide trousers', category: 'Bottoms', emoji: '👖', background: '#C5C4C0', colorName: 'Black' },
  { id: 'cream-skirt', name: 'Bias skirt', category: 'Bottoms', emoji: '🩱', background: '#E9DFCF', colorName: 'Oat' },
  { id: 'black-coat', name: 'Long wool coat', category: 'Outerwear', emoji: '🧥', background: '#C9C5C1', colorName: 'Black' },
  { id: 'grey-blazer', name: 'Soft blazer', category: 'Outerwear', emoji: '🥼', background: '#D9D5CC', colorName: 'Charcoal' },
  { id: 'loafers', name: 'Leather loafers', category: 'Shoes', emoji: '👞', background: '#D4BCAA', colorName: 'Chocolate' },
  { id: 'sneakers', name: 'Everyday trainers', category: 'Shoes', emoji: '👟', background: '#E8E5DB', colorName: 'White' },
  { id: 'tote', name: 'Work tote', category: 'Bags', emoji: '👜', background: '#C9AA91', colorName: 'Tan' },
];

export const starterWardrobe: WardrobeItem[] = starterBasics.map((item, index) => ({
  ...item,
  subcategory: '',
  styleTags: index % 3 === 0 ? ['Minimal', 'Classic'] : ['Everyday'],
  seasonTags: ['Spring', 'Autumn'],
  occasionTags: item.category === 'Shoes' ? ['Everyday', 'Work'] : ['Everyday'],
  favoriteScore: 4,
  createdAt: new Date(2026, 0, index + 1).toISOString(),
  updatedAt: new Date(2026, 0, index + 1).toISOString(),
}));

export const categoryGoals = [
  { label: 'Tops', current: 4, target: 4, color: colors.lime },
  { label: 'Bottoms', current: 3, target: 3, color: colors.sky },
  { label: 'Shoes', current: 2, target: 2, color: colors.butter },
  { label: 'Outerwear', current: 2, target: 2, color: colors.lilac },
];

export const candidate = {
  name: 'Cocoa suede jacket',
  emoji: '🧥',
  background: '#C79A76',
};

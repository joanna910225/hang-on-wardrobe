import assert from 'node:assert/strict';
import test from 'node:test';
import { ClothingAnalysis } from '../../src/types';
import { scoreMatch } from './scoring';

const analysis: ClothingAnalysis = {
  suggestedName: 'Cocoa suede jacket',
  category: 'Outerwear',
  subcategory: 'Jacket',
  primaryColor: 'Brown',
  secondaryColors: [],
  colorFamily: 'earth tone',
  pattern: 'solid',
  material: 'suede',
  silhouette: 'relaxed cropped',
  formality: 'smart-casual',
  styleTags: ['Classic', 'Relaxed'],
  seasonTags: ['Autumn', 'Spring'],
  occasionTags: ['Everyday', 'Work', 'Weekend'],
  warmth: 'midweight',
  distinctiveness: 0.72,
  confidence: 0.92,
  imageQuality: 'high',
  uncertainties: [],
};

const wardrobe = [
  { id: 'top-1', name: 'White shirt', category: 'Tops' as const, colorName: 'White', subcategory: 'Shirt', styleTags: ['Classic'], seasonTags: ['Spring'], occasionTags: ['Work'], favoriteScore: 5 },
  { id: 'top-2', name: 'Navy knit', category: 'Tops' as const, colorName: 'Navy', subcategory: 'Knit', styleTags: ['Classic'], seasonTags: ['Autumn'], occasionTags: ['Everyday'], favoriteScore: 4 },
  { id: 'bottom-1', name: 'Blue jeans', category: 'Bottoms' as const, colorName: 'Blue', subcategory: 'Jeans', styleTags: ['Relaxed'], seasonTags: ['Spring'], occasionTags: ['Weekend'], favoriteScore: 4 },
  { id: 'bottom-2', name: 'Black trousers', category: 'Bottoms' as const, colorName: 'Black', subcategory: 'Trousers', styleTags: ['Classic'], seasonTags: ['Autumn'], occasionTags: ['Work'], favoriteScore: 5 },
  { id: 'shoe-1', name: 'Brown loafers', category: 'Shoes' as const, colorName: 'Brown', subcategory: 'Loafers', styleTags: ['Classic'], seasonTags: ['Spring'], occasionTags: ['Work'], favoriteScore: 4 },
];

test('scores an easy-to-style new layer as a useful fit', () => {
  const result = scoreMatch({ analysis, candidateName: 'New find', categoryHint: 'Outerwear', liking: 4, wardrobe });
  assert.equal(result.candidateName, 'Cocoa suede jacket');
  assert.equal(result.candidateCategory, 'Outerwear');
  assert.ok(result.score >= 70);
  assert.ok(result.outfitCount >= 2);
  assert.ok(result.colorScore >= 4);
  assert.equal(result.overlapCount, 0);
  assert.equal(result.reasons.length, 3);
});

test('penalizes a close duplicate and names it in the reason', () => {
  const result = scoreMatch({
    analysis,
    candidateName: 'Brown jacket',
    categoryHint: 'Outerwear',
    liking: 3,
    wardrobe: [
      ...wardrobe,
      { id: 'coat', name: 'Brown weekend jacket', category: 'Outerwear', colorName: 'Brown', subcategory: 'Jacket', styleTags: ['Classic', 'Relaxed'], seasonTags: ['Autumn'], occasionTags: ['Weekend'], favoriteScore: 4 },
    ],
  });
  assert.equal(result.overlapCount, 1);
  assert.ok(result.reasons.some((reason) => reason.text.includes('Brown weekend jacket')));
});

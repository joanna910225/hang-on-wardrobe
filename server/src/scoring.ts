import { ClothingAnalysis, MatchReason, RemoteMatchResult, WardrobeCategory } from '../../src/types';
import { WardrobeSnapshotItem } from './contracts';

type ScoreInput = {
  analysis: ClothingAnalysis;
  candidateName: string;
  categoryHint: WardrobeCategory;
  liking: number;
  wardrobe: WardrobeSnapshotItem[];
};

const neutralColors = new Set([
  'black', 'white', 'cream', 'ivory', 'beige', 'tan', 'brown', 'grey', 'gray', 'navy', 'charcoal', 'oat', 'khaki',
]);

const colorNeighbors: Record<string, string[]> = {
  red: ['pink', 'orange', 'brown', 'burgundy'],
  orange: ['red', 'yellow', 'brown', 'tan'],
  yellow: ['orange', 'green', 'cream', 'brown'],
  green: ['yellow', 'blue', 'teal', 'brown'],
  blue: ['green', 'purple', 'navy', 'teal'],
  purple: ['blue', 'pink', 'burgundy'],
  pink: ['red', 'purple', 'cream', 'brown'],
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includesToken(value: string, token: string) {
  const normalized = normalize(value);
  return normalized === token || normalized.includes(token);
}

function colorCompatible(candidate: string, existing: string) {
  const a = normalize(candidate);
  const b = normalize(existing);
  if (!a || !b || a === 'unknown' || b === 'not set') return 0.55;
  if (a === b || includesToken(a, b) || includesToken(b, a)) return 1;
  if ([...neutralColors].some((color) => includesToken(a, color))) return 0.9;
  if ([...neutralColors].some((color) => includesToken(b, color))) return 0.9;
  const aFamily = Object.keys(colorNeighbors).find((color) => includesToken(a, color));
  const bFamily = Object.keys(colorNeighbors).find((color) => includesToken(b, color));
  if (aFamily && bFamily && colorNeighbors[aFamily]?.includes(bFamily)) return 0.78;
  return 0.48;
}

function overlapRatio(left: string[], right: string[]) {
  const a = new Set(left.map(normalize));
  const b = new Set(right.map(normalize));
  if (a.size === 0 || b.size === 0) return 0.5;
  const matches = [...a].filter((tag) => b.has(tag)).length;
  return matches / Math.max(1, Math.min(a.size, b.size));
}

function outfitPotential(category: WardrobeCategory, wardrobe: WardrobeSnapshotItem[]) {
  const count = (target: WardrobeCategory) => wardrobe.filter((item) => item.category === target).length;
  const tops = count('Tops');
  const bottoms = count('Bottoms');
  const shoes = count('Shoes');
  const outerwear = count('Outerwear');

  if (category === 'Tops') return Math.min(12, bottoms * Math.max(shoes, 1));
  if (category === 'Bottoms') return Math.min(12, tops * Math.max(shoes, 1));
  if (category === 'Shoes') return Math.min(12, tops * Math.max(bottoms, 1));
  if (category === 'Outerwear') return Math.min(12, tops * Math.max(bottoms, 1) * Math.max(shoes, 1));
  return Math.min(12, Math.max(2, tops + bottoms));
}

function verdictFor(score: number, overlapCount: number) {
  if (score >= 82 && overlapCount === 0) return 'It slips naturally into your wardrobe.';
  if (score >= 76) return 'It fits in—with one small caveat.';
  if (score >= 64) return 'It can work, but it needs a little intention.';
  return 'The wardrobe fit is lower, so it may be worth another thought.';
}

export function scoreMatch(input: ScoreInput): RemoteMatchResult {
  const category = input.analysis.confidence >= 0.55 ? input.analysis.category : input.categoryHint;
  const outfitCount = outfitPotential(category, input.wardrobe);
  const outfitScore = clamp((outfitCount / 8) * 100, 25, 100);

  const relevantColors = input.wardrobe
    .filter((item) => item.category !== category || category === 'Outerwear' || category === 'Bags')
    .map((item) => colorCompatible(input.analysis.primaryColor, item.colorName));
  const colorHarmony = relevantColors.length
    ? relevantColors.reduce((sum, value) => sum + value, 0) / relevantColors.length
    : 0.65;
  const colorScore = clamp(Math.round(colorHarmony * 5), 1, 5);

  const relevantItems = input.wardrobe.filter((item) => item.category !== 'Bags');
  const styleHarmony = relevantItems.length
    ? relevantItems.reduce((sum, item) => sum + overlapRatio(input.analysis.styleTags, item.styleTags), 0) / relevantItems.length
    : 0.6;
  const lifestyleHarmony = relevantItems.length
    ? relevantItems.reduce((sum, item) => sum + overlapRatio(input.analysis.occasionTags, item.occasionTags), 0) / relevantItems.length
    : 0.6;

  const duplicates = input.wardrobe.filter((item) => {
    if (item.category !== category) return false;
    const sameType = normalize(item.subcategory) === normalize(input.analysis.subcategory) && normalize(item.subcategory) !== '';
    const sameColor = colorCompatible(input.analysis.primaryColor, item.colorName) >= 0.95;
    const similarStyle = overlapRatio(input.analysis.styleTags, item.styleTags) >= 0.65;
    return sameType || (sameColor && similarStyle);
  });
  const overlapCount = duplicates.length;
  const noveltyScore = clamp(100 - overlapCount * 28 + input.analysis.distinctiveness * 12, 20, 100);
  const likingScore = clamp(input.liking * 20, 20, 100);
  const score = Math.round(
    outfitScore * 0.35
    + colorHarmony * 100 * 0.2
    + styleHarmony * 100 * 0.15
    + noveltyScore * 0.15
    + likingScore * 0.15,
  );

  const reasons: MatchReason[] = [];
  reasons.push({
    kind: 'strength',
    text: `It can anchor about ${outfitCount} complete ${outfitCount === 1 ? 'look' : 'looks'} with your current rotation.`,
  });
  reasons.push({
    kind: colorScore >= 4 ? 'strength' : 'caveat',
    text: colorScore >= 4
      ? `Its ${input.analysis.primaryColor.toLowerCase()} color works easily with the palette you already wear.`
      : `Its ${input.analysis.primaryColor.toLowerCase()} color needs more deliberate pairing with your current palette.`,
  });
  if (overlapCount > 0) {
    reasons.push({
      kind: 'caveat',
      text: `${overlapCount} existing ${overlapCount === 1 ? 'piece covers' : 'pieces cover'} a similar role, including ${duplicates.slice(0, 2).map((item) => item.name).join(' and ')}.`,
    });
  } else {
    reasons.push({ kind: 'strength', text: 'It adds a meaningfully different role instead of duplicating a close substitute.' });
  }

  return {
    candidateName: input.candidateName.trim() && input.candidateName.trim().toLowerCase() !== 'new find'
      ? input.candidateName.trim()
      : input.analysis.suggestedName,
    candidateCategory: category,
    score: clamp(score, 0, 100),
    outfitCount,
    colorScore,
    styleScore: clamp(Math.round(styleHarmony * 100), 0, 100),
    lifestyleScore: clamp(Math.round(lifestyleHarmony * 100), 0, 100),
    overlapCount,
    verdict: verdictFor(score, overlapCount),
    reasons,
  };
}

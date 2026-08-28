import { candidate } from '../data';
import { AnalysisApiResponse, MatchCheck, MatchReason, WardrobeCategory, WardrobeItem } from '../types';

type CreateMatchInput = {
  id: string;
  name: string;
  imageUri?: string;
  category: WardrobeCategory;
  liking: number;
  wardrobe: WardrobeItem[];
};

const categoryEmoji: Record<WardrobeCategory, string> = {
  Tops: '👕',
  Bottoms: '👖',
  Outerwear: '🧥',
  Shoes: '👞',
  Bags: '👜',
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function createLocalMatch(input: CreateMatchInput): MatchCheck {
  const tops = input.wardrobe.filter((item) => item.category === 'Tops').length;
  const bottoms = input.wardrobe.filter((item) => item.category === 'Bottoms').length;
  const shoes = input.wardrobe.filter((item) => item.category === 'Shoes').length;
  const sameCategory = input.wardrobe.filter((item) => item.category === input.category).length;
  const baseCombinations = Math.max(1, Math.min(tops, 4) + Math.min(bottoms, 3) + Math.min(shoes, 2) - 2);
  const outfitCount = clamp(input.category === 'Shoes' ? baseCombinations - 1 : baseCombinations, 2, 9);
  const overlapCount = input.category === 'Outerwear' ? Math.max(0, sameCategory - 1) : Math.max(0, sameCategory - 3);
  const colorScore = clamp(3 + (input.liking >= 4 ? 1 : 0), 1, 5);
  const score = clamp(58 + outfitCount * 4 + input.liking * 2 - overlapCount * 5, 45, 94);
  const verdict = score >= 80
    ? 'It fits in—with one small caveat.'
    : score >= 68
      ? 'It can work, but it needs a little intention.'
      : 'The wardrobe fit is lower, so it may be worth another thought.';
  const reasons: MatchReason[] = [
    {
      kind: 'strength',
      text: `Your current rotation can support about ${outfitCount} complete ${outfitCount === 1 ? 'look' : 'looks'} with this piece.`,
    },
    {
      kind: colorScore >= 4 ? 'strength' : 'caveat',
      text: colorScore >= 4
        ? 'Your liking score and wardrobe palette make this a promising color direction.'
        : 'The color still needs a photo analysis before we can judge it confidently.',
    },
    overlapCount > 0
      ? { kind: 'caveat', text: `${overlapCount} existing ${overlapCount === 1 ? 'piece fills' : 'pieces fill'} a similar wardrobe role.` }
      : { kind: 'strength', text: 'It does not look overly repetitive at the category level.' },
  ];

  return {
    id: input.id,
    candidateName: input.name.trim() || candidate.name,
    candidateImageUri: input.imageUri,
    candidateCategory: input.category,
    candidateEmoji: categoryEmoji[input.category],
    candidateBackground: candidate.background,
    liking: input.liking,
    score,
    outfitCount,
    colorScore,
    overlapCount,
    verdict,
    reasons,
    analysisSource: 'local',
    addedToWardrobe: false,
    createdAt: new Date().toISOString(),
  };
}

export function createVisionMatch(
  id: string,
  imageUri: string,
  liking: number,
  response: AnalysisApiResponse,
): MatchCheck {
  return {
    id,
    candidateName: response.match.candidateName,
    candidateImageUri: imageUri,
    candidateCategory: response.match.candidateCategory,
    candidateEmoji: categoryEmoji[response.match.candidateCategory],
    candidateBackground: candidate.background,
    liking,
    score: response.match.score,
    outfitCount: response.match.outfitCount,
    colorScore: response.match.colorScore,
    overlapCount: response.match.overlapCount,
    verdict: response.match.verdict,
    reasons: response.match.reasons,
    analysisSource: 'vision',
    candidateAnalysis: response.analysis,
    addedToWardrobe: false,
    createdAt: new Date().toISOString(),
  };
}

export type WardrobeCategory = 'Tops' | 'Bottoms' | 'Outerwear' | 'Shoes' | 'Bags';

export type WardrobeItem = {
  id: string;
  name: string;
  category: WardrobeCategory;
  emoji: string;
  background: string;
  colorName: string;
  imageUri?: string;
  subcategory: string;
  styleTags: string[];
  seasonTags: string[];
  occasionTags: string[];
  favoriteScore: number;
  createdAt: string;
  updatedAt: string;
};

export type WardrobeItemDraft = Omit<WardrobeItem, 'id' | 'createdAt' | 'updatedAt'>;

export type ClothingAnalysis = {
  suggestedName: string;
  category: WardrobeCategory;
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  colorFamily: string;
  pattern: string;
  material: string;
  silhouette: string;
  formality: 'casual' | 'smart-casual' | 'formal' | 'sport';
  styleTags: string[];
  seasonTags: string[];
  occasionTags: string[];
  warmth: 'light' | 'midweight' | 'warm';
  distinctiveness: number;
  confidence: number;
  imageQuality: 'low' | 'medium' | 'high';
  uncertainties: string[];
};

export type MatchReason = {
  kind: 'strength' | 'caveat' | 'alternative';
  text: string;
};

export type RemoteMatchResult = {
  candidateName: string;
  candidateCategory: WardrobeCategory;
  score: number;
  outfitCount: number;
  colorScore: number;
  styleScore: number;
  lifestyleScore: number;
  overlapCount: number;
  verdict: string;
  reasons: MatchReason[];
};

export type AnalysisApiResponse = {
  requestId: string;
  model: string;
  analysis: ClothingAnalysis;
  match: RemoteMatchResult;
};

export type MatchCheck = {
  id: string;
  candidateName: string;
  candidateImageUri?: string;
  candidateCategory: WardrobeCategory;
  candidateEmoji: string;
  candidateBackground: string;
  liking: number;
  score: number;
  outfitCount: number;
  colorScore: number;
  overlapCount: number;
  verdict: string;
  reasons: MatchReason[];
  analysisSource: 'vision' | 'local';
  candidateAnalysis?: ClothingAnalysis;
  addedToWardrobe: boolean;
  createdAt: string;
};

export type MainTab = 'home' | 'check' | 'wardrobe';
export type Screen = MainTab | 'result' | 'history';

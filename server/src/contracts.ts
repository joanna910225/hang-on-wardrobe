import { z } from 'zod';

export const WardrobeCategorySchema = z.enum(['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bags']);

export const ClothingAnalysisSchema = z.object({
  suggestedName: z.string().min(1).max(80),
  category: WardrobeCategorySchema,
  subcategory: z.string().min(1).max(50),
  primaryColor: z.string().min(1).max(40),
  secondaryColors: z.array(z.string().min(1).max(40)).max(4),
  colorFamily: z.string().min(1).max(40),
  pattern: z.string().min(1).max(40),
  material: z.string().min(1).max(50),
  silhouette: z.string().min(1).max(60),
  formality: z.enum(['casual', 'smart-casual', 'formal', 'sport']),
  styleTags: z.array(z.string().min(1).max(30)).min(1).max(6),
  seasonTags: z.array(z.string().min(1).max(20)).min(1).max(4),
  occasionTags: z.array(z.string().min(1).max(30)).min(1).max(6),
  warmth: z.enum(['light', 'midweight', 'warm']),
  distinctiveness: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  imageQuality: z.enum(['low', 'medium', 'high']),
  uncertainties: z.array(z.string().min(1).max(120)).max(5),
});

export const WardrobeSnapshotItemSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  category: WardrobeCategorySchema,
  colorName: z.string().max(50),
  subcategory: z.string().max(50),
  styleTags: z.array(z.string().max(30)).max(10),
  seasonTags: z.array(z.string().max(20)).max(8),
  occasionTags: z.array(z.string().max(30)).max(10),
  favoriteScore: z.number().int().min(1).max(5),
});

export const AnalyzeItemRequestSchema = z.object({
  imageDataUrl: z.string().max(12_000_000).regex(/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i),
  candidateName: z.string().max(100),
  categoryHint: WardrobeCategorySchema,
  liking: z.number().int().min(1).max(5),
  wardrobe: z.array(WardrobeSnapshotItemSchema).max(100),
});

export type ClothingAnalysisInput = z.infer<typeof ClothingAnalysisSchema>;
export type AnalyzeItemRequest = z.infer<typeof AnalyzeItemRequestSchema>;
export type WardrobeSnapshotItem = z.infer<typeof WardrobeSnapshotItemSchema>;

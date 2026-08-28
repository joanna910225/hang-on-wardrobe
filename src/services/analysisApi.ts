import { File } from 'expo-file-system';
import { AnalysisApiResponse, WardrobeCategory, WardrobeItem } from '../types';

type AnalyzeCandidateInput = {
  imageUri: string;
  candidateName: string;
  categoryHint: WardrobeCategory;
  liking: number;
  wardrobe: WardrobeItem[];
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

const analysisApiUrl = process.env.EXPO_PUBLIC_ANALYSIS_API_URL?.trim().replace(/\/$/, '');

function mimeTypeFor(file: File) {
  if (file.type?.startsWith('image/')) return file.type;
  const extension = file.extension.toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  return 'image/jpeg';
}

export function isVisionAnalysisConfigured() {
  return Boolean(analysisApiUrl);
}

export async function analyzeCandidateWithVision(input: AnalyzeCandidateInput): Promise<AnalysisApiResponse> {
  if (!analysisApiUrl) throw new Error('ANALYSIS_API_NOT_CONFIGURED');

  const file = new File(input.imageUri);
  const imageBase64 = await file.base64();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const response = await fetch(`${analysisApiUrl}/v1/analyze-item`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        imageDataUrl: `data:${mimeTypeFor(file)};base64,${imageBase64}`,
        candidateName: input.candidateName,
        categoryHint: input.categoryHint,
        liking: input.liking,
        wardrobe: input.wardrobe.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          colorName: item.colorName,
          subcategory: item.subcategory,
          styleTags: item.styleTags,
          seasonTags: item.seasonTags,
          occasionTags: item.occasionTags,
          favoriteScore: item.favoriteScore,
        })),
      }),
    });

    if (!response.ok) {
      let errorBody: ApiErrorBody = {};
      try {
        errorBody = await response.json() as ApiErrorBody;
      } catch {
        // The user-facing fallback is the same when a proxy returns non-JSON.
      }
      throw new Error(errorBody.error?.code || `ANALYSIS_API_${response.status}`);
    }

    return await response.json() as AnalysisApiResponse;
  } finally {
    clearTimeout(timeout);
  }
}

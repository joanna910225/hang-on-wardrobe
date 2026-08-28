import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { ClothingAnalysis } from '../../src/types';
import { ClothingAnalysisSchema } from './contracts';

const visionPrompt = `You extract objective attributes from one clothing product photo for a wardrobe matching app.

Analyze the main purchasable garment or accessory. Ignore the person, pose, background, packaging, and styling props. Do not calculate a match score and do not persuade the user to buy or not buy.

Use short English labels. Be conservative about material and construction: when the photo is insufficient, use "unknown" and list the uncertainty. suggestedName should be a natural 2-5 word retail-neutral name that includes the most useful color and garment type. styleTags, seasonTags, and occasionTags must describe the visible item rather than the photography. Return only the required structured result.`;

export type VisionClientOptions = {
  apiKey: string;
  model: string;
};

export async function analyzeClothingImage(
  imageDataUrl: string,
  categoryHint: string,
  options: VisionClientOptions,
): Promise<ClothingAnalysis> {
  const client = new OpenAI({ apiKey: options.apiKey });
  const response = await client.responses.parse({
    model: options.model,
    reasoning: { effort: 'low' },
    store: false,
    max_output_tokens: 1800,
    input: [
      { role: 'system', content: visionPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: `Analyze this item. The user-selected category hint is ${categoryHint}; correct it only when the image clearly shows another category.`,
          },
          { type: 'input_image', image_url: imageDataUrl, detail: 'high' },
        ],
      },
    ],
    text: {
      format: zodTextFormat(ClothingAnalysisSchema, 'clothing_analysis'),
    },
  });

  if (!response.output_parsed) {
    throw new Error('The vision model returned no structured clothing analysis.');
  }

  return response.output_parsed;
}

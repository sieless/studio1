"use server";

import { analyzeImageForListing } from '@/ai/flows/image-analysis-for-listing';
import { z } from 'zod';
import { type ImageAnalysisForListingOutput } from '@/ai/flows/image-analysis-for-listing';

const analyzeImageSchema = z.object({
  imageUrl: z.string().url({ message: "Please provide a valid URL." }),
});

export type AnalysisFormState = {
  message?: string;
  analysis?: ImageAnalysisForListingOutput;
  error?: string;
};

async function dataUrlFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }); // Some image hosts block default fetch user-agent
    if (!response.ok) {
      throw new Error(`Failed to fetch image. Status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error('URL does not point to a valid image.');
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Invalid URL or network issue.');
    }
    throw error;
  }
}


export async function analyzeListingImage(
  formData: FormData
): Promise<AnalysisFormState> {
  const validatedFields = analyzeImageSchema.safeParse({
    imageUrl: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.imageUrl?.[0] || 'Invalid image URL provided.',
    };
  }
  
  try {
    const dataUri = await dataUrlFromUrl(validatedFields.data.imageUrl);

    const analysis = await analyzeImageForListing({
      imageDataUri: dataUri,
    });

    return {
      message: 'Success',
      analysis: {
        suggestedTags: analysis.suggestedTags,
        suggestedImprovements: analysis.suggestedImprovements,
      },
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { error: `AI analysis failed: ${errorMessage}` };
  }
}

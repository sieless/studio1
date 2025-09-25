'use server';

/**
 * @fileOverview Analyzes an image and suggests relevant tags or improvements for a property listing.
 *
 * - analyzeImageForListing - A function that analyzes an image and returns suggested tags and improvements.
 * - ImageAnalysisForListingInput - The input type for the analyzeImageForListing function.
 * - ImageAnalysisForListingOutput - The return type for the analyzeImageForListing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageAnalysisForListingInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A property image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageAnalysisForListingInput = z.infer<typeof ImageAnalysisForListingInputSchema>;

const ImageAnalysisForListingOutputSchema = z.object({
  suggestedTags: z.array(z.string()).describe('A list of suggested tags for the property listing.'),
  suggestedImprovements: z
    .string()
    .describe(
      'Suggestions for improving the listing description or the image itself, such as suggesting a different angle or better lighting.'
    ),
});
export type ImageAnalysisForListingOutput = z.infer<typeof ImageAnalysisForListingOutputSchema>;

export async function analyzeImageForListing(
  input: ImageAnalysisForListingInput
): Promise<ImageAnalysisForListingOutput> {
  return analyzeImageForListingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageAnalysisForListingPrompt',
  input: {schema: ImageAnalysisForListingInputSchema},
  output: {schema: ImageAnalysisForListingOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing property images and providing suggestions for improving property listings.

  Analyze the provided image and suggest relevant tags that describe the property, and provide suggestions on how to improve the listing description or the image itself.

  Here is the property image:
  {{media url=imageDataUri}}

  Ensure that the suggested tags are relevant to the image and the suggested improvements are actionable.
  Respond in a way that is easily readable and actionable by the user.
`,
});

const analyzeImageForListingFlow = ai.defineFlow(
  {
    name: 'analyzeImageForListingFlow',
    inputSchema: ImageAnalysisForListingInputSchema,
    outputSchema: ImageAnalysisForListingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

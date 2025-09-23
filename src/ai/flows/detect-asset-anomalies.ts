'use server';

/**
 * @fileOverview Detects anomalies in asset data using AI.
 *
 * - detectAssetAnomalies - A function that analyzes asset data and identifies anomalies.
 * - DetectAssetAnomaliesInput - The input type for the detectAssetAnomalies function.
 * - DetectAssetAnomaliesOutput - The return type for the detectAssetAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAssetAnomaliesInputSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string(),
        codeId: z.string(),
        city: z.string(),
        value: z.number(),
        observation: z.string().optional(),
      })
    )
    .describe('An array of asset items with their details.'),
});
export type DetectAssetAnomaliesInput = z.infer<typeof DetectAssetAnomaliesInputSchema>;

const DetectAssetAnomaliesOutputSchema = z.object({
  anomalies: z
    .array(
      z.object({
        codeId: z.string(),
        anomalyType: z.string(),
        description: z.string(),
      })
    )
    .describe('An array of anomalies detected in the asset data.'),
});
export type DetectAssetAnomaliesOutput = z.infer<typeof DetectAssetAnomaliesOutputSchema>;

export async function detectAssetAnomalies(input: DetectAssetAnomaliesInput): Promise<DetectAssetAnomaliesOutput> {
  return detectAssetAnomaliesFlow(input);
}

const detectAssetAnomaliesPrompt = ai.definePrompt({
  name: 'detectAssetAnomaliesPrompt',
  input: {schema: DetectAssetAnomaliesInputSchema},
  output: {schema: DetectAssetAnomaliesOutputSchema},
  prompt: `You are an expert in asset management and anomaly detection. Analyze the following asset data to identify any potential anomalies in value or location. Determine appropriate thresholds for flagging anomalies.  Provide a description of each anomaly found including its codeId, anomalyType (value or location), and description.

Asset Data:
{{#each items}}
- Name: {{name}}, Code ID: {{codeId}}, City: {{city}}, Value: {{value}}, Observation: {{observation}}
{{/each}}`,
});

const detectAssetAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectAssetAnomaliesFlow',
    inputSchema: DetectAssetAnomaliesInputSchema,
    outputSchema: DetectAssetAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await detectAssetAnomaliesPrompt(input);
    return output!;
  }
);

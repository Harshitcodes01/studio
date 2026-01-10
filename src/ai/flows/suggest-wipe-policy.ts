'use server';

/**
 * @fileOverview A wipe policy suggestion AI agent.
 *
 * - suggestWipePolicy - A function that suggests a wipe policy based on device type and security requirements.
 * - SuggestWipePolicyInput - The input type for the suggestWipePolicy function.
 * - SuggestWipePolicyOutput - The return type for the suggestWipePolicy function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestWipePolicyInputSchema = z.object({
  deviceType: z.string().describe('The type of the storage device (HDD, SSD, NVMe, USB).'),
  securityRequirements: z
    .string()
    .describe(
      'The security requirements for the data erasure (e.g., compliance standards, sensitivity of data).' /* TODO: Add a helper to suggest values */
    ),
});
export type SuggestWipePolicyInput = z.infer<typeof SuggestWipePolicyInputSchema>;

const SuggestWipePolicyOutputSchema = z.object({
  wipeMethod: z
    .string() /* TODO: Add a helper to suggest values */
    .describe('The suggested wipe method (Overwrite, Secure Erase, Sanitize).'),
  passes: z.number().optional().describe('The number of passes for the wipe method, if applicable.'),
  notes: z.string().describe('Additional notes or considerations for the suggested wipe policy.'),
});
export type SuggestWipePolicyOutput = z.infer<typeof SuggestWipePolicyOutputSchema>;

export async function suggestWipePolicy(input: SuggestWipePolicyInput): Promise<SuggestWipePolicyOutput> {
  return suggestWipePolicyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWipePolicyPrompt',
  input: {schema: SuggestWipePolicyInputSchema},
  output: {schema: SuggestWipePolicyOutputSchema},
  prompt: `You are an AI assistant that suggests a wipe policy for storage devices based on device type and security requirements.

  Given the following device type and security requirements, suggest an appropriate wipe method, the number of passes (if applicable), and any relevant notes.

  Device Type: {{{deviceType}}}
  Security Requirements: {{{securityRequirements}}}

  Format your response as a JSON object with the following keys:
  - wipeMethod: The suggested wipe method (Overwrite, Secure Erase, Sanitize).
  - passes: The number of passes for the wipe method, if applicable.
  - notes: Additional notes or considerations for the suggested wipe policy.
  `,
});

const suggestWipePolicyFlow = ai.defineFlow(
  {
    name: 'suggestWipePolicyFlow',
    inputSchema: SuggestWipePolicyInputSchema,
    outputSchema: SuggestWipePolicyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

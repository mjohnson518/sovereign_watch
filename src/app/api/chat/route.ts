import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const systemPrompt = `You are an expert Macro Strategist specializing in US Sovereign Debt analysis.
  
CONTEXT:
${context || 'No specific chart context provided.'}

GUIDELINES:
1. Provide concise, professional financial analysis.
2. Focus on risks (liquidity, refinancing), demand trends, and yield implications.
3. Use specific numbers from the context when available.
4. Keep responses under 200 words.
5. Use markdown formatting.
6. Be direct and actionable.`;

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}


import { google } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';
import { sanitizeChatInput } from '@/lib/validation';

export const maxDuration = 30;

// Maximum context size to prevent abuse
const MAX_CONTEXT_LENGTH = 10000;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_MESSAGES = 50;

/**
 * Validate and sanitize chat messages for AI SDK
 */
function validateMessages(rawMessages: unknown): {
  isValid: boolean;
  error?: string;
  messages?: CoreMessage[];
} {
  if (!Array.isArray(rawMessages)) {
    return { isValid: false, error: 'Messages must be an array' };
  }

  if (rawMessages.length === 0) {
    return { isValid: false, error: 'Messages array cannot be empty' };
  }

  if (rawMessages.length > MAX_MESSAGES) {
    return { isValid: false, error: 'Too many messages in conversation' };
  }

  const validatedMessages: CoreMessage[] = [];

  for (let i = 0; i < rawMessages.length; i++) {
    const msg = rawMessages[i];

    if (!msg || typeof msg !== 'object') {
      return { isValid: false, error: `Invalid message at index ${i}` };
    }

    const role = (msg as Record<string, unknown>).role;
    const content = (msg as Record<string, unknown>).content;

    // Validate role - only allow user and assistant roles from client
    if (role !== 'user' && role !== 'assistant') {
      return { isValid: false, error: `Invalid role at message ${i}` };
    }

    // Validate content
    if (content === undefined || content === null) {
      return { isValid: false, error: `Missing content at message ${i}` };
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const { sanitized, isValid, error } = sanitizeChatInput(contentStr, MAX_MESSAGE_LENGTH);

    if (!isValid) {
      return { isValid: false, error: `Message ${i}: ${error}` };
    }

    validatedMessages.push({ role, content: sanitized });
  }

  return { isValid: true, messages: validatedMessages };
}

export async function POST(req: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(req);
  const rateLimitResult = checkRateLimit(`chat:${clientId}`, RATE_LIMITS.chat);

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending more messages.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(rateLimitResult.resetIn / 1000).toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(Date.now() / 1000 + rateLimitResult.resetIn / 1000).toString(),
        },
      }
    );
  }

  // Parse request body
  let body: { messages?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON in request body' },
      { status: 400 }
    );
  }

  // Validate messages
  const messagesValidation = validateMessages(body.messages);
  if (!messagesValidation.isValid || !messagesValidation.messages) {
    return NextResponse.json(
      { error: messagesValidation.error },
      { status: 400 }
    );
  }

  // Validate and sanitize context
  let context = 'No specific chart context provided.';
  if (body.context) {
    const contextStr = typeof body.context === 'string'
      ? body.context
      : JSON.stringify(body.context);

    const contextValidation = sanitizeChatInput(contextStr, MAX_CONTEXT_LENGTH);
    if (contextValidation.isValid) {
      context = contextValidation.sanitized;
    }
  }

  const systemPrompt = `You are an expert Macro Strategist specializing in US Sovereign Debt analysis.

CONTEXT:
${context}

GUIDELINES:
1. Provide concise, professional financial analysis.
2. Focus on risks (liquidity, refinancing), demand trends, and yield implications.
3. Use specific numbers from the context when available.
4. Keep responses under 200 words.
5. Use markdown formatting.
6. Be direct and actionable.
7. Only discuss topics related to Treasury debt, fiscal policy, and macroeconomics.
8. Decline to answer questions unrelated to financial analysis.`;

  const result = streamText({
    model: google('gemini-2.0-flash'),
    system: systemPrompt,
    messages: messagesValidation.messages,
  });

  return result.toTextStreamResponse({
    headers: {
      'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    },
  });
}


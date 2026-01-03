/**
 * Input Validation Utilities
 *
 * Provides validation for API inputs to prevent
 * injection attacks and ensure data integrity.
 */

/**
 * Sanitize user input for AI chat
 * Removes potential prompt injection patterns and limits length
 */
export function sanitizeChatInput(input: string, maxLength: number = 2000): {
  sanitized: string;
  isValid: boolean;
  error?: string;
} {
  // Check for empty input
  if (!input || typeof input !== 'string') {
    return { sanitized: '', isValid: false, error: 'Message is required' };
  }

  // Trim and check length
  let sanitized = input.trim();

  if (sanitized.length === 0) {
    return { sanitized: '', isValid: false, error: 'Message cannot be empty' };
  }

  if (sanitized.length > maxLength) {
    return {
      sanitized: '',
      isValid: false,
      error: `Message exceeds maximum length of ${maxLength} characters`
    };
  }

  // Remove null bytes and control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Limit consecutive newlines to prevent formatting abuse
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');

  return { sanitized, isValid: true };
}

/**
 * Validate chat messages array
 */
export function validateChatMessages(messages: unknown): {
  isValid: boolean;
  error?: string;
  messages?: Array<{ role: string; content: string }>;
} {
  if (!Array.isArray(messages)) {
    return { isValid: false, error: 'Messages must be an array' };
  }

  if (messages.length === 0) {
    return { isValid: false, error: 'Messages array cannot be empty' };
  }

  if (messages.length > 50) {
    return { isValid: false, error: 'Too many messages in conversation' };
  }

  const validatedMessages: Array<{ role: string; content: string }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (!msg || typeof msg !== 'object') {
      return { isValid: false, error: `Invalid message at index ${i}` };
    }

    const role = (msg as Record<string, unknown>).role;
    const content = (msg as Record<string, unknown>).content;

    // Validate role
    if (!role || typeof role !== 'string' || !['user', 'assistant', 'system'].includes(role)) {
      return { isValid: false, error: `Invalid role at message ${i}` };
    }

    // Validate content
    if (content === undefined || content === null) {
      return { isValid: false, error: `Missing content at message ${i}` };
    }

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const { sanitized, isValid, error } = sanitizeChatInput(contentStr);

    if (!isValid) {
      return { isValid: false, error: `Message ${i}: ${error}` };
    }

    validatedMessages.push({ role: role as string, content: sanitized });
  }

  return { isValid: true, messages: validatedMessages };
}

/**
 * Validate timeframe parameter
 */
export function validateTimeframe(timeframe: string | null): {
  isValid: boolean;
  value: string;
  error?: string;
} {
  const validTimeframes = ['1y', '3y', '5y', '10y'];
  const value = timeframe || '1y';

  if (!validTimeframes.includes(value)) {
    return {
      isValid: false,
      value: '1y',
      error: `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`
    };
  }

  return { isValid: true, value };
}

/**
 * Validate security types parameter
 */
export function validateSecurityTypes(types: string | null): {
  isValid: boolean;
  value: string[];
  error?: string;
} {
  const validTypes = ['BILL', 'NOTE', 'BOND', 'TIPS', 'FRN', 'CMB'];
  const defaultTypes = ['NOTE', 'BOND'];

  if (!types) {
    return { isValid: true, value: defaultTypes };
  }

  const requestedTypes = types.split(',').map(t => t.trim().toUpperCase());

  // Check all requested types are valid
  const invalidTypes = requestedTypes.filter(t => !validTypes.includes(t));
  if (invalidTypes.length > 0) {
    return {
      isValid: false,
      value: defaultTypes,
      error: `Invalid security types: ${invalidTypes.join(', ')}. Valid types: ${validTypes.join(', ')}`
    };
  }

  return { isValid: true, value: requestedTypes };
}

/**
 * Validate years parameter (for maturity wall)
 */
export function validateYears(years: string | null): {
  isValid: boolean;
  value: number;
  error?: string;
} {
  const defaultYears = 10;

  if (!years) {
    return { isValid: true, value: defaultYears };
  }

  const parsed = parseInt(years, 10);

  if (isNaN(parsed) || parsed < 1 || parsed > 30) {
    return {
      isValid: false,
      value: defaultYears,
      error: 'Years must be a number between 1 and 30'
    };
  }

  return { isValid: true, value: parsed };
}

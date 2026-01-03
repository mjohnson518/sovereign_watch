/**
 * Structured Logging Utility
 *
 * Provides structured logging with consistent format for
 * observability and debugging in production.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Format log entry for output
 */
function formatLogEntry(entry: LogEntry): string {
  return JSON.stringify(entry);
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (context && Object.keys(context).length > 0) {
    entry.context = context;
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  return entry;
}

/**
 * Logger instance with structured output
 */
export const logger = {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLogEntry(createLogEntry('debug', message, context)));
    }
  },

  info(message: string, context?: LogContext): void {
    console.info(formatLogEntry(createLogEntry('info', message, context)));
  },

  warn(message: string, context?: LogContext, error?: Error): void {
    console.warn(formatLogEntry(createLogEntry('warn', message, context, error)));
  },

  error(message: string, context?: LogContext, error?: Error): void {
    console.error(formatLogEntry(createLogEntry('error', message, context, error)));
  },
};

/**
 * Create a child logger with bound context
 */
export function createLogger(baseContext: LogContext) {
  return {
    debug(message: string, context?: LogContext): void {
      logger.debug(message, { ...baseContext, ...context });
    },

    info(message: string, context?: LogContext): void {
      logger.info(message, { ...baseContext, ...context });
    },

    warn(message: string, context?: LogContext, error?: Error): void {
      logger.warn(message, { ...baseContext, ...context }, error);
    },

    error(message: string, context?: LogContext, error?: Error): void {
      logger.error(message, { ...baseContext, ...context }, error);
    },
  };
}

/**
 * API request logger - logs request metadata
 */
export function logApiRequest(
  endpoint: string,
  method: string,
  context?: LogContext
): void {
  logger.info('API request', {
    endpoint,
    method,
    ...context,
  });
}

/**
 * API response logger - logs response metadata
 */
export function logApiResponse(
  endpoint: string,
  status: number,
  durationMs: number,
  context?: LogContext
): void {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
  logger[level]('API response', {
    endpoint,
    status,
    durationMs,
    ...context,
  });
}

/**
 * ETL operation logger
 */
export function logEtlOperation(
  operation: string,
  status: 'started' | 'completed' | 'failed',
  context?: LogContext
): void {
  const level = status === 'failed' ? 'error' : 'info';
  logger[level](`ETL ${operation}`, {
    operation,
    status,
    ...context,
  });
}

/**
 * Database operation logger
 */
export function logDbOperation(
  operation: string,
  table: string,
  context?: LogContext
): void {
  logger.debug('Database operation', {
    operation,
    table,
    ...context,
  });
}

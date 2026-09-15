/**
 * Centralized Application Logger Utility
 * Provides structured logging with levels (INFO, WARN, ERROR, DEBUG),
 * ISO timestamps, and sensitive payload redaction (passwords, tokens).
 */

const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'secret', 'refreshToken'];

const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const sanitizedMeta = sanitizeData(meta);
  const metaString = Object.keys(sanitizedMeta).length > 0 ? ` | Meta: ${JSON.stringify(sanitizedMeta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
};

export const logger = {
  info: (message, meta) => {
    console.log(`\x1b[36m${formatMessage('info', message, meta)}\x1b[0m`);
  },
  warn: (message, meta) => {
    console.warn(`\x1b[33m${formatMessage('warn', message, meta)}\x1b[0m`);
  },
  error: (message, meta) => {
    console.error(`\x1b[31m${formatMessage('error', message, meta)}\x1b[0m`);
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[35m${formatMessage('debug', message, meta)}\x1b[0m`);
    }
  },
};

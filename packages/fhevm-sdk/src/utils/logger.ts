export interface Logger {
  debug(...args: any[]): void;
  info(...args: any[]): void;
  warn(...args: any[]): void;
  error(...args: any[]): void;
}

/**
 * Creates a logger instance with optional debug mode
 * 
 * @param prefix - Prefix for all log messages
 * @param enabled - Whether debug logging is enabled
 * @returns Logger instance
 */
export function createLogger(prefix: string, enabled: boolean = false): Logger {
  const formatMessage = (level: string, ...args: any[]) => {
    return [`[${prefix}]`, ...args];
  };

  return {
    debug: (...args: any[]) => {
      if (enabled) {
        console.debug(...formatMessage('DEBUG', ...args));
      }
    },
    info: (...args: any[]) => {
      console.info(...formatMessage('INFO', ...args));
    },
    warn: (...args: any[]) => {
      console.warn(...formatMessage('WARN', ...args));
    },
    error: (...args: any[]) => {
      console.error(...formatMessage('ERROR', ...args));
    },
  };
}


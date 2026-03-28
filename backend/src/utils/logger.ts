const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

function log(level: LogLevel, ...args: any[]) {
  if (LOG_LEVELS[level] < LOG_LEVELS[currentLevel]) return;

  const prefix = `[${formatTimestamp()}] [${level.toUpperCase()}]`;
  switch (level) {
    case 'debug': console.debug(prefix, ...args); break;
    case 'info':  console.log(prefix, ...args); break;
    case 'warn':  console.warn(prefix, ...args); break;
    case 'error': console.error(prefix, ...args); break;
  }
}

export const logger = {
  debug: (...args: any[]) => log('debug', ...args),
  info:  (...args: any[]) => log('info', ...args),
  warn:  (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
};

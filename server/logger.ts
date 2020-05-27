import winston from 'winston';

const { combine, timestamp, printf } = winston.format;
const loggerFormat = printf(({ label, level, message, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), loggerFormat),
  defaultMeta: { service: 'home-dash' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error', maxsize: 5000000, maxFiles: 2 }),
    new winston.transports.File({ filename: 'debug.log', level: 'debug', maxsize: 5000000, maxFiles: 3 }),
  ],
  exceptionHandlers: [new winston.transports.File({ filename: 'exceptions.log' })],
  exitOnError: false,
});
// logger['rejections'].handle(new winston.transports.File({ filename: 'rejections.log' }));

export const getLogger = (label: string) => ({
  debug: (message: string) => logger.debug(message, { label }),
  info: (message: string) => logger.info(message, { label }),
  error: (message: string) => logger.error(message, { label }),
});

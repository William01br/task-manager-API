import pino from 'pino';
import env from '../config/env';

/**
 * Logs are stored in mongodb with a TTL for records of 7 days
 * - Use Compass for check the logs.
 */

const logger = pino({
  level: 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: 'debug',
        options: { colorize: true },
      },
      {
        target: 'pino-mongodb',
        level: 'info',
        options: {
          uri: env.ME_CONFIG_MONGODB_URL_LOGS,
          database: 'logs',
          collection: 'logs',
          mongoOptions: {
            auth: {
              username: 'root',
              password: 'root',
            },
          },
        },
      },
    ],
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
});

export default logger;

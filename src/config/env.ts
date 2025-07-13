import path from 'node:path';

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// this will load and validate all variables
loadEnv({ path: path.resolve(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'test')
  loadEnv({ path: path.resolve(__dirname, '../../.env.test'), override: true });

const schema = z.object({
  NODE_ENV: z.string().nonempty(),

  ME_CONFIG_MONGODB_URL: z.string().nonempty().url(),
  ME_CONFIG_REDIS_URL: z.string().nonempty().url(),
  ME_CONFIG_MONGODB_URL_LOGS: z.string().nonempty().url(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    'Invalid environment variables:',
    JSON.stringify(parsed.error.format(), null, 4),
  );
  process.exit(1);
}

export default parsed.data;

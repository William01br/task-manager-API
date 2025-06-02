import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  ME_CONFIG_MONGODB_URL: z.string().nonempty().url(),
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

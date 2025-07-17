import { MongoClient } from 'mongodb';
import env from './env';

const client = new MongoClient(env.ME_CONFIG_MONGODB_URL_LOGS);

export async function connectToMongo(): Promise<void> {
  await client.connect();
  const db = client.db('logs');
  const collection = db.collection('logs');
  await collection.createIndex(
    { timestamp: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 7 },
  );
}

import { connectToRedis } from './config/cache';
import { connectToMongoose } from './config/database';
import { SetupServer } from './server';

async function boostrap(): Promise<void> {
  const server = new SetupServer();
  try {
    server.init();
    server.start();
    await connectToMongoose();
    await connectToRedis();
  } catch (error) {
    console.error('Error starting the application:', error);
    process.exit(1);
  }
}
void boostrap();

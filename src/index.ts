import { connectToRedis } from './config/cache';
import { connectToMongoose } from './config/database';
import { SetupServer } from './server';
import logger from './logging/logger';
import { connectToMongo } from './config/mongo';

async function boostrap(): Promise<void> {
  try {
    const server = new SetupServer();
    server.init();
    server.start();

    await connectToMongoose();
    logger.info('Connection to Mongoose established!');

    await connectToRedis();
    logger.info('Connection to Redis established!');

    await connectToMongo();
    logger.info('Connection to MongoDB established!');
  } catch (error) {
    logger.error('Error starting the application:', error);
    process.exit(1);
  }
}
void boostrap();

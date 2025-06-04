import mongoose from 'mongoose';
import env from './env';

export const connectToMongoose = async (): Promise<void> => {
  try {
    await mongoose.connect(env.ME_CONFIG_MONGODB_URL);
    console.log('Mongo connected!');
  } catch (error) {
    console.error('Mongo connection error:', error);
    process.exit(1);
  }
};

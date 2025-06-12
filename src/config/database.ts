import mongoose from 'mongoose';
import env from './env';

export const connectToMongoose = async (): Promise<void> => {
  await mongoose.connect(env.ME_CONFIG_MONGODB_URL);
  console.log('Mongo connected!');
};

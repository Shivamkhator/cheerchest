// db/connectDb.ts
import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongodb URI to .env.local');
}

let clientPromise: Promise<typeof mongoose>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongoose = global as typeof globalThis & {
    mongoose: Promise<typeof mongoose>;
  };

  if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
    });
  }
  clientPromise = globalWithMongoose.mongoose;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = mongoose.connect(process.env.MONGODB_URI!, {
    bufferCommands: false,
  });
}

export default clientPromise;
import mongoose from "mongoose";

// Ensure MONGO_URI is set in the environment variables
const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error("Please define the MONGO_URI environment variable");
}

// Extend NodeJS global to handle mongoose connection caching
declare global {
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async (): Promise<mongoose.Connection> => {
  // If the connection is already established, return the cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // If the connection is not established, create and cache the connection
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI).then((mongooseInstance) => mongooseInstance.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;

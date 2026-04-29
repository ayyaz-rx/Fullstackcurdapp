import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI!;

const READY_STATE_CONNECTED = 1;

type CachedMongoose = {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: CachedMongoose;
};

const cached: CachedMongoose = globalWithMongoose.mongoose || {
  conn: null,
  promise: null,
};

export async function connectDB() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  // Reuse only when mongoose reports an active connection.
  if (cached.conn && mongoose.connection.readyState === READY_STATE_CONNECTED) {
    return cached.conn;
  }

  // Reset stale cache so we can establish a fresh connection.
  if (mongoose.connection.readyState !== READY_STATE_CONNECTED) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGO_URI, opts)
      .then((m) => {
        console.log(" DB Connected");
        return m;
      })
      .catch((err) => {
        console.error(" DB Connection Failed:", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  globalWithMongoose.mongoose = cached;

  return cached.conn;
}
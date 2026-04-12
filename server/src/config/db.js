import mongoose from "mongoose";
import { startMemoryMongoServer } from "./memoryMongo.js";

const isLocalMongoUri = (mongoUri) =>
  /mongodb:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\//i.test(mongoUri);

export const connectDatabase = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not configured.");
  }

  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    if (!isLocalMongoUri(mongoUri)) {
      error.message = `MongoDB connection failed for the configured MONGODB_URI. ${error.message}`;
      throw error;
    }

    let memoryServer;

    try {
      memoryServer = await startMemoryMongoServer(mongoUri);
    } catch (memoryError) {
      memoryError.message =
        "MongoDB is unavailable, and the development fallback database could not start. " +
        "Start a local MongoDB instance or provide a working remote MONGODB_URI. " +
        `Original fallback error: ${memoryError.message}`;
      throw memoryError;
    }

    const fallbackUri = memoryServer.getUri();

    await mongoose.connect(fallbackUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.warn(
      "Local MongoDB was unavailable. Started an in-memory MongoDB instance for development."
    );
  }
};

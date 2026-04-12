import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServerPromise;

const getDatabaseName = (mongoUri) => {
  const sanitized = String(mongoUri || "").split("?")[0];
  const segments = sanitized.split("/");
  return segments[segments.length - 1] || "ai4kids";
};

export const startMemoryMongoServer = async (mongoUri) => {
  if (!memoryServerPromise) {
    memoryServerPromise = MongoMemoryServer.create({
      instance: {
        dbName: getDatabaseName(mongoUri),
      },
    });
  }

  return memoryServerPromise;
};

export const stopMemoryMongoServer = async () => {
  if (!memoryServerPromise) {
    return;
  }

  const memoryServer = await memoryServerPromise;
  await memoryServer.stop();
  memoryServerPromise = null;
};

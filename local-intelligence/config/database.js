import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI?.trim();

  if (!uri) {
    throw new Error("MONGODB_URI is missing. Configure it in local-intelligence/.env.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 10000),
  });

  console.log(`MongoDB connected (${mongoose.connection.name}).`);
  return mongoose.connection;
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

import mongoose from "mongoose";

/**
 * Opens the MongoDB connection used by every model.
 * The URI comes from the MONGO_URI environment variable.
 */
const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) throw new Error("MONGO_URI is not defined in the environment");
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export default connectDB;

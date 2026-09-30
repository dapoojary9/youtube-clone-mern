import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import seedDatabase from "./seedDatabase.js";

// Usage: npm run seed   (uses MONGO_URI from .env)
try {
  await connectDB();
  await seedDatabase();
  console.log("Sample logins: john@example.com / Password123 (also jane@, alex@)");
} catch (err) {
  console.error("Seeding failed:", err);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}

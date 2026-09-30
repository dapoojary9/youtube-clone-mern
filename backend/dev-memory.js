/**
 * Convenience runner for reviewers without MongoDB installed:
 * spins up an in-memory MongoDB, seeds it and starts the API.
 * Data is lost when the process stops. Usage: npm run dev:memory
 */
import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "./app.js";
import connectDB from "./config/db.js";
import seedDatabase from "./seed/seedDatabase.js";

process.env.JWT_SECRET ||= "dev_memory_secret";
const mongod = await MongoMemoryServer.create();
await connectDB(mongod.getUri("youtube_clone"));
await seedDatabase();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API (in-memory DB) running on http://localhost:${PORT}`));

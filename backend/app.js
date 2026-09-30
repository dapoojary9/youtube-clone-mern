import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import channelRoutes from "./routes/channelRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

// Express app is built separately from server.js so it can be reused (tests, in-memory dev)
const app = express();

const origins = (process.env.CLIENT_URL || "*").split(",").map((o) => o.trim());
app.use(cors({ origin: origins.includes("*") ? true : origins }));
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (_req, res) => res.json({ success: true, status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/channels", channelRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/comments", commentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

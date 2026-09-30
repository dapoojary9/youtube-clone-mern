import { Router } from "express";
import {
  createChannel,
  deleteChannel,
  getChannel,
  getChannelVideos,
  toggleSubscribe,
  updateChannel,
} from "../controllers/channelController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = Router();
router.post("/", protect, createChannel);
router
  .route("/:id")
  .get(optionalAuth, getChannel)
  .put(protect, updateChannel)
  .delete(protect, deleteChannel);
router.get("/:id/videos", getChannelVideos);
router.put("/:id/subscribe", protect, toggleSubscribe);
export default router;

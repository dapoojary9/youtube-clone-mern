import { Router } from "express";
import {
  addView,
  createVideo,
  deleteVideo,
  dislikeVideo,
  getCategories,
  getVideo,
  getVideos,
  likeVideo,
  updateVideo,
} from "../controllers/videoController.js";
import { addComment, getComments } from "../controllers/commentController.js";
import { optionalAuth, protect } from "../middleware/auth.js";

const router = Router();
router.get("/categories", getCategories);
router.route("/").get(getVideos).post(protect, createVideo);
router
  .route("/:id")
  .get(optionalAuth, getVideo)
  .put(protect, updateVideo)
  .delete(protect, deleteVideo);
router.patch("/:id/view", addView);
router.put("/:id/like", protect, likeVideo);
router.put("/:id/dislike", protect, dislikeVideo);

// Nested comment routes: /api/videos/:videoId/comments
router.route("/:videoId/comments").get(getComments).post(protect, addComment);
export default router;

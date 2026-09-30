import { Router } from "express";
import { deleteComment, updateComment } from "../controllers/commentController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.route("/:id").put(protect, updateComment).delete(protect, deleteComment);
export default router;

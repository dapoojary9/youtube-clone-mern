import Comment from "../models/Comment.js";
import Video from "../models/Video.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const USER_FIELDS = "username avatar";

const validateText = (text) => {
  if (!text || !String(text).trim()) throw new ApiError(400, "Comment cannot be empty", { text: "Comment cannot be empty" });
  if (String(text).length > 1000) throw new ApiError(400, "Comment is too long", { text: "Max 1000 characters" });
};

const loadOwnedComment = async (id, userId) => {
  const comment = await Comment.findById(id);
  if (!comment) throw new ApiError(404, "Comment not found");
  if (!comment.user.equals(userId)) throw new ApiError(403, "You can only modify your own comments");
  return comment;
};

/** GET /api/videos/:videoId/comments - newest first */
export const getComments = asyncHandler(async (req, res) => {
  if (!(await Video.exists({ _id: req.params.videoId }))) throw new ApiError(404, "Video not found");
  const comments = await Comment.find({ video: req.params.videoId })
    .sort({ createdAt: -1 })
    .populate("user", USER_FIELDS);
  res.json({ success: true, count: comments.length, comments });
});

/** POST /api/videos/:videoId/comments  (protected) - saved in DB against the video */
export const addComment = asyncHandler(async (req, res) => {
  validateText(req.body.text);
  if (!(await Video.exists({ _id: req.params.videoId }))) throw new ApiError(404, "Video not found");
  const comment = await Comment.create({
    video: req.params.videoId,
    user: req.user._id,
    text: req.body.text.trim(),
  });
  await comment.populate("user", USER_FIELDS);
  res.status(201).json({ success: true, comment });
});

/** PUT /api/comments/:id  (protected, author only) */
export const updateComment = asyncHandler(async (req, res) => {
  validateText(req.body.text);
  const comment = await loadOwnedComment(req.params.id, req.user._id);
  comment.text = req.body.text.trim();
  comment.edited = true;
  await comment.save();
  await comment.populate("user", USER_FIELDS);
  res.json({ success: true, comment });
});

/** DELETE /api/comments/:id  (protected, author only) */
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await loadOwnedComment(req.params.id, req.user._id);
  await comment.deleteOne();
  res.json({ success: true, message: "Comment deleted", id: comment._id });
});

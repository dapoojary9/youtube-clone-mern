import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import Comment from "../models/Comment.js";
import CATEGORIES from "../config/categories.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { getYouTubeId, validateVideo } from "../utils/validators.js";

const CHANNEL_FIELDS = "channelName handle channelAvatar subscribers owner";
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Adds the viewer's reaction so the UI can highlight the like/dislike button
const withReaction = (video, user) => {
  const data = video.toJSON();
  data.userReaction = null;
  if (user) {
    if (video.likedBy.some((id) => id.equals(user._id))) data.userReaction = "like";
    else if (video.dislikedBy.some((id) => id.equals(user._id))) data.userReaction = "dislike";
  }
  delete data.likedBy;
  delete data.dislikedBy;
  return data;
};

// If no thumbnail is given for a YouTube link, use YouTube's own thumbnail
const resolveThumbnail = (videoUrl, thumbnailUrl) => {
  if (thumbnailUrl) return thumbnailUrl;
  const ytId = getYouTubeId(videoUrl);
  return ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "";
};

const loadOwnedVideo = async (videoId, userId) => {
  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  if (!video.uploader.equals(userId)) throw new ApiError(403, "You can only modify your own videos");
  return video;
};

/** GET /api/videos/categories - list of categories for filter chips */
export const getCategories = (_req, res) => res.json({ success: true, categories: CATEGORIES });

/**
 * GET /api/videos?search=react&category=Coding&exclude=<id>&limit=20
 * Search by title (case-insensitive) and/or filter by category.
 */
export const getVideos = asyncHandler(async (req, res) => {
  const { search, category, exclude } = req.query;
  const limit = Math.min(parseInt(req.query.limit, 10) || 60, 100);
  const filter = {};
  if (search && search.trim()) filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
  if (category && category !== "All") filter.category = category;
  if (exclude) filter._id = { $ne: exclude };

  const videos = await Video.find(filter)
    .sort({ uploadDate: -1 })
    .limit(limit)
    .populate("channel", CHANNEL_FIELDS)
    .select("-likedBy -dislikedBy");
  res.json({ success: true, count: videos.length, videos });
});

/** GET /api/videos/:id - single video with channel + viewer reaction */
export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate("channel", CHANNEL_FIELDS)
    .populate("uploader", "username avatar");
  if (!video) throw new ApiError(404, "Video not found");

  const data = withReaction(video, req.user);
  const channel = await Channel.findById(video.channel?._id).select("subscribedBy");
  data.isSubscribed =
    !!req.user && !!channel && channel.subscribedBy.some((id) => id.equals(req.user._id));
  res.json({ success: true, video: data });
});

/** PATCH /api/videos/:id/view - increments the view counter */
export const addView = asyncHandler(async (req, res) => {
  const video = await Video.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  ).select("views");
  if (!video) throw new ApiError(404, "Video not found");
  res.json({ success: true, views: video.views });
});

/** POST /api/videos  (protected) - upload video metadata to the user's channel */
export const createVideo = asyncHandler(async (req, res) => {
  const errors = validateVideo(req.body);
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  const channelId = req.body.channelId || req.user.channels[0];
  const channel = channelId && (await Channel.findById(channelId));
  if (!channel) throw new ApiError(400, "Create a channel before uploading videos");
  if (!channel.owner.equals(req.user._id))
    throw new ApiError(403, "You can only upload to your own channel");

  const thumbnailUrl = resolveThumbnail(req.body.videoUrl, req.body.thumbnailUrl);
  if (!thumbnailUrl) {
    throw new ApiError(400, "Validation failed", {
      thumbnailUrl: "Thumbnail URL is required for non-YouTube videos",
    });
  }

  const video = await Video.create({
    title: req.body.title.trim(),
    description: req.body.description || "",
    videoUrl: req.body.videoUrl.trim(),
    thumbnailUrl,
    category: req.body.category,
    channel: channel._id,
    uploader: req.user._id,
  });
  channel.videos.push(video._id);
  await channel.save();

  await video.populate("channel", CHANNEL_FIELDS);
  res.status(201).json({ success: true, video });
});

/** PUT /api/videos/:id  (protected, uploader only) - edit video details */
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await loadOwnedVideo(req.params.id, req.user._id);
  const errors = validateVideo(req.body, true);
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  ["title", "description", "videoUrl", "thumbnailUrl", "category"].forEach((field) => {
    if (req.body[field] !== undefined) video[field] = req.body[field];
  });
  video.thumbnailUrl = resolveThumbnail(video.videoUrl, video.thumbnailUrl) || video.thumbnailUrl;
  await video.save();
  await video.populate("channel", CHANNEL_FIELDS);
  res.json({ success: true, video: withReaction(video, req.user) });
});

/** DELETE /api/videos/:id  (protected, uploader only) - removes video + its comments */
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await loadOwnedVideo(req.params.id, req.user._id);
  await Promise.all([
    Comment.deleteMany({ video: video._id }),
    Channel.findByIdAndUpdate(video.channel, { $pull: { videos: video._id } }),
  ]);
  await video.deleteOne();
  res.json({ success: true, message: "Video deleted", id: video._id });
});

/**
 * PUT /api/videos/:id/like | /dislike  (protected)
 * Toggles the reaction. Liking removes an existing dislike and vice-versa.
 */
const react = (type) =>
  asyncHandler(async (req, res) => {
    const video = await Video.findById(req.params.id);
    if (!video) throw new ApiError(404, "Video not found");
    const uid = req.user._id;
    const [same, opposite] =
      type === "like" ? [video.likedBy, video.dislikedBy] : [video.dislikedBy, video.likedBy];

    if (same.some((id) => id.equals(uid))) {
      same.pull(uid); // clicking again removes the reaction
    } else {
      same.push(uid);
      opposite.pull(uid);
    }
    await video.save();
    const data = withReaction(video, req.user);
    res.json({
      success: true,
      likes: data.likes,
      dislikes: data.dislikes,
      userReaction: data.userReaction,
    });
  });

export const likeVideo = react("like");
export const dislikeVideo = react("dislike");

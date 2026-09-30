import Channel from "../models/Channel.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateChannel } from "../utils/validators.js";

// Builds a unique @handle from the channel name
const buildHandle = async (name) => {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24) || "channel";
  let handle = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Channel.exists({ handle })) handle = `${base}${n++}`;
  return handle;
};

const loadOwnedChannel = async (channelId, userId) => {
  const channel = await Channel.findById(channelId);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (!channel.owner.equals(userId)) throw new ApiError(403, "You can only manage your own channel");
  return channel;
};

/** POST /api/channels  (protected) - create a channel for the signed-in user */
export const createChannel = asyncHandler(async (req, res) => {
  const { channelName = "", description = "", channelBanner = "", channelAvatar = "" } = req.body;
  const errors = validateChannel({ channelName, description, channelBanner, channelAvatar });
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  if (req.user.channels.length > 0) {
    throw new ApiError(409, "You already have a channel", {
      channelName: "Each account can own one channel",
    });
  }

  const channel = await Channel.create({
    channelName: channelName.trim(),
    handle: await buildHandle(channelName),
    owner: req.user._id,
    description,
    channelBanner,
    channelAvatar: channelAvatar || req.user.avatar,
  });

  await User.findByIdAndUpdate(req.user._id, { $push: { channels: channel._id } });
  res.status(201).json({ success: true, channel });
});

/** GET /api/channels/:id - public channel info (+ whether the viewer is subscribed) */
export const getChannel = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id).populate("owner", "username avatar");
  if (!channel) throw new ApiError(404, "Channel not found");

  const data = channel.toJSON();
  data.isSubscribed = req.user ? channel.subscribedBy.some((id) => id.equals(req.user._id)) : false;
  data.videoCount = channel.videos.length;
  delete data.subscribedBy;
  res.json({ success: true, channel: data });
});

/** GET /api/channels/:id/videos - every video of a channel, newest first */
export const getChannelVideos = asyncHandler(async (req, res) => {
  if (!(await Channel.exists({ _id: req.params.id }))) throw new ApiError(404, "Channel not found");
  const videos = await Video.find({ channel: req.params.id })
    .sort({ uploadDate: -1 })
    .populate("channel", "channelName handle channelAvatar");
  res.json({ success: true, videos });
});

/** PUT /api/channels/:id  (protected, owner only) - update channel details */
export const updateChannel = asyncHandler(async (req, res) => {
  const channel = await loadOwnedChannel(req.params.id, req.user._id);
  const payload = { ...channel.toObject(), ...req.body };
  const errors = validateChannel(payload);
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  ["channelName", "description", "channelBanner", "channelAvatar"].forEach((field) => {
    if (req.body[field] !== undefined) channel[field] = req.body[field];
  });
  await channel.save();
  res.json({ success: true, channel });
});

/** DELETE /api/channels/:id  (protected, owner only) - removes channel, its videos and comments */
export const deleteChannel = asyncHandler(async (req, res) => {
  const channel = await loadOwnedChannel(req.params.id, req.user._id);
  const videoIds = channel.videos;
  await Promise.all([
    Comment.deleteMany({ video: { $in: videoIds } }),
    Video.deleteMany({ channel: channel._id }),
    User.findByIdAndUpdate(req.user._id, { $pull: { channels: channel._id } }),
  ]);
  await channel.deleteOne();
  res.json({ success: true, message: "Channel deleted" });
});

/** PUT /api/channels/:id/subscribe  (protected) - toggle subscription */
export const toggleSubscribe = asyncHandler(async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) throw new ApiError(404, "Channel not found");
  if (channel.owner.equals(req.user._id))
    throw new ApiError(400, "You cannot subscribe to your own channel");

  const already = channel.subscribedBy.some((id) => id.equals(req.user._id));
  if (already) {
    channel.subscribedBy.pull(req.user._id);
    channel.subscribers = Math.max(0, channel.subscribers - 1);
  } else {
    channel.subscribedBy.push(req.user._id);
    channel.subscribers += 1;
  }
  await channel.save();
  res.json({ success: true, isSubscribed: !already, subscribers: channel.subscribers });
});

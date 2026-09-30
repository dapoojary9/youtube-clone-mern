import User from "../models/User.js";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import Comment from "../models/Comment.js";
import * as data from "./data.js";

/** Clears all collections and inserts the sample data with proper references. */
export default async function seedDatabase() {
  await Promise.all([User.deleteMany({}), Channel.deleteMany({}), Video.deleteMany({}), Comment.deleteMany({})]);

  const userIds = {};
  for (const { key, ...u } of data.users) {
    // eslint-disable-next-line no-await-in-loop
    const user = await User.create(u); // create() triggers password hashing
    userIds[key] = user._id;
  }

  const channelIds = {};
  for (const { key, ownerKey, ...c } of data.channels) {
    // eslint-disable-next-line no-await-in-loop
    const channel = await Channel.create({ ...c, owner: userIds[ownerKey] });
    channelIds[key] = channel._id;
    // eslint-disable-next-line no-await-in-loop
    await User.findByIdAndUpdate(userIds[ownerKey], { $push: { channels: channel._id } });
  }

  const videoIds = {};
  for (const { key, channelKey, ...v } of data.videos) {
    const channel = data.channels.find((c) => c.key === channelKey);
    // eslint-disable-next-line no-await-in-loop
    const video = await Video.create({
      ...v,
      channel: channelIds[channelKey],
      uploader: userIds[channel.ownerKey],
    });
    videoIds[key] = video._id;
    // eslint-disable-next-line no-await-in-loop
    await Channel.findByIdAndUpdate(channelIds[channelKey], { $push: { videos: video._id } });
  }

  await Comment.insertMany(
    data.comments.map(({ videoKey, userKey, ...c }) => ({
      ...c,
      video: videoIds[videoKey],
      user: userIds[userKey],
    }))
  );

  console.log(
    `Seeded ${data.users.length} users, ${data.channels.length} channels, ${data.videos.length} videos, ${data.comments.length} comments`
  );
}

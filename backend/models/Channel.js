import mongoose from "mongoose";

const channelSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    // Unique @handle shown under the channel name, e.g. @codewithjohn
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, default: "", maxlength: 1000 },
    channelBanner: { type: String, default: "" },
    channelAvatar: { type: String, default: "" },
    subscribers: { type: Number, default: 0, min: 0 },
    // Users that subscribed - lets us toggle subscribe/unsubscribe per user
    subscribedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
  },
  { timestamps: true }
);

channelSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Channel", channelSchema);

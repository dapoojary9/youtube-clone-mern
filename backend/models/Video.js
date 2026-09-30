import mongoose from "mongoose";
import CATEGORIES from "../config/categories.js";

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true, maxlength: 100 },
    description: { type: String, default: "", maxlength: 5000 },
    // File metadata - the actual media lives on a CDN / YouTube, we store the URLs
    videoUrl: { type: String, required: [true, "Video URL is required"], trim: true },
    thumbnailUrl: { type: String, required: [true, "Thumbnail URL is required"], trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0, min: 0 },
    // Store who liked/disliked so a user can only react once and can toggle
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Base counts carried over from sample/imported data
    baseLikes: { type: Number, default: 0 },
    baseDislikes: { type: Number, default: 0 },
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Total likes/dislikes exposed to clients
videoSchema.virtual("likes").get(function likes() {
  return this.baseLikes + (this.likedBy?.length || 0);
});
videoSchema.virtual("dislikes").get(function dislikes() {
  return this.baseDislikes + (this.dislikedBy?.length || 0);
});

// Text index for fast title search
videoSchema.index({ title: "text" });
videoSchema.index({ category: 1, uploadDate: -1 });

videoSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.id;
    return ret;
  },
});

export default mongoose.model("Video", videoSchema);

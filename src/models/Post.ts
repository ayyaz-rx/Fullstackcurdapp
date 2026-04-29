import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  authorName: String,
}, { timestamps: true });

export const Post =
  mongoose.models.Post || mongoose.model("Post", PostSchema);
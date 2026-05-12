import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthenticatedUser, checkPermission } from "@/lib/permission";
import { PERMISSIONS } from "@/constants/roles";
import mongoose from "mongoose";

async function resolvePostId(context: { params: Promise<{ id: string }> }): Promise<string | null> {
  const params = await context.params;
  const id = params.id;
  return typeof id === "string" && id.trim().length > 0 ? id : null;
}

function isPermissionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("does not have permission")
  );
}

//  GET single post
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const postId = await resolvePostId(context);

    if (!postId) {
      return Response.json({ error: "Invalid post id" }, { status: 400 });
    }

    await connectDB();

    let post;

    if (mongoose.Types.ObjectId.isValid(postId)) {
      post = await Post.findById(postId).populate(
        "authorId",
        "name email"
      );
    } else {
      post = await Post.findOne({
        title: { $regex: `^${postId}$`, $options: "i" },
      }).populate("authorId", "name email");
    }

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    return Response.json({ post });
  } catch {
    return Response.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

//  UPDATE POST
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const postId = await resolvePostId(context);

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return Response.json({ error: "Invalid post id" }, { status: 400 });
    }

    await connectDB();

    const headerToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const cookieHeader = req.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split("; ")
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    const token = headerToken || cookieToken;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getAuthenticatedUser(token);

    if (!user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    checkPermission(user.role, PERMISSIONS.UPDATE_POST);

    const post = await Post.findById(postId);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    const { title, content } = await req.json();

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { title, content, updatedAt: new Date() },
      { new: true }
    );

    return Response.json({
      message: "Post updated",
      post: updatedPost,
    });
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json(
        { error: "Forbidden: No permission to update posts" },
        { status: 403 }
      );
    }

    return Response.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

//  DELETE POST
export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const postId = await resolvePostId(context);

    if (!postId || !mongoose.Types.ObjectId.isValid(postId)) {
      return Response.json({ error: "Invalid post id" }, { status: 400 });
    }

    await connectDB();

    const headerToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const cookieHeader = req.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split("; ")
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    const token = headerToken || cookieToken;

    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getAuthenticatedUser(token);

    if (!user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    checkPermission(user.role, PERMISSIONS.DELETE_POST);

    const post = await Post.findById(postId);

    if (!post) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    await Post.findByIdAndDelete(postId);

    return Response.json({
      message: "Post deleted successfully",
    });
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json(
        { error: "Forbidden: No permission to delete posts" },
        { status: 403 }
      );
    }

    return Response.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}